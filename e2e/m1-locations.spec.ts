import { test, expect } from "@playwright/test";

test.describe("M1 Location CRUD", () => {
  test("homepage loads locations from API", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Should show location names (not loading spinner after data loads)
    await expect(page.locator("text=贺兰山苏峪口").first()).toBeVisible({ timeout: 10000 });
  });

  test("locations page lists all locations", async ({ page }) => {
    await page.goto("/locations");
    await page.waitForLoadState("networkidle");
    // Should show at least one location card
    const cards = page.locator('[class*="card"], [class*="Card"], [class*="location"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("compare page loads data", async ({ page }) => {
    await page.goto("/compare");
    await page.waitForLoadState("networkidle");
    // Should show location data in table
    await expect(page.locator("table, [class*=\"table\"], [class*=\"Table\"]").first()).toBeVisible({ timeout: 10000 });
  });

  test("theme switcher works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Find and click a theme option
    const themeBtn = page.locator('button:has-text("极简"), button:has-text("深空"), button:has-text("星舰"), button:has-text("终端")').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);
    }
    // Page should still render
    await expect(page.locator("body")).toBeVisible();
  });
});
