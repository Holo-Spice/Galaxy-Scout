/**
 * 地理坐标纯函数：Haversine 距离、坐标校验、精度控制
 *
 * 注意：Haversine 计算的是大圆直线距离，不等于驾车距离。
 * 驾车距离需要路线服务（P1 阶段接入）。
 */

const EARTH_RADIUS_KM = 6371;

/** 角度转弧度 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine 公式计算两点间大圆直线距离（单位：公里）
 *
 * @param lat1 - 起点纬度
 * @param lon1 - 起点经度
 * @param lat2 - 终点纬度
 * @param lon2 - 终点经度
 * @returns 直线距离，单位公里
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * WGS84 坐标合法性校验
 *
 * @param lat - 纬度（-90 ~ 90）
 * @param lon - 经度（-180 ~ 180）
 * @returns 是否合法
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * 坐标精度控制（四舍五入到指定小数位）
 *
 * @param value - 坐标值
 * @param decimals - 保留小数位数，默认 6（约 0.11 米精度）
 * @returns 四舍五入后的值
 */
export function roundCoordinate(value: number, decimals: number = 6): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
