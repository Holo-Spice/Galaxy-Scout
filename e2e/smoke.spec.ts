import { test, expect } from "@playwright/test";

test("homepage shows Galaxy Scout title", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=Galaxy Scout")).toBeVisible();
});
