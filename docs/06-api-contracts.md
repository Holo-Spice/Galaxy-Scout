# API 契约

API 使用 JSON。所有输入必须经过 schema 校验，所有输出保持稳定字段名。

## 通用响应

成功：

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01",
    "generatedAt": "2026-04-30T12:00:00Z"
  }
}
```

失败：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request.",
    "details": {}
  },
  "meta": {
    "requestId": "req_01"
  }
}
```

## 地点 API

```text
GET /api/locations
POST /api/locations
GET /api/locations/:id
PATCH /api/locations/:id
DELETE /api/locations/:id
```

`POST /api/locations`：

```json
{
  "name": "东白山机位",
  "latitude": 29.2345,
  "longitude": 120.1234,
  "elevationM": 900,
  "tags": ["山顶", "低光害"],
  "accessNote": "停车后步行约 15 分钟"
}
```

规则：

- 经纬度必须是 WGS84。
- 删除默认软删除。
- 坐标变更后要触发相关缓存失效。

## 对比 API

```text
POST /api/compare
```

请求：

```json
{
  "locationIds": ["loc_01", "loc_02"],
  "origin": {
    "latitude": 30.2741,
    "longitude": 120.1551,
    "name": "杭州"
  },
  "dateLocal": "2026-05-15",
  "startHourLocal": 20,
  "endHourLocal": 5,
  "timezone": "Asia/Shanghai",
  "weights": {
    "light": 0.25,
    "weather": 0.4,
    "astronomy": 0.25,
    "distance": 0.1
  }
}
```

响应：

```json
{
  "data": {
    "bestLocationId": "loc_01",
    "items": [
      {
        "locationId": "loc_01",
        "summary": {
          "bestHourLocal": "2026-05-15T23:00:00+08:00",
          "totalScore": 86,
          "distanceKm": 92.3,
          "distanceMode": "straight_line",
          "recommendation": "recommended",
          "topReasons": ["云量低", "月亮已落", "光污染低"]
        },
        "lightPollution": {
          "source": "eog-vnl",
          "sourceYear": 2024,
          "confidence": "medium"
        },
        "hourly": []
      }
    ]
  }
}
```

规则：

- `startHourLocal > endHourLocal` 表示跨午夜。
- `distanceMode` 必须明确是 `straight_line` 或 `driving`。
- provider 部分失败时，尽量返回可用数据，并在对应字段标记 `stale` 或 `unknown`。

## 图片 API

```text
POST /api/locations/:id/images
GET /api/locations/:id/images
PATCH /api/images/:imageId
DELETE /api/images/:imageId
```

规则：

- 支持 JPEG、PNG、WebP。
- 单张原图默认限制 10 MB。
- 文件名使用随机 key，不使用原始文件名。
- 删除默认软删除。
- 缩略图生成失败不应导致原图记录丢失，但要返回 `thumbnailStatus=failed`。

## 错误码

| code | 场景 |
| --- | --- |
| `VALIDATION_ERROR` | 输入校验失败 |
| `LOCATION_NOT_FOUND` | 地点不存在或已删除 |
| `WEATHER_PROVIDER_UNAVAILABLE` | 天气 provider 不可用 |
| `LIGHT_DATA_UNAVAILABLE` | 光污染数据缺失 |
| `IMAGE_TOO_LARGE` | 图片超过限制 |
| `UNSUPPORTED_IMAGE_TYPE` | 图片类型不支持 |
| `RATE_LIMITED` | 请求频率过高 |

