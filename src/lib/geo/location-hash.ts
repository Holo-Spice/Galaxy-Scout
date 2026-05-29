/**
 * 坐标哈希工具：将经纬度转换为确定性字符串标识
 *
 * 用途：缓存键、去重、数据库索引等场景
 * 注意：这不是加密哈希，仅是格式化坐标字符串
 */

import { z } from "zod";

export const LocationHashInput = z.object({
  lat: z.number().min(-90, "latitude must be >= -90").max(90, "latitude must be <= 90"),
  lon: z.number().min(-180, "longitude must be >= -180").max(180, "longitude must be <= 180"),
  decimals: z.number().int().min(2, "decimals must be >= 2").max(6, "decimals must be <= 6").optional().default(4),
});

export type LocationHashInputType = z.infer<typeof LocationHashInput>;

/**
 * 生成坐标哈希字符串
 *
 * @param lat - 纬度（-90 ~ 90）
 * @param lon - 经度（-180 ~ 180）
 * @param decimals - 保留小数位数，默认 4（约 11 米精度）
 * @returns 坐标哈希字符串，格式 "lat,lon"
 * @throws {Error} 参数不合法时抛出错误
 */
export function generateLocationHash(
  lat: number,
  lon: number,
  decimals: number = 4,
): string {
  const result = LocationHashInput.safeParse({ lat, lon, decimals });

  if (!result.success) {
    throw new Error(result.error.errors.map((e) => e.message).join("; "));
  }

  const { lat: validLat, lon: validLon, decimals: validDecimals } = result.data;

  const latStr = validLat.toFixed(validDecimals);
  const lonStr = validLon.toFixed(validDecimals);

  return `${latStr},${lonStr}`;
}
