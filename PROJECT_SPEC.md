# 银河机位多地点对比项目说明入口

这是项目的短入口文件，面向人类和大模型编程工具。不要把本文件当作完整规格；完整规范已拆分到 `docs/` 目录，避免每次新会话加载过多上下文。

## 新会话读取顺序

1. 先读根目录 `AGENTS.md`，了解 AI 编程协作规则。
2. 再读 `docs/INDEX.md`，根据任务类型选择对应模块。
3. 只读取和当前任务相关的模块文档，不要一次性读取全部文档。
4. 如果任务会修改功能、接口、数据模型或约定，完成后同步更新对应 `.md`。

## 项目定位

本项目是一个 Web/PWA 优先的银河拍摄选址决策工具，用于同时对比多个候选机位的光污染、逐小时天气、天文窗口、距离、机位图片、收藏和备注。

第一阶段默认假设：

- 个人自用优先。
- Web 优先，后续可 PWA 化。
- 不抓取第三方私有接口。
- 天气优先使用 Open-Meteo。
- 光污染优先使用公开遥感/天空亮度数据离线预处理。
- 距离 MVP 使用直线距离，后续扩展驾车路线。

## 文档入口

- [AI 新会话总目录](docs/INDEX.md)
- [产品范围](docs/01-product-scope.md)
- [系统架构](docs/02-architecture.md)
- [数据模型](docs/03-data-model.md)
- [外部数据源](docs/04-data-sources.md)
- [对比与评分](docs/05-compare-scoring.md)
- [API 契约](docs/06-api-contracts.md)
- [前端与交互](docs/07-frontend-ux.md)
- [开发规范](docs/08-implementation-standards.md)
- [测试与验收](docs/09-testing-acceptance.md)
- [路线图](docs/10-roadmap.md)

