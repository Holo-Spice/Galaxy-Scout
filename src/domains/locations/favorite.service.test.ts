import { describe, it, expect } from "vitest";
import * as favoriteService from "./favorite.service";
import * as locationService from "./location.service";

describe("favorite.service", () => {
  let locId: string;

  it("toggleFavorite sets is_favorite=true", async () => {
    const loc = await locationService.createLocation({ name: "FavTest1", latitude: 0, longitude: 0 });
    locId = loc.id;
    const result = await favoriteService.toggleFavorite(locId);
    expect(result).toBe(true);
  });

  it("toggleFavorite sets is_favorite=false after second call", async () => {
    const result = await favoriteService.toggleFavorite(locId);
    expect(result).toBe(false);
  });

  it("listFavorites returns only favorited locations", async () => {
    await favoriteService.toggleFavorite(locId);
    const favs = await favoriteService.listFavorites();
    expect(favs.length).toBeGreaterThanOrEqual(1);
    const found = favs.find((f: any) => f.id === locId);
    expect(found).toBeDefined();
    expect(found!.is_favorite).toBe(true);
  });

  it("toggleFavorite throws for non-existent location", async () => {
    await expect(favoriteService.toggleFavorite("nonexistent")).rejects.toThrow("Location not found or deleted");
  });
});
