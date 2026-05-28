import { describe, it, expect } from "vitest";
import * as tagService from "./tag.service";
import * as locationService from "./location.service";

describe("tag.service", () => {
  let locId: string;

  beforeAll(async () => {
    const loc = await locationService.createLocation({ name: "TagTest", latitude: 0, longitude: 0 });
    locId = loc.id;
  });

  it("adds a tag", async () => {
    await tagService.addTag(locId, "sunmit");
    const tags = await tagService.getTags(locId);
    expect(tags).toContain("sunmit");
  });

  it("trims whitespace from tag", async () => {
    await tagService.addTag(locId, "  trimmed  ");
    const tags = await tagService.getTags(locId);
    expect(tags).toContain("trimmed");
    expect(tags).not.toContain("  trimmed  ");
  });

  it("rejects empty tag", async () => {
    await expect(tagService.addTag(locId, "   ")).rejects.toThrow("Tag must be 1-30 characters");
  });

  it("removes a tag", async () => {
    await tagService.addTag(locId, "removeMe");
    await tagService.removeTag(locId, "removeMe");
    const tags = await tagService.getTags(locId);
    expect(tags).not.toContain("removeMe");
  });

  it("ignores duplicate tag insertion", async () => {
    await tagService.addTag(locId, "uniqueTag");
    await tagService.addTag(locId, "uniqueTag");
    const tags = await tagService.getTags(locId);
    const count = tags.filter(t => t === "uniqueTag").length;
    expect(count).toBe(1);
  });
});
