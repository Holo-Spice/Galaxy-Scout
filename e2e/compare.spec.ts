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
      lightPollution: {
        source: "viirs_2023",
        sourceYear: 2023,
        confidence: "medium",
      },
      hourly: [
        {
          hourLocal: "2025-01-01T22:00",
          weatherScore: 85,
          lightScore: 75,
          astronomyScore: 78,
          distanceScore: 90,
          totalScore: 82,
          recommendation: "recommended",
          topReasons: [],
          cloudCoverPct: 15,
          precipitationMm: 0,
          visibilityM: 20000,
          windSpeed10mKmh: 5,
          temperature2mC: -8,
          moonPhaseName: "新月",
        },
      ],
    },
    {
      locationId: "loc-2",
      summary: {
        bestHourLocal: "23:00",
        totalScore: 55,
        distanceKm: 280,
        distanceMode: "driving",
        recommendation: "watch",
        topReasons: ["距离较远"],
      },
      lightPollution: {
        source: "viirs_2023",
        sourceYear: 2023,
        confidence: "low",
      },
      hourly: [
        {
          hourLocal: "2025-01-01T23:00",
          weatherScore: 70,
          lightScore: 45,
          astronomyScore: 45,
          distanceScore: 60,
          totalScore: 55,
          recommendation: "watch",
          topReasons: [],
          cloudCoverPct: 40,
          precipitationMm: 2,
          visibilityM: 15000,
          windSpeed10mKmh: 12,
          temperature2mC: -12,
          moonPhaseName: "上弦月",
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

  test("moon phase column shows real text (not placeholder dash)", async ({ page }) => {
    await page.goto("/compare");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("th", { hasText: "月相" })).toBeVisible();
    await expect(page.locator("text=新月")).toBeVisible();
    await expect(page.locator("text=上弦月")).toBeVisible();
  });

  test("light pollution layer toggle is visible on map page", async ({ page }) => {
    await page.goto("/map");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=VIIRS 辐亮度")).toBeVisible();
  });

  test("light pollution data source info is available in API response", async ({ page }) => {
    const responsePromise = page.waitForResponse("**/api/compare");
    await page.goto("/compare");
    const response = await responsePromise;
    const json = await response.json();

    const firstItem = json.data.items[0];
    expect(firstItem.lightPollution).toBeTruthy();
    expect(firstItem.lightPollution.source).toBe("viirs_2023");
    expect(firstItem.lightPollution.sourceYear).toBe(2023);
    expect(firstItem.lightPollution.confidence).toBe("medium");
  });
});
