export interface DistanceScore {
  score: number;
  label: string;
}

export function scoreDistance(distanceKm: number): DistanceScore {
  const d = Math.max(0, distanceKm);

  if (d <= 30) {
    return { score: 100, label: "近" };
  }

  if (d <= 100) {
    const score = 100 + ((d - 30) * (70 - 100)) / (100 - 30);
    return { score: Math.round(score), label: "适中" };
  }

  if (d <= 250) {
    const score = 70 + ((d - 100) * (40 - 70)) / (250 - 100);
    return { score: Math.round(score), label: "较远" };
  }

  return { score: 20, label: "远" };
}
