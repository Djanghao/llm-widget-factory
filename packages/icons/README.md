# @widget-factory/icons

将 SF Symbols 的 SVG 转为 React 图标组件，导出 `iconsMap` 与 `metadata`（供 `@widget-factory/core` 的 `<Icon />` 使用）。

## 使用
- 构建：`npm run build:icons`
- 推荐：`<Icon name="cloud.sun.fill" size={24} color="#FF9500" />`
- 直接：`const C = iconsMap['cloud.sun.fill']; return <C />`

## 实现（简述）
- 扫描 `assets/icons/sf-symbols/`，清洗 SVG，统一 `width/height=100%`
- 单色检测 → 替换为 `currentColor`（可外部统一着色）
- 生成到 `src/components/`，并写入 `src/map.js` 与 `src/metadata.json`

自动产物已 gitignore：`src/components/`、`src/map.js`、`src/metadata.json`。
