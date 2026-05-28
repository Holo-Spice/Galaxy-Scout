import { describe, it, expect, beforeAll } from "vitest";
import * as imageService from "./image.service";
import * as locationService from "../locations/location.service";

describe("image.service", () => {
  let locId: string;

  beforeAll(async () => {
    const list = await locationService.listLocations();
    if (list.length > 0) {
      locId = list[0].id;
    } else {
      const loc = await locationService.createLocation({ name: "ImageTest", latitude: 0, longitude: 0 });
      locId = loc.id;
    }
  });

  it("rejects non-image MIME type", async () => {
    const file = new File(["test"], "test.txt", { type: "text/html" });
    await expect(imageService.uploadImage(locId, file)).rejects.toThrow("Invalid file type");
  });

  it("rejects oversized file", async () => {
    const large = new Uint8Array(11 * 1024 * 1024);
    const file = new File([large], "large.jpg", { type: "image/jpeg" });
    await expect(imageService.uploadImage(locId, file)).rejects.toThrow("File too large");
  });

  it("uploads valid image and writes file", async () => {
    const file = new File(["fake-image-data"], "test.jpg", { type: "image/jpeg" });
    const result = await imageService.uploadImage(locId, file);
    expect(result.id).toBeDefined();
    expect(result.storage_key).toMatch(/\.(jpg|jpeg|png|webp)$/);
    expect(result.url).toContain("/uploads/");
    expect(result.status).toBe("active");
  });

  it("lists images for a location", async () => {
    const list = await imageService.listImages(locId);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it("soft-deletes an image", async () => {
    const file = new File(["data"], "del.jpg", { type: "image/jpeg" });
    const img = await imageService.uploadImage(locId, file);
    await imageService.deleteImage(img.id);
    const list = await imageService.listImages(locId);
    const found = list.find((i: any) => i.id === img.id);
    expect(found).toBeUndefined();
  });

  it("sets cover image and unsets old cover", async () => {
    const f1 = new File(["a"], "a.jpg", { type: "image/jpeg" });
    const f2 = new File(["b"], "b.jpg", { type: "image/jpeg" });
    const img1 = await imageService.uploadImage(locId, f1);
    const img2 = await imageService.uploadImage(locId, f2);

    await imageService.updateImage(img1.id, { is_cover: true });
    let updated = await imageService.listImages(locId);
    expect(updated.find((i: any) => i.id === img1.id)!.is_cover).toBe(true);

    await imageService.updateImage(img2.id, { is_cover: true });
    updated = await imageService.listImages(locId);
    expect(updated.find((i: any) => i.id === img1.id)!.is_cover).toBe(false);
    expect(updated.find((i: any) => i.id === img2.id)!.is_cover).toBe(true);
  });
});
