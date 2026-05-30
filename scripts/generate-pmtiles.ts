#!/usr/bin/env tsx
/**
 * Reads VIIRS light pollution samples from SQLite, converts to GeoJSON,
 * and optionally generates PMTiles for MapLibre overlay.
 *
 * Usage: npx tsx scripts/generate-pmtiles.ts
 */

import { existsSync, mkdirSync, writeFileSync, statSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";
import Database from "better-sqlite3";

const PROJECT_ROOT = resolve(__dirname, "..");
const DB_PATH = join(PROJECT_ROOT, "galaxy-scout.db");
const TILES_DIR = join(PROJECT_ROOT, "public", "tiles");
const GEOJSON_PATH = join(TILES_DIR, "light-pollution.geojson");
const PMTILES_PATH = join(TILES_DIR, "viirs-light-pollution.pmtiles");

interface SampleRow {
  latitude: number;
  longitude: number;
  viirs_radiance: number | null;
  darkness_class: number | null;
  sqm_estimate: number | null;
  bortle_estimate: number | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function hasCommand(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const startTime = Date.now();

  console.log("=== Generate PMTiles / GeoJSON ===\n");

  if (!existsSync(DB_PATH)) {
    console.error(`ERROR: Database not found at ${DB_PATH}`);
    console.error(
      "Run `npx tsx scripts/download-viirs.ts && npx tsx scripts/preprocess-viirs.ts` first."
    );
    process.exit(1);
  }

  if (!existsSync(TILES_DIR)) {
    mkdirSync(TILES_DIR, { recursive: true });
    console.log(`Created output directory: ${TILES_DIR}`);
  }

  console.log("Opening database...");
  const db = new Database(DB_PATH, { readonly: true });

  const countRow = db
    .prepare("SELECT COUNT(*) as cnt FROM light_pollution_samples")
    .get() as { cnt: number };
  const totalSamples = countRow.cnt;

  if (totalSamples === 0) {
    console.error(
      "ERROR: light_pollution_samples table is empty. Run preprocess-viirs.ts first."
    );
    db.close();
    process.exit(1);
  }

  console.log(`Found ${totalSamples.toLocaleString()} samples in database.\n`);

  console.log("Querying samples...");
  const queryStart = Date.now();

  const rows = db
    .prepare(
      `SELECT latitude, longitude, viirs_radiance, darkness_class, sqm_estimate, bortle_estimate
       FROM light_pollution_samples
       ORDER BY latitude, longitude`
    )
    .all() as SampleRow[];

  const queryTime = ((Date.now() - queryStart) / 1000).toFixed(1);
  console.log(`Query completed in ${queryTime}s`);
  db.close();

  console.log("\nBuilding GeoJSON FeatureCollection...");
  const buildStart = Date.now();

  let withRadiance = 0;
  let withDarkness = 0;
  let withSqm = 0;
  let radianceSum = 0;
  let radianceCount = 0;

  const features = rows.map((row) => {
    if (row.viirs_radiance != null) {
      withRadiance++;
      radianceSum += row.viirs_radiance;
      radianceCount++;
    }
    if (row.darkness_class != null) withDarkness++;
    if (row.sqm_estimate != null) withSqm++;

    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [row.longitude, row.latitude],
      },
      properties: {
        radiance: row.viirs_radiance,
        darkness_class: row.darkness_class,
        sqm_estimate: row.sqm_estimate,
        bortle_estimate: row.bortle_estimate,
      },
    };
  });

  const geojson = {
    type: "FeatureCollection" as const,
    features,
  };

  const geojsonString = JSON.stringify(geojson);
  const buildTime = ((Date.now() - buildStart) / 1000).toFixed(1);
  console.log(`GeoJSON built in ${buildTime}s`);

  console.log("\nWriting GeoJSON file...");
  writeFileSync(GEOJSON_PATH, geojsonString, "utf-8");
  const fileSize = Buffer.byteLength(geojsonString, "utf-8");
  console.log(`Written: ${GEOJSON_PATH} (${formatBytes(fileSize)})`);

  const hasTippecanoe = hasCommand("tippecanoe");
  const hasPmtiles = hasCommand("pmtiles");

  if (hasTippecanoe && hasPmtiles) {
    console.log("\ntippecanoe + pmtiles found. Converting to PMTiles...");
    const mbtilesTmp = join(TILES_DIR, "light-pollution.mbtiles");

    try {
      execSync(
        `tippecanoe -o "${mbtilesTmp}" --no-feature-limit --no-tile-size-limit --generate-ids -l light-pollution "${GEOJSON_PATH}"`,
        { stdio: "inherit" }
      );

      execSync(`pmtiles convert "${mbtilesTmp}" "${PMTILES_PATH}"`, {
        stdio: "inherit",
      });

      execSync(`rm -f "${mbtilesTmp}"`);

      const pmtilesSize = statSync(PMTILES_PATH).size;
      console.log(
        `PMTiles generated: ${PMTILES_PATH} (${formatBytes(pmtilesSize)})`
      );
    } catch (err) {
      console.warn(
        "\nWARNING: PMTiles conversion failed. GeoJSON is still available as fallback."
      );
      console.warn(`Error: ${err}`);
    }
  } else {
    console.log(
      "\ntippecanoe/pmtiles not found. GeoJSON will be used directly by MapLibre."
    );
    console.log(
      "To enable PMTiles: install tippecanoe and pmtiles CLI tools."
    );
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgRadiance =
    radianceCount > 0 ? (radianceSum / radianceCount).toFixed(2) : "N/A";

  console.log("\n=== Summary ===");
  console.log(`Total features:    ${rows.length.toLocaleString()}`);
  console.log(`With radiance:     ${withRadiance.toLocaleString()}`);
  console.log(`With darkness:     ${withDarkness.toLocaleString()}`);
  console.log(`With SQM estimate: ${withSqm.toLocaleString()}`);
  console.log(`Avg radiance:      ${avgRadiance} nW/cm²/sr`);
  console.log(`GeoJSON size:      ${formatBytes(fileSize)}`);
  console.log(`Output:            ${GEOJSON_PATH}`);
  if (existsSync(PMTILES_PATH)) {
    console.log(`PMTiles:           ${PMTILES_PATH}`);
  }
  console.log(`Total time:        ${totalTime}s`);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
