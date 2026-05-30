#!/usr/bin/env tsx
/**
 * preprocess-viirs.ts
 *
 * Reads a downloaded VIIRS GeoTIFF file, samples radiance values at a 0.01° grid
 * across the China region, and inserts them into the light_pollution_samples table.
 *
 * Usage: npx tsx scripts/preprocess-viirs.ts
 */

import { existsSync, statSync } from "fs";
import { join, resolve } from "path";
import { fromFile } from "geotiff";
import Database from "better-sqlite3";

const FILENAME = "nightlights.average_viirs.v21_m_500m_s_20230101_20231231_go_epsg4326_v20250904.tif";
const PROJECT_ROOT = resolve(__dirname, "..");
const DATA_DIR = join(PROJECT_ROOT, "data", "viirs");
const TIF_PATH = join(DATA_DIR, FILENAME);
const DB_PATH = join(PROJECT_ROOT, "galaxy-scout.db");

/** Minimum acceptable file size (100 MB) to confirm download completed. */
// Zenodo 17294744 file is ~75MB, lower threshold accordingly
const MIN_FILE_SIZE = 50 * 1024 * 1024;

/** China region bounds (degrees). */
const LNG_MIN = 70;
const LNG_MAX = 140;
const LAT_MIN = 15;
const LAT_MAX = 55;

/** Grid step in degrees. */
// 0.05° ≈ 5.5km grid to avoid OOM (0.01° was 28M points)
const GRID_STEP = 0.05;

/** Number of rows per batch INSERT. */
const BATCH_SIZE = 5000;

/** Source metadata. */
const SOURCE = "viirs_2023";
const SOURCE_YEAR = 2023;

interface DarknessThreshold {
  class: number;
  maxRadiance: number;
  label: string;
}

const VIIRS_RADIANCE_THRESHOLDS: DarknessThreshold[] = [
  { class: 1, maxRadiance: 0.5, label: "极暗" },
  { class: 2, maxRadiance: 2, label: "暗" },
  { class: 3, maxRadiance: 5, label: "中等" },
  { class: 4, maxRadiance: 15, label: "较亮" },
  { class: 5, maxRadiance: Infinity, label: "明亮" },
];

function classifyDarkness(radiance: number): number {
  for (const t of VIIRS_RADIANCE_THRESHOLDS) {
    if (radiance < t.maxRadiance) return t.class;
  }
  return 5;
}

/**
 * Estimate SQM (mag/arcsec²) from VIIRS radiance.
 * SQM ≈ 22.0 - 1.5 × log10(radiance + 0.01)
 */
function estimateSqm(radiance: number): number {
  return 22.0 - 1.5 * Math.log10(radiance + 0.01);
}

/**
 * Estimate Bortle class from darkness_class.
 * Bortle 1-2 = pristine, 8-9 = urban center.
 */
function estimateBortle(darknessClass: number): number {
  switch (darknessClass) {
    case 1: return 1;
    case 2: return 3;
    case 3: return 5;
    case 4: return 7;
    case 5: return 9;
    default: return 5;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function randomUUID(): string {
  return crypto.randomUUID();
}

function isoNow(): string {
  return new Date().toISOString();
}

async function main() {
  const startTime = Date.now();

  console.log("=== VIIRS Preprocessing ===\n");

  if (!existsSync(TIF_PATH)) {
    console.error(`ERROR: GeoTIFF not found at ${TIF_PATH}`);
    console.error("Run `npx tsx scripts/download-viirs.ts` first to download the data.");
    process.exit(1);
  }

  const fileSize = statSync(TIF_PATH).size;
  if (fileSize < MIN_FILE_SIZE) {
    console.error(`ERROR: GeoTIFF is only ${formatBytes(fileSize)}, expected ≥${formatBytes(MIN_FILE_SIZE)}.`);
    console.error("The download may be incomplete. Re-run `npx tsx scripts/download-viirs.ts`.");
    process.exit(1);
  }

  console.log(`Input file: ${TIF_PATH}`);
  console.log(`File size:  ${formatBytes(fileSize)}`);

  console.log("\nOpening GeoTIFF...");
  const tiff = await fromFile(TIF_PATH);
  const image = await tiff.getImage();
  const origin = image.getOrigin();
  const resolution = image.getResolution();
  const [tiePointX, tiePointY] = origin;
  const [scaleX, scaleY] = [Math.abs(resolution[0]), Math.abs(resolution[1])];

  const rasterWidth = image.getWidth();
  const rasterHeight = image.getHeight();

  const originLng = tiePointX;
  const originLat = tiePointY;

  console.log(`Raster size: ${rasterWidth} × ${rasterHeight} pixels`);
  console.log(`Pixel scale: ${scaleX}° × ${scaleY}°`);
  console.log(`Origin (top-left): (${originLng}°, ${originLat}°)`);

  const pixelXMin = Math.floor((LNG_MIN - originLng) / scaleX);
  const pixelXMax = Math.ceil((LNG_MAX - originLng) / scaleX);
  const pixelYMin = Math.floor((originLat - LAT_MAX) / scaleY);
  const pixelYMax = Math.ceil((originLat - LAT_MIN) / scaleY);

  const windowX0 = Math.max(0, pixelXMin);
  const windowX1 = Math.min(rasterWidth, pixelXMax);
  const windowY0 = Math.max(0, pixelYMin);
  const windowY1 = Math.min(rasterHeight, pixelYMax);

  const windowWidth = windowX1 - windowX0;
  const windowHeight = windowY1 - windowY0;

  console.log(`\nPixel window: x=[${windowX0}, ${windowX1}), y=[${windowY0}, ${windowY1})`);
  console.log(`Window size: ${windowWidth} × ${windowHeight} pixels`);

  console.log("\nReading raster data for China region...");
  const readStart = Date.now();

  const rasterData = await image.readRasters({
    window: [windowX0, windowY0, windowX1, windowY1],
  });

  const readTime = ((Date.now() - readStart) / 1000).toFixed(1);
  console.log(`Raster read complete in ${readTime}s.`);

  const band0 = rasterData[0] as Float32Array | Uint16Array | Int16Array;
  const nodata = image.getGDALNoData() ?? -99999;

  console.log("\nSampling at 0.01° grid...");

  const latCount = Math.round((LAT_MAX - LAT_MIN) / GRID_STEP) + 1;
  const lngCount = Math.round((LNG_MAX - LNG_MIN) / GRID_STEP) + 1;
  const totalPoints = latCount * lngCount;

  console.log(`Grid: ${lngCount} × ${latCount} = ${totalPoints.toLocaleString()} points`);

  interface Sample {
    id: string;
    latitude: number;
    longitude: number;
    viirs_radiance: number;
    darkness_class: number;
    sqm_estimate: number;
    bortle_estimate: number;
    source: string;
    source_year: number;
    created_at: string;
  }

  const samples: Sample[] = [];
  let skippedNodata = 0;
  let skippedOutOfBounds = 0;
  let processed = 0;
  let lastProgressPct = -1;

  for (let latIdx = 0; latIdx < latCount; latIdx++) {
    const lat = LAT_MIN + latIdx * GRID_STEP;
    const roundedLat = Math.round(lat * 100) / 100;

    for (let lngIdx = 0; lngIdx < lngCount; lngIdx++) {
      const lng = LNG_MIN + lngIdx * GRID_STEP;
      const roundedLng = Math.round(lng * 100) / 100;

      // Convert geographic coords to pixel coords relative to window
      const pixelX = Math.round((lng - originLng) / scaleX) - windowX0;
      const pixelY = Math.round((originLat - lat) / scaleY) - windowY0;

      // Bounds check
      if (pixelX < 0 || pixelX >= windowWidth || pixelY < 0 || pixelY >= windowHeight) {
        skippedOutOfBounds++;
        processed++;
        continue;
      }

      // Read value from raster
      const idx = pixelY * windowWidth + pixelX;
      const rawValue = band0[idx];

      // Skip nodata / invalid
      if (rawValue === undefined || rawValue === nodata || isNaN(rawValue) || rawValue < 0) {
        skippedNodata++;
        processed++;
        continue;
      }

      // Zenodo 17294744 scales values 10x (0-200→0-2000), restore original nW/cm²/sr
      const radiance = rawValue / 10;
      const darknessClass = classifyDarkness(radiance);
      const sqm = estimateSqm(radiance);
      const bortle = estimateBortle(darknessClass);

      samples.push({
        id: randomUUID(),
        latitude: roundedLat,
        longitude: roundedLng,
        viirs_radiance: Math.round(radiance * 1000) / 1000,
        darkness_class: darknessClass,
        sqm_estimate: Math.round(sqm * 100) / 100,
        bortle_estimate: bortle,
        source: SOURCE,
        source_year: SOURCE_YEAR,
        created_at: isoNow(),
      });

      processed++;

      // Progress
      const pct = Math.floor((processed / totalPoints) * 100);
      if (pct >= lastProgressPct + 10) {
        lastProgressPct = pct;
        console.log(`  Sampling: ${pct}% (${samples.length.toLocaleString()} valid samples)`);
      }
    }
  }

  console.log(`\nSampling complete: ${samples.length.toLocaleString()} valid samples`);
  console.log(`  Skipped (nodata): ${skippedNodata.toLocaleString()}`);
  console.log(`  Skipped (out of bounds): ${skippedOutOfBounds.toLocaleString()}`);

  if (samples.length === 0) {
    console.error("\nERROR: No valid samples collected. Check GeoTIFF file integrity.");
    process.exit(1);
  }

  console.log("\nInserting into database...");

  const sqlite = new Database(DB_PATH);

  const deleteResult = sqlite.prepare(
    `DELETE FROM light_pollution_samples WHERE source = ? AND source_year = ?`
  ).run(SOURCE, SOURCE_YEAR);
  console.log(`Cleared ${deleteResult.changes} existing ${SOURCE} samples.`);

  const insertStmt = sqlite.prepare(`
    INSERT INTO light_pollution_samples
      (id, latitude, longitude, viirs_radiance, darkness_class, sqm_estimate, bortle_estimate, source, source_year, created_at)
    VALUES
      (@id, @latitude, @longitude, @viirs_radiance, @darkness_class, @sqm_estimate, @bortle_estimate, @source, @source_year, @created_at)
  `);

  const insertBatch = sqlite.transaction((rows: Sample[]) => {
    for (const row of rows) {
      insertStmt.run(row);
    }
  });

  let inserted = 0;
  const insertStart = Date.now();

  for (let i = 0; i < samples.length; i += BATCH_SIZE) {
    const batch = samples.slice(i, i + BATCH_SIZE);
    insertBatch(batch);
    inserted += batch.length;

    const pct = Math.floor((inserted / samples.length) * 100);
    if (pct % 20 === 0 || inserted === samples.length) {
      console.log(`  Inserted: ${pct}% (${inserted.toLocaleString()} / ${samples.length.toLocaleString()})`);
    }
  }

  const insertTime = ((Date.now() - insertStart) / 1000).toFixed(1);
  console.log(`\nDatabase insert complete in ${insertTime}s.`);

  const totalRadiance = samples.reduce((sum, s) => sum + s.viirs_radiance, 0);
  const avgRadiance = totalRadiance / samples.length;
  const maxRadiance = Math.max(...samples.map((s) => s.viirs_radiance));
  const minRadiance = Math.min(...samples.map((s) => s.viirs_radiance));
  const avgSqm = samples.reduce((sum, s) => sum + s.sqm_estimate, 0) / samples.length;

  const classCounts = [0, 0, 0, 0, 0];
  for (const s of samples) {
    classCounts[s.darkness_class - 1]++;
  }

  const coverageAreaDeg2 = (LNG_MAX - LNG_MIN) * (LAT_MAX - LAT_MIN);
  const coverageAreaKm2 = coverageAreaDeg2 * 111 * 111 * Math.cos(((LAT_MIN + LAT_MAX) / 2) * Math.PI / 180);

  console.log("\n=== Summary ===");
  console.log(`Total samples inserted: ${samples.length.toLocaleString()}`);
  console.log(`Coverage area:          ${coverageAreaDeg2}°² ≈ ${Math.round(coverageAreaKm2).toLocaleString()} km²`);
  console.log(`Grid resolution:        ${GRID_STEP}° (~${Math.round(GRID_STEP * 111)} km)`);
  console.log(`\nRadiance (nW·cm⁻²·sr⁻¹):`);
  console.log(`  Min:     ${minRadiance.toFixed(3)}`);
  console.log(`  Max:     ${maxRadiance.toFixed(3)}`);
  console.log(`  Average: ${avgRadiance.toFixed(3)}`);
  console.log(`\nSQM estimate (mag/arcsec²):`);
  console.log(`  Average: ${avgSqm.toFixed(2)}`);
  console.log(`\nDarkness class distribution:`);
  for (let i = 0; i < 5; i++) {
    const pct = ((classCounts[i] / samples.length) * 100).toFixed(1);
    console.log(`  Class ${i + 1} (${VIIRS_RADIANCE_THRESHOLDS[i].label}): ${classCounts[i].toLocaleString()} (${pct}%)`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nTotal time: ${totalTime}s`);

  sqlite.close();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
