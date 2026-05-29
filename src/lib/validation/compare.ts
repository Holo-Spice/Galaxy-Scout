import { z } from "zod";

export const compareRequestSchema = z.object({
  locationIds: z
    .array(z.string().min(1, "location id must not be empty"))
    .min(1, "locationIds must contain at least one location"),

  origin: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      name: z.string().optional(),
    })
    .optional(),

  dateLocal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dateLocal must be in YYYY-MM-DD format"),

  startHourLocal: z
    .number()
    .int("startHourLocal must be an integer")
    .min(0, "startHourLocal must be >= 0")
    .max(23, "startHourLocal must be <= 23"),

  endHourLocal: z
    .number()
    .int("endHourLocal must be an integer")
    .min(0, "endHourLocal must be >= 0")
    .max(23, "endHourLocal must be <= 23"),

  timezone: z.string().min(1, "timezone must not be empty"),

  weights: z
    .object({
      light: z.number().min(0).max(1),
      weather: z.number().min(0).max(1),
      astronomy: z.number().min(0).max(1),
      distance: z.number().min(0).max(1),
    })
    .optional(),
});

export type CompareRequestInput = z.infer<typeof compareRequestSchema>;
