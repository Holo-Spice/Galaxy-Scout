# 开发规范

## 代码组织

建议目录：

```text
src/
  app/
    api/
    compare/
    locations/
    map/
    settings/
  components/
  domains/
    astronomy/
    compare/
    light-pollution/
    locations/
    weather/
  lib/
    db/
    geo/
    time/
    validation/
  styles/
```

规则：

- `domains/*` 放业务规则。
- `app/api/*` 只做 HTTP 适配。
- `components/*` 不直接访问数据库。
- `lib/geo` 放距离、bbox、坐标格式化等纯函数。
- `lib/time` 统一处理 timezone。

## TypeScript

- 开启 `strict`。
- API 输入输出必须有 Zod schema。
- 外部 provider 响应必须 normalize。
- 不在 UI 中直接引用 provider 原始字段。
- 纯业务函数优先无副作用，便于测试。

## 时间和坐标

- 数据库存 UTC。
- 用户输入日期按所选 timezone 解释。
- 展示按地点 timezone 转换。
- 坐标内部统一 WGS84。
- 国内地图服务的 GCJ-02/BD-09 转换必须封装在边界层。

## 缓存

缓存键建议：

```text
weather:{provider}:{lat_round}:{lon_round}:{forecast_date}
light:{source}:{source_year}:{lat_round}:{lon_round}
astro:{algorithm_version}:{lat_round}:{lon_round}:{date}
distance:{mode}:{origin_hash}:{location_hash}
```

天气缓存：

- 未来 0 到 72 小时：30 到 60 分钟。
- 未来 3 到 7 天：3 小时。
- 未来 8 到 16 天：6 小时。

## 环境变量

```text
DATABASE_URL=
UPLOAD_STORAGE_DRIVER=local|supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPEN_METEO_BASE_URL=https://api.open-meteo.com
MAP_TILE_URL=
LIGHT_POLLUTION_SOURCE_DIR=
```

规则：

- `.env.local` 不提交。
- 提供 `.env.example`。
- 服务端密钥不能以 `NEXT_PUBLIC_` 开头。

## 安全

- 不把服务端 API Key 暴露到前端。
- 图片上传限制大小、MIME 和扩展名。
- 图片文件名使用随机 key。
- 默认不公开地点和图片。
- 日志中避免记录完整精确坐标；必要时降低精度。

## 文档同步

实现以下变更时必须同步文档：

- 表结构或字段变化：`03-data-model.md`
- 接口变化：`06-api-contracts.md`
- 评分变化：`05-compare-scoring.md`
- 数据源变化：`04-data-sources.md`
- 页面交互变化：`07-frontend-ux.md`
- 测试策略变化：`09-testing-acceptance.md`

