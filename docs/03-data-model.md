# 数据模型

本文定义逻辑模型。具体实现可用 SQL、Drizzle 或 Prisma，但字段语义必须一致。

## `locations`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | ULID 或 UUID |
| `name` | string | 地点名称 |
| `latitude` | number | WGS84 纬度 |
| `longitude` | number | WGS84 经度 |
| `elevation_m` | number/null | 海拔，米 |
| `timezone` | string/null | IANA timezone |
| `region` | string/null | 区域 |
| `access_note` | text/null | 停车、步行、门禁 |
| `foreground_note` | text/null | 前景、方向、遮挡 |
| `safety_note` | text/null | 夜间风险 |
| `is_favorite` | boolean | 是否收藏 |
| `personal_rating` | number/null | 1 到 5 |
| `created_at` | datetime | UTC |
| `updated_at` | datetime | UTC |
| `deleted_at` | datetime/null | 软删除 |

索引：

- `(latitude, longitude)`
- `(is_favorite, updated_at)`
- `deleted_at`

## `location_tags`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键 |
| `location_id` | string | 地点 id |
| `tag` | string | 标签 |
| `created_at` | datetime | 创建时间 |

约束：

- `(location_id, tag)` 唯一。
- `tag` 保存前 trim，长度 1 到 30。

## `spot_images`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键 |
| `location_id` | string | 地点 id |
| `storage_key` | string | 原图路径 |
| `thumbnail_key` | string/null | 缩略图路径 |
| `caption` | string/null | 图片说明 |
| `azimuth_deg` | number/null | 拍摄方向，0 到 360 |
| `taken_at` | datetime/null | 拍摄时间 |
| `is_cover` | boolean | 是否封面 |
| `status` | enum | `active` / `hidden` / `deleted` |
| `created_at` | datetime | 创建时间 |

约束：同一地点最多一个 active 封面图。

## `weather_hourly_cache` ✅ 已实现（M2）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键 |
| `location_hash` | string | 坐标 hash |
| `provider` | string | `open-meteo` |
| `forecast_hour_utc` | datetime | 预报小时 |
| `fetched_at` | datetime | 拉取时间 |
| `expires_at` | datetime | 过期时间 |
| `temperature_2m_c` | number/null | 温度 |
| `relative_humidity_2m_pct` | number/null | 相对湿度 |
| `dew_point_2m_c` | number/null | 露点 |
| `precipitation_probability_pct` | number/null | 降水概率 |
| `precipitation_mm` | number/null | 降水量 |
| `cloud_cover_pct` | number/null | 总云量 |
| `cloud_cover_low_pct` | number/null | 低云 |
| `cloud_cover_mid_pct` | number/null | 中云 |
| `cloud_cover_high_pct` | number/null | 高云 |
| `visibility_m` | number/null | 能见度 |
| `wind_speed_10m_kmh` | number/null | 风速 |
| `wind_gusts_10m_kmh` | number/null | 阵风 |
| `weather_code` | number/null | WMO 天气代码 |

## `light_pollution_samples`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键 |
| `location_hash` | string | 坐标 hash |
| `source` | string | `eog-vnl` / `world-atlas` / `black-marble` |
| `source_year` | number/null | 数据年份 |
| `radiance_nw_cm2_sr` | number/null | VIIRS 辐亮度 |
| `sqm_mag_arcsec2` | number/null | 天空亮度 |
| `bortle_estimate` | number/null | 估算 Bortle |
| `darkness_class` | string | `excellent` / `good` / `fair` / `poor` / `bad` |
| `confidence` | string | `high` / `medium` / `low` |
| `sampled_at` | datetime | 查询时间 |

禁止事项：

- 不得把 `radiance_nw_cm2_sr` 当作 SQM。
- 不得把估算 Bortle 显示成实测 Bortle。

## `astronomy_hourly_cache`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键 |
| `location_hash` | string | 坐标 hash |
| `hour_utc` | datetime | UTC 小时 |
| `sun_altitude_deg` | number | 太阳高度 |
| `moon_altitude_deg` | number | 月亮高度 |
| `moon_illumination_pct` | number | 月面照亮比例 |
| `moon_phase_deg` | number | 月相角 |
| `galactic_center_altitude_deg` | number/null | 银河核心高度 |
| `galactic_center_azimuth_deg` | number/null | 银河核心方位 |
| `is_astronomical_night` | boolean | 是否天文夜 |
| `created_at` | datetime | 计算时间 |

## `compare_sessions`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键 |
| `name` | string/null | 对比名称 |
| `origin_latitude` | number/null | 出发点纬度 |
| `origin_longitude` | number/null | 出发点经度 |
| `date_local` | date | 本地日期 |
| `start_hour_local` | number | 开始小时 |
| `end_hour_local` | number | 结束小时，允许跨午夜 |
| `location_ids_json` | json | 地点 id 列表 |
| `score_weights_json` | json | 权重快照 |
| `created_at` | datetime | 创建时间 |

## 失效规则

- 地点坐标变更：天气、光污染、天文、距离缓存全部失效。
- 出发点变更：距离缓存失效。
- 评分算法版本变更：对比结果和解释失效。
- 光污染数据源年份变更：光污染样本失效。

