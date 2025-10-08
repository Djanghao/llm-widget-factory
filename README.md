# AI Widget Factory

将结构化 WidgetSpec（JSON）编译为可运行的 React 组件。包含核心库、图标库与演示应用。

推荐的流水线：WidgetSpec → JSX → 渲染结果。生成的 JSX 不只是展示代码，而是实际用于渲染（经由编译渲染器）。

## 快速开始
```bash
npm install
npm run build:icons
cd playground
npm run dev
```
打开 http://localhost:5173 访问演示。

## 最小用法
```js
import { compileWidgetSpecToComponent } from '@widget-factory/core';
const Widget = compileWidgetSpecToComponent(spec);
// 在 React 中使用：<Widget />
```

## 实现（简述）
- Spec 使用 `component` + `props` 明确组件与属性；不再支持 `kind` 预设或回退。
- 布局为 flex 容器：容器节点生成简洁的 flex 结构。
- 图标管线：读取 SVG → 生成 React 组件 → `iconsMap` 与 `metadata`（供 `<Icon />` 使用）。
 - 子项伸缩请作为组件 `flex` 属性传入（如 `<Text flex={1} />`），而不是写在 `style` 中；仅对未建模样式使用 `style`。

## 包
- `@widget-factory/core`：基础组件、编译器（输出 JSX 字符串）与编译渲染器（输出可运行组件）。
- `@widget-factory/icons`：自动生成的图标组件与 `iconsMap`。
- `playground`：示例应用与可视化编辑。

详细说明见各包内 README。
