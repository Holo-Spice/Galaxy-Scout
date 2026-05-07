# Galaxy Scout

银河拍摄选址决策工具，支持多候选地点同屏对比。

## 功能

- 多地点对比：天气、光污染、月相、银河窗口
- 4 套独立 UI 主题（深空/星舰/极简/终端）
- 动态星空背景（可开关）
- 逐小时数据展示
- 地图选点（占位）

## 技术栈

- Next.js 14 + React + TypeScript
- Tailwind CSS
- MapLibre GL JS

## 启动

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 主题切换

右下角按钮切换主题：
- **深空**：观测站控制台风格
- **星舰**：电影级全屏摄影
- **极简**：纯净开发者风格
- **终端**：代码编辑器风格

## 数据源

- 天气：Open-Meteo
- 光污染：VIIRS / World Atlas
- 天文：本地计算
- 地图：MapLibre GL JS
