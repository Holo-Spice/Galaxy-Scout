# 系统架构

## 推荐架构

```text
Browser / PWA
  -> Web App + API Layer
    -> Location Service
    -> Compare Service
    -> Weather Adapter
    -> Astronomy Service
    -> Light Pollution Query Service
    -> Image Service
    -> Database + Object Storage + Static Map Assets
```

## 推荐技术栈

- 前端：Next.js App Router + React + TypeScript。
- 样式：CSS Modules 或 Tailwind CSS，避免早期引入重型 UI 库。
- 地图：MapLibre GL JS。
- 后端：Next.js Route Handlers。
- 数据库：开发期 SQLite，长期 PostgreSQL/Supabase。
- ORM：Drizzle 优先；如果项目已使用 Prisma，则保持一致。
- 校验：Zod。
- 日期时间：Temporal polyfill 或 Luxon，必须保留 IANA timezone。
- 图片：本地 `uploads/` 或 Supabase Storage。
- 测试：Vitest + Playwright。
- 动画：framer-motion（页面过渡、卡片揭示、3D 倾斜、数字滚动）。
- 3D：@react-three/fiber + @react-three/drei + three（3D 星空背景）。

## 模块边界

| 模块 | 负责 | 不负责 |
| --- | --- | --- |
| Location Service | 地点、收藏、标签、备注 | 直接调用天气 API |
| Weather Adapter | Open-Meteo 请求、缓存、归一化 | 计算最终推荐分 |
| Astronomy Service | 月相、月亮高度、天文夜、银河窗口 | 外部网络请求 |
| Light Pollution Service | 栅格点查询、来源元数据、可信度 | 把 VIIRS 当实测 Bortle |
| Compare Service | 聚合地点、天气、天文、光污染、距离、评分 | 长期保存外部原始响应 |
| Image Service | 上传、缩略图、封面、图片元数据 | 公开图库和分享 |
| Animation System | UI 过渡动画、3D 星空粒子背景、prefers-reduced-motion 无障碍降级 | 业务逻辑、数据获取、路由 |

## 数据流

```text
用户选择地点和时间窗
  -> Compare API
  -> 读取地点
  -> 批量读取/刷新天气缓存
  -> 查询光污染样本
  -> 计算天文数据
  -> 计算距离
  -> 生成逐小时评分和地点摘要
  -> 返回 UI
```

## 部署建议

MVP 可以单体部署。不要过早拆微服务。

- 本地开发：SQLite + 本地图片目录。
- 个人线上：Vercel/Node 服务 + Supabase Postgres + Supabase Storage。
- 光污染大文件：对象存储或静态文件托管，查询索引可预处理后放本地数据库。

## 架构约束

- 外部 provider 响应必须先 normalize，再进入业务层。
- UI 不直接依赖第三方 provider 字段名。
- 业务规则放在 `domains/*`，API 路由只做 HTTP 适配。
- 天文计算优先纯函数化，便于测试和缓存。

