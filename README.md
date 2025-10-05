# AI Widget Factory

将结构化 WidgetSpec（JSON）编译为可运行的 React 组件。包含核心库、图标库与演示应用。

## 快速开始
```bash
npm install
npm run build:icons
npm run dev
```
打开 http://localhost:5173 访问 Demo。

## 最小用法
```js
import { renderWidgetFromSpec } from '@widget-factory/core';
const Widget = renderWidgetFromSpec(spec);
// 在 React 中使用：<Widget />
```

## 实现（简述）
- Registry 驱动：`kind` 映射到基础组件（primitives），合并默认/传入 props。
- 布局为 flex 容器：容器节点生成简洁的 flex 结构。
- 图标管线：读取 SVG → 生成 React 组件 → `iconsMap` 与 `metadata`（供 `<Icon />` 使用）。

## 包
- `@widget-factory/core`：基础组件、编译器、运行时渲染。
- `@widget-factory/icons`：自动生成的图标组件与 `iconsMap`。
- `demo`：示例应用与可视化编辑。

详细说明见各包内 README。
