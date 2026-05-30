#!/usr/bin/env tsx

import { createWriteStream, existsSync, mkdirSync, statSync } from "fs";
import { join, resolve } from "path";
import https from "https";

const DOWNLOAD_URL =
  "https://zenodo.org/records/17294744/files/nightlights.average_viirs.v21_m_500m_s_20230101_20231231_go_epsg4326_v20250904.tif";

const FILENAME =
  "nightlights.average_viirs.v21_m_500m_s_20230101_20231231_go_epsg4326_v20250904.tif";

const PROJECT_ROOT = resolve(__dirname, "..");
const DATA_DIR = join(PROJECT_ROOT, "data", "viirs");
const OUTPUT_PATH = join(DATA_DIR, FILENAME);

const MIN_FILE_SIZE = 10 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);

    https
      .get(url, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();
          downloadFile(response.headers.location, destPath)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          reject(
            new Error(`Download failed with status ${response.statusCode}`)
          );
          return;
        }

        const totalBytes = parseInt(
          response.headers["content-length"] || "0",
          10
        );
        let downloadedBytes = 0;
        let lastProgress = 0;

        console.log(`Downloading VIIRS data...`);
        if (totalBytes > 0) {
          console.log(`Total size: ${formatBytes(totalBytes)}`);
        }

        response.on("data", (chunk: Buffer) => {
          downloadedBytes += chunk.length;

          if (totalBytes > 0) {
            const progress = Math.floor((downloadedBytes / totalBytes) * 100);
            if (progress >= lastProgress + 5) {
              lastProgress = progress;
              console.log(
                `Progress: ${progress}% (${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)})`
              );
            }
          } else {
            if (downloadedBytes % (5 * 1024 * 1024) < chunk.length) {
              console.log(`Downloaded: ${formatBytes(downloadedBytes)}`);
            }
          }
        });

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`\nDownload complete: ${formatBytes(downloadedBytes)}`);
          resolve();
        });
      })
      .on("error", (err) => {
        file.close();
        reject(err);
      });

    file.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created directory: ${DATA_DIR}`);
  }

  if (existsSync(OUTPUT_PATH)) {
    const stats = statSync(OUTPUT_PATH);
    if (stats.size >= MIN_FILE_SIZE) {
      console.log(
        `File already exists (${formatBytes(stats.size)}): ${OUTPUT_PATH}`
      );
      console.log("Skipping download. Delete the file to re-download.");
      return;
    }
    console.log(
      `Existing file is too small (${formatBytes(stats.size)}), re-downloading...`
    );
  }

  console.log(`Source: ${DOWNLOAD_URL}`);
  console.log(`Destination: ${OUTPUT_PATH}\n`);

  await downloadFile(DOWNLOAD_URL, OUTPUT_PATH);

  const stats = statSync(OUTPUT_PATH);
  console.log(`\nFile size: ${formatBytes(stats.size)}`);

  if (stats.size < MIN_FILE_SIZE) {
    throw new Error(
      `File too small (${formatBytes(stats.size)}). Expected at least ${formatBytes(MIN_FILE_SIZE)}. Download may have failed.`
    );
  }

  console.log("✓ VIIRS data downloaded and validated successfully.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
