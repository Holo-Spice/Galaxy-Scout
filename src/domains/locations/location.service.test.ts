import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

import * as service from "./location.service";

describe("location.service", () => {
  let createdId: string;

  describe("createLocation", () => {
    it("creates with valid input", async () => {
      const loc = await service.createLocation({ name: "Test Peak", latitude: 30.0, longitude: 120.0, elevation_m: 1000 });
      expect(loc.id).toBeDefined();
      expect(loc.name).toBe("Test Peak");
      expect(loc.latitude).toBe(30.0);
      createdId = loc.id;
    });

    it("rejects empty name via Zod validation", async () => {
      await expect(service.createLocation({ name: "", latitude: 0, longitude: 0 } as any)).rejects.toThrow();
    });

    it("rejects invalid latitude via Zod validation", async () => {
      await expect(service.createLocation({ name: "test", latitude: 999, longitude: 0 } as any)).rejects.toThrow();
    });
  });

  describe("listLocations", () => {
    it("returns non-deleted locations", async () => {
      const list = await service.listLocations();
      expect(list.length).toBeGreaterThanOrEqual(5);
    });

    it("excludes soft-deleted locations", async () => {
      const temp = await service.createLocation({ name: "TempDelete", latitude: 0, longitude: 0 });
      await service.deleteLocation(temp.id);
      const list = await service.listLocations();
      const found = list.find(l => l.id === temp.id);
      expect(found).toBeUndefined();
    });
  });

  describe("getLocationById", () => {
    it("returns location for valid id", async () => {
      const loc = await service.getLocationById(createdId);
      expect(loc).not.toBeNull();
      expect(loc!.name).toBe("Test Peak");
    });

    it("returns null for non-existent id", async () => {
      const loc = await service.getLocationById("nonexistent-id");
      expect(loc).toBeNull();
    });
  });

  describe("updateLocation", () => {
    it("updates fields", async () => {
      const updated = await service.updateLocation(createdId, { name: "Updated Peak" });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("Updated Peak");
    });

    it("returns null for non-existent id", async () => {
      const result = await service.updateLocation("nonexistent-id", { name: "nope" });
      expect(result).toBeNull();
    });
  });

  describe("deleteLocation", () => {
    it("soft-deletes a location", async () => {
      const result = await service.deleteLocation(createdId);
      expect(result).not.toBeNull();
    });

    it("returns null for already-deleted location", async () => {
      const result = await service.deleteLocation(createdId);
      expect(result).toBeNull();
    });
  });
});
