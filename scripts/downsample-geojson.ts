#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const IN = join(__dirname, "..", "public", "tiles", "light-pollution.geojson");
const OUT = join(__dirname, "..", "public", "tiles", "light-pollution-lite.geojson");
const KEEP_EVERY = 10; // Keep 1 out of every N features

if (!existsSync(IN)) {
  console.error("ERROR: light-pollution.geojson not found. Run generate-pmtiles first.");
  process.exit(1);
}

console.log("Reading GeoJSON...");
const raw = readFileSync(IN, "utf-8");
const data = JSON.parse(raw);

console.log(`Original features: ${data.features.length}`);
const subset = data.features.filter((_: unknown, i: number) => i % KEEP_EVERY === 0);
console.log(`Subsampled features: ${subset.length} (1/${KEEP_EVERY})`);

data.features = subset;
const outJson = JSON.stringify(data);
console.log(`Output size: ${(outJson.length / 1024 / 1024).toFixed(1)} MB`);

writeFileSync(OUT, outJson);
console.log(`Written: ${OUT}`);
