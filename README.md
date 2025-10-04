# Widget Factory

React widget compiler that transforms structured JSON specs into standalone JSX components.

## Usage

```bash
npm install
npm run build:icons
npm run dev
```

Open http://localhost:5173 to see the interactive demo.

## Design Philosophy

**Deterministic Compilation**
Same WidgetSpec always produces identical JSX code. No runtime ambiguity.

**Registry-Based Architecture**
Components are discovered through `primitives-registry.json`, mapping `kind` strings to React primitives with default props and metadata.

**Flex-First Layout**
All layouts use flexbox containers. No absolute positioning or CSS grid.

**Single-File Output**
Compiler generates self-contained `widget.jsx` with all necessary imports.

---

## Component Library (@widget-factory/core)

### Architecture

Components are defined in `primitives-registry.json`:

```json
{
  "primitives": {
    "Text_Metric": {
      "id": "Text",
      "kind": "number.metric",
      "props": {
        "fontSize": { "type": "number", "default": 32 },
        "color": { "type": "color", "default": "#000000" },
        "fontWeight": { "type": "number", "default": 600 }
      }
    }
  }
}
```

The `kind` field (`number.metric`) is used in WidgetSpec to reference this primitive. The compiler looks up the registry, finds the matching primitive, and generates the corresponding JSX.

### Available Primitives

**Text Components**
- `text.title` → `<Text>` (default: 18px, weight 400)
- `text.label` → `<Text>` (default: 13px, color #666)
- `number.metric` → `<Text>` (default: 32px, weight 600, tabular figures)

**Media Components**
- `media.icon` → `<Icon>` (requires `name` prop for icon selection)

### Usage in WidgetSpec

```json
{
  "type": "leaf",
  "kind": "number.metric",
  "props": {
    "fontSize": 48,
    "color": "#000000"
  },
  "content": "72°"
}
```

The compiler:
1. Reads `kind: "number.metric"`
2. Looks up registry → finds `Text` component
3. Merges default props with provided props
4. Generates: `<Text fontSize={48} color="#000000">72°</Text>`

---

## Icon Library (@widget-factory/icons)

### Auto-Generation Pipeline

Icons are generated from SF Symbol SVGs:

```bash
npm run build:icons
```

**Process:**
1. Reads SVGs from `assets/icons/sf-symbols/`
2. Cleans SVG markup (removes width/height, adds 100% dimensions)
3. Generates React component per icon
4. Converts naming: `heart.fill.svg` → `HeartFill.jsx`
5. Creates index file with all exports

**Script:** `packages/icons/scripts/generate-icons.js`

### Usage in WidgetSpec

```json
{
  "type": "leaf",
  "kind": "media.icon",
  "props": {
    "size": 24,
    "color": "#FF9500",
    "name": "cloud.sun.fill"
  }
}
```

The compiler:
1. Reads `name: "cloud.sun.fill"`
2. Converts to PascalCase → `CloudSunFill`
3. Generates:
```jsx
import { CloudSunFill } from '@widget-factory/icons';
<Icon size={24} color="#FF9500">
  <CloudSunFill />
</Icon>
```

---

## WidgetSpec Structure

### Shell Properties

```json
{
  "widget": {
    "width": 158,
    "height": 158,
    "backgroundColor": "#f2f2f7",
    "borderRadius": 20,
    "padding": 16,
    "root": { ... }
  }
}
```

### Container Node

```json
{
  "type": "container",
  "direction": "row|col",
  "gap": 12,
  "alignMain": "start|center|end|between",
  "alignCross": "start|center|end",
  "flex": 1,
  "children": [ ... ]
}
```

### Leaf Node

```json
{
  "type": "leaf",
  "kind": "text.title|text.label|number.metric|media.icon",
  "props": {
    "fontSize": 18,
    "color": "#000000"
  },
  "content": "Hello",
  "flex": 0
}
```

### Complete Example

```json
{
  "widget": {
    "width": 158,
    "height": 158,
    "backgroundColor": "#f2f2f7",
    "borderRadius": 20,
    "padding": 16,
    "root": {
      "type": "container",
      "direction": "col",
      "gap": 12,
      "alignMain": "between",
      "children": [
        {
          "type": "container",
          "direction": "row",
          "gap": 8,
          "alignCross": "center",
          "children": [
            {
              "type": "leaf",
              "kind": "media.icon",
              "props": { "size": 24, "color": "#FF9500", "name": "cloud.sun.fill" }
            },
            {
              "type": "leaf",
              "kind": "text.label",
              "props": { "fontSize": 13, "color": "#666666" },
              "content": "San Francisco"
            }
          ]
        },
        {
          "type": "leaf",
          "kind": "number.metric",
          "props": { "fontSize": 48, "color": "#000000" },
          "content": "72°"
        }
      ]
    }
  }
}
```

---

## Compiler Pipeline

**Input:** WidgetSpec JSON
**Output:** Single-file `widget.jsx`

```
WidgetSpec → Compiler → widget.jsx
```

**Steps:**
1. Parse WidgetSpec JSON
2. Walk tree recursively
3. For each leaf node:
   - Lookup primitive by `kind` in registry
   - Merge default props with provided props
   - Generate JSX string
4. For each container:
   - Generate flex layout div with styles
5. Collect all imports (components + icons)
6. Output complete React component file

**API:**
```javascript
import { compileWidgetSpec } from '@widget-factory/core';
const jsxCode = compileWidgetSpec(widgetSpec);
```

---

## Demo Application

Interactive web interface with:
- 7 preset widget examples
- Live WidgetSpec editor (JSON textarea)
- Real-time JSX code generation
- Side-by-side widget preview

**Features:**
- Edit JSON → instant compilation + preview
- Syntax highlighting for generated code
- Error handling with inline feedback

---

## Project Structure

```
packages/core/
  ├── primitives-registry.json    Registry mapping kinds → components
  ├── src/
  │   ├── WidgetShell.jsx        Shell container wrapper
  │   ├── Text.jsx               Text primitive
  │   ├── Icon.jsx               Icon wrapper
  │   ├── compiler.js            WidgetSpec → JSX compiler
  │   └── runtime-renderer.jsx   Direct React rendering for preview

packages/icons/
  ├── scripts/generate-icons.js  SVG → React component generator
  ├── src/
  │   ├── generated/             Auto-generated icon components
  │   └── index.jsx              Icon exports

demo/
  ├── src/
  │   ├── examples/              WidgetSpec JSON files
  │   ├── App.jsx                Main demo interface
  │   └── main.jsx               Entry point

assets/icons/sf-symbols/         Source SVG files
```
