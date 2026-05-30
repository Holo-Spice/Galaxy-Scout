import type { LightQueryResult } from "./types";

const cache = new Map<string, LightQueryResult>();

export function getCachedLightPollution(
  hash: string,
): LightQueryResult | undefined {
  return cache.get(hash);
}

export function setCachedLightPollution(
  hash: string,
  result: LightQueryResult,
): void {
  cache.set(hash, result);
}

export function clearLightPollutionCache(): void {
  cache.clear();
}
