# 外部数据源

## 天气：Open-Meteo ✅ 已实现（M2）

接口：

```text
GET https://api.open-meteo.com/v1/forecast
```

推荐 hourly 字段：

```text
temperature_2m,relative_humidity_2m,dew_point_2m,
precipitation_probability,precipitation,weather_code,
cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,
visibility,wind_speed_10m,wind_gusts_10m
```

推荐参数：

```text
timezone=auto
forecast_days=7
wind_speed_unit=kmh
precipitation_unit=mm
cell_selection=land
```

实现要求：

- 多地点请求应合并坐标，避免逐地点请求。
- 请求前把经纬度四舍五入到 4 到 5 位小数生成 `location_hash`。
- 外部响应必须 normalize 成内部字段。
- provider 失败时优先返回未过期缓存；如果只有过期缓存，返回并标记 `stale=true`。
- UI 必须显示天气来源和更新时间。

## 光污染 ✅ 已实现（M4）

已接入数据：NOAA/EOG VIIRS Nighttime Lights VNL 2023。

处理流程：

```text
下载 GeoTIFF
  -> 校验 CRS、分辨率、nodata
  -> 按目标区域裁剪
  -> 生成点查询索引（PMTiles）
  -> 保存 source、year、resolution、license 元数据
```

相关命令：

- `npm run preprocess:viirs` — 预处理 VIIRS GeoTIFF，生成点查询索引。
- `npm run generate-pmtiles` — 生成 PMTiles 矢量瓦片，用于地图叠加。

强制规则：

- VIIRS 代表夜间灯光辐亮度，不等于实际天空亮度。
- 只有 VIIRS 时，UI 显示"光污染指数"或"辐亮度"，不要显示为实测 Bortle。
- Bortle 只能标记为 `estimate`。
- 光污染数据必须显示来源年份和可信度。

## 天文计算 ✅ 已实现（M3）

推荐库：Astronomy Engine。

需要计算：

- 日落、天文昏影开始/结束。
- 太阳高度。
- 月升、月落、月亮高度、月相、照亮比例。
- 银河核心高度和方位。

规则：

- 计算输入使用 UTC 和 WGS84。
- 展示按地点 timezone 转换。
- `is_astronomical_night = sun_altitude_deg <= -18`。
- `moon_effective = moon_altitude_deg > 0 && moon_illumination_pct > 10`。
- 银河核心可见窗口建议为天文夜且 `galactic_center_altitude_deg >= 10`。

## 地图

推荐 MapLibre GL JS。

底图选项：

- OpenStreetMap 在线瓦片：适合低频开发和个人使用，必须保留 attribution，不能批量预取。
- Protomaps/PMTiles：适合长期自托管和离线。
- 商业瓦片：访问量变大时使用。

地图要求：

- 坐标内部统一 WGS84。
- 如果使用国内地图服务，必须明确 GCJ-02/BD-09 转换边界。
- 地图 attribution 不得隐藏或遮挡。

## 距离和路线

MVP 使用 Haversine 直线距离：

```text
R = 6371.0088 km
dLat = radians(lat2 - lat1)
dLon = radians(lon2 - lon1)
a = sin(dLat/2)^2 + cos(lat1) * cos(lat2) * sin(dLon/2)^2
distance = 2 * R * atan2(sqrt(a), sqrt(1-a))
```

P1 路线服务候选：

- 自建 OSRM：适合个人长期使用，需要 OSM 数据和服务器。
- Mapbox Directions/Matrix：接入快，但有费用和授权限制。
- 高德/百度：国内路线体验好，但坐标系、Key 和合规需单独处理。

禁止事项：

- 路线服务失败时，不得用直线距离冒充驾车距离。
- UI 必须明确区分“直线距离”和“驾车距离”。

## 参考链接

- Open-Meteo Docs：<https://open-meteo.com/en/docs>
- Open-Meteo Terms：<https://open-meteo.com/en/terms>
- NOAA/EOG VIIRS：<https://eogdata.mines.edu/products/vnl/>
- NASA Nighttime Lights：<https://www.earthdata.nasa.gov/topics/human-dimensions/nighttime-lights>
- Astronomy Engine：<https://github.com/cosinekitty/astronomy>
- MapLibre GL JS：<https://maplibre.org/maplibre-gl-js/docs/>
- OSM Tile Policy：<https://operations.osmfoundation.org/policies/tiles/>
- OSRM API：<https://project-osrm.org/docs/v5.24.0/api/>

