import { test, expect } from "@playwright/test";

const mockLocations = [
  {
    id: "loc-1",
    name: "贺兰山苏峪口",
    latitude: 38.60,
    longitude: 106.00,
    elevation_m: 2100,
    timezone: "Asia/Shanghai",
    region: "宁夏",
    access_note: null,
    foreground_note: null,
    safety_note: null,
    is_favorite: true,
    personal_rating: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    deleted_at: null,
  },
  {
    id: "loc-2",
    name: "腾格里沙漠",
    latitude: 37.50,
    longitude: 104.80,
    elevation_m: 1300,
    timezone: "Asia/Shanghai",
    region: "内蒙古",
    access_note: null,
    foreground_note: null,
    safety_note: null,
    is_favorite: false,
    personal_rating: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    deleted_at: null,
  },
];

const mockCompareResult = {
  bestLocationId: "loc-1",
  items: [
    {
      locationId: "loc-1",
      summary: {
        bestHourLocal: "22:00",
        totalScore: 82,
        distanceKm: 120,
        distanceMode: "driving",
        recommendation: "recommended",
        topReasons: ["云量低", "距离近"],
      },
      lightPollution: null,
      hourly: [
        {
          hourLocal: "2025-01-01T22:00",
          weatherScore: 85,
          lightScore: 0,
          astronomyScore: 0,
          distanceScore: 90,
          totalScore: 82,
          recommendation: "recommended",
          topReasons: [],
          cloudCoverPct: 15,
          precipitationMm: 0,
          visibilityM: 20000,
          windSpeed10mKmh: 5,
          temperature2mC: -8,
        },
      ],
    },
    {
      locationId: "loc-2",
      summary: {
        bestHourLocal: "23:00",
        totalScore: 68,
        distanceKm: 280,
        distanceMode: "driving",
        recommendation: "watch",
        topReasons: ["距离较远"],
      },
      lightPollution: null,
      hourly: [
        {
          hourLocal: "2025-01-01T23:00",
          weatherScore: 70,
          lightScore: 0,
          astronomyScore: 0,
          distanceScore: 60,
          totalScore: 68,
          recommendation: "watch",
          topReasons: [],
          cloudCoverPct: 40,
          precipitationMm: 2,
          visibilityM: 15000,
          windSpeed10mKmh: 12,
          temperature2mC: -12,
        },
      ],
    },
  ],
  meta: {
    generatedAt: "2025-01-01T18:00:00Z",
    weatherSource: "Open-Meteo",
    staleLocationIds: [],
  },
};

test.describe("Compare page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/locations", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: mockLocations }),
      }),
    );

    await page.route("**/api/compare", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: mockCompareResult }),
      }),
    );
  });

  test("loads and displays location list", async ({ page }) => {
    await page.goto("/compare");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=贺兰山苏峪口")).toBeVisible();
    await expect(page.locator("text=腾格里沙漠")).toBeVisible();
  });

  test("cloud cover column shows real data (not 0)", async ({ page }) => {
    await page.goto("/compare");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=15%")).toBeVisible();
    await expect(page.locator("text=40%")).toBeVisible();
  });

  test("unconnected columns (Bortle / VIIRS) show placeholder dash", async ({ page }) => {
    await page.goto("/compare");
    await page.waitForLoadState("networkidle");

    const headers = page.locator("th");
    await expect(headers.filter({ hasText: "Bortle" })).toBeVisible();
    await expect(headers.filter({ hasText: "VIIRS" })).toBeVisible();

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBe(2);

    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator("td");
      const cellText = await cells.allInnerTexts();
      expect(cellText[3]).toContain("\u2014");
      expect(cellText[4]).toContain("\u2014");
    }
  });

  test("weather source information is visible", async ({ page }) => {
    await page.goto("/compare");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=天气数据来源")).toBeVisible();
    await expect(page.locator("text=Open-Meteo")).toBeVisible();
  });
});
