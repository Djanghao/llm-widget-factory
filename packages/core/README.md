# @widget-factory/core

基础组件与编译/渲染工具。将 WidgetSpec（JSON）映射为 React 组件。

## 使用
```js
import { compileWidgetSpec, renderWidgetFromSpec } from '@widget-factory/core';

// 生成 JSX 字符串
const code = compileWidgetSpec(spec);

// 直接渲染 React 组件
const Widget = renderWidgetFromSpec(spec);
```

## 实现（简述）
- Registry（`primitives-registry.json`）将 `kind` 映射到 primitives 组件及默认 props。
- 编译器遍历树，合并 props，生成简洁的 flex 布局 JSX。
- `<Icon />` 通过 `@widget-factory/icons` 的 `iconsMap/metadata` 处理图标与颜色。
