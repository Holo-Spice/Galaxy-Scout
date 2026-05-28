# AI 新会话总目录

本目录是大模型编程的上下文路由入口。新会话不要一次性读取所有文档，应先判断任务类型，再按需读取 1 到 3 个模块。

## 必读顺序

1. 根目录 `AGENTS.md`
2. 本文件 `docs/INDEX.md`
3. 当前任务对应的模块文档

## 项目一句话

构建一个 Web/PWA 工具，让摄影爱好者能同时对比多个银河拍摄候选地点的光污染、逐小时天气、天文窗口、距离、机位图片和收藏备注。

## 当前默认决策

- 平台：Web 优先，后续 PWA。
- 用户：个人自用优先。
- 天气：Open-Meteo Forecast API。
- 光污染：公开遥感/天空亮度数据离线预处理，不调用第三方私有接口。
- 天文：本地计算，推荐 Astronomy Engine。
- 地图：MapLibre GL JS，底图遵守瓦片服务政策。
- 距离：MVP 用 Haversine 直线距离，P1 才接路线服务。
- 存储：SQLite + Drizzle ORM（开发期），长期可迁移 PostgreSQL/Supabase。
- 后端：Next.js Route Handlers + Zod 校验。
- **M1 已完成**：地点 CRUD API、标签管理、收藏切换、本地图片上传、前端 API 集成。

## 任务路由表

| 任务类型 | 必读文档 | 可选文档 |
| --- | --- | --- |
| 明确产品范围、MVP、是否该做某功能 | `01-product-scope.md` | `10-roadmap.md` |
| 搭建项目、选框架、设计目录 | `02-architecture.md`, `08-implementation-standards.md` | `09-testing-acceptance.md` |
| 设计或修改数据库 schema | `03-data-model.md` | `06-api-contracts.md`, `05-compare-scoring.md` |
| 接天气、光污染、天文、地图或路线数据 | `04-data-sources.md` | `05-compare-scoring.md`, `08-implementation-standards.md` |
| 做多地点对比、推荐分、排序、解释原因 | `05-compare-scoring.md` | `04-data-sources.md`, `07-frontend-ux.md` |
| 新增或修改后端接口 | `06-api-contracts.md` | `03-data-model.md`, `08-implementation-standards.md` |
| 做页面、地图、表格、移动端体验 | `07-frontend-ux.md` | `05-compare-scoring.md`, `04-data-sources.md` |
| 添加或修改动画、3D 背景、过渡效果 | `07-frontend-ux.md` | `02-architecture.md`, `08-implementation-standards.md` |
| 写测试、修测试、验收功能 | `09-testing-acceptance.md` | 相关功能模块文档 |
| 规划版本和开发顺序 | `10-roadmap.md` | `01-product-scope.md` |

## 模块文档说明

- `01-product-scope.md`：产品目标、用户、MVP/P1/不做范围。
- `02-architecture.md`：推荐技术栈、模块边界、服务职责。
- `03-data-model.md`：核心实体、字段、索引和失效规则。
- `04-data-sources.md`：Open-Meteo、VIIRS/World Atlas、天文计算、地图和距离服务。
- `05-compare-scoring.md`：多地点对比流程、评分模型、推荐解释。
- `06-api-contracts.md`：API 路径、请求响应、错误格式。
- `07-frontend-ux.md`：页面结构、组件、移动端、状态文案。
- `08-implementation-standards.md`：代码组织、TypeScript、缓存、环境变量、安全。
- `09-testing-acceptance.md`：单元测试、集成测试、E2E、验收标准。
- `10-roadmap.md`：阶段拆分、交付顺序、风险。

## 上下文节省规则

- 只读当前任务相关文档，不要全文加载所有模块。
- 如果任务跨模块，优先读取“主模块 + 数据模型或 API”。
- 如果文档和代码冲突，先以代码为当前事实，再更新文档或提出差异。
- 如果需求没有明确突破 MVP，默认按 MVP 决策实现。
- 不要把参考资料全文复制到上下文，只保留链接和必要结论。

## 文档维护规则

- 修改数据表或字段：更新 `03-data-model.md`。
- 修改接口：更新 `06-api-contracts.md`。
- 修改评分、排序、推荐解释：更新 `05-compare-scoring.md`。
- 修改数据源、缓存或第三方接入：更新 `04-data-sources.md`。
- 修改页面和交互：更新 `07-frontend-ux.md`。
- 修改测试策略或验收条件：更新 `09-testing-acceptance.md`。
- 新增里程碑或改变优先级：更新 `10-roadmap.md`。

