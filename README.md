# Galaxy Scout

银河拍摄选址决策工具，支持多候选地点同屏对比。

## 进度

| 里程碑 | 内容 | 状态 |
|--------|------|:----:|
| M0 | 项目骨架 | ✅ |
| M1 | 地点 CRUD、标签、收藏、图片上传 | ✅ |
| M2 | 天气集成（Open-Meteo）、多地点对比 | ✅ |
| M3 | 天文窗口（月相、银河核心可见性） | ✅ |
| M4 | 光污染（VIIRS 数据 + 地图热力图 + 评分） | ✅ |
| M5 | PWA、出行计划、拍摄复盘 | 🔜 |

## 功能

- **多地点对比**：天气、光污染、月相、银河窗口同屏比较
- **光污染地图**：基于 VIIRS 卫星数据的热力图叠加，支持透明度调节和点击查询
- **智能评分**：四因子加权（光污染 0.25 + 天气 0.40 + 天文 0.25 + 距离 0.10）
- **逐小时数据**：每个地点每小时详细天气和天文数据
- **地点管理**：CRUD、标签、收藏、图片上传、地图选点

## 技术栈

- **前端**：Next.js 14 + React + TypeScript + Tailwind CSS
- **地图**：MapLibre GL JS + OpenStreetMap
- **数据库**：SQLite + Drizzle ORM
- **测试**：Vitest + Playwright

## 启动

```bash
npm install
npm run preprocess:viirs    # 下载并预处理光污染数据（需约 60 MB）
npm run generate-pmtiles    # 生成地图图层文件
npm run dev                 # 启动开发服务器
```

访问 http://localhost:3000

## 页面路由

| 路由 | 功能 |
|------|------|
| `/` | 仪表盘 |
| `/compare` | 多地点对比 |
| `/map` | 光污染地图 + 地点管理 |
| `/locations` | 地点列表 |
| `/locations/[id]` | 地点详情 |
| `/settings` | 设置 |

## 数据源

| 类型 | 来源 | 格式 |
|------|------|------|
| 天气 | Open-Meteo Forecast API | 逐小时，7 天预报 |
| 光污染 | NOAA VIIRS VNL V2（2023） | 69.5 万采样点，覆盖中国 |
| 天文 | Astronomy Engine（本地计算） | 月相、银河核心高度 |
| 地图 | OpenStreetMap（在线瓦片） | 含中文标注 |
| 距离 | Haversine 直线距离 | P1 阶段接入驾车距离 |

## 关键约束

- VIIRS 辐亮度 ≠ 实测天空亮度，Bortle 仅标记为 **estimate**
- 距离必须区分直线距离和驾车距离
- 所有外部数据展示来源、年份和可信度
