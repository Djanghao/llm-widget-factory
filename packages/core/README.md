# @widget-factory/core

基础组件与编译/渲染工具。将 WidgetSpec（JSON）映射为 React 组件。

推荐的流水线是：WidgetSpec → JSX → 渲染结果。生成的 JSX 既可展示也可直接用于渲染。

## 使用
```js
import { compileWidgetSpec, compileWidgetSpecToComponent } from '@widget-factory/core';

// 生成 JSX 字符串（用于展示/保存/对照）
const code = compileWidgetSpec(spec);

// 将 Spec 编译为可运行组件（用于渲染）
const Widget = compileWidgetSpecToComponent(spec, { inspect: true });
```

## 实现（简述）
- 仅使用 `component` 明确组件（如 `Text`、`Icon` 等），并在 `props` 中显式给出属性；不再支持 `kind` 预设或回退映射。
- 编译器遍历树，使用显式 `props` 生成简洁的 flex 布局 JSX；渲染使用 `compileWidgetSpecToComponent`（与生成的 JSX 语义一致）。
- `<Icon />` 通过 `@widget-factory/icons` 的 `iconsMap/metadata` 处理图标与颜色。
 - 推荐将子项伸缩写为 `flex` 组件属性（如 `<Text flex={1} />`），而不是写入 `style`；仅当遇到未建模的样式时再使用 `style`。
