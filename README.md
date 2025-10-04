# Widget Factory MVP

A proof-of-concept implementation for deterministically generating React widgets from structured WidgetSpec definitions.

## Project Structure

```
ai-widget-factory/
├── packages/
│   ├── core/               # Core primitives and compiler
│   │   ├── src/
│   │   │   ├── WidgetShell.jsx
│   │   │   ├── Title.jsx
│   │   │   ├── Metric.jsx
│   │   │   ├── Label.jsx
│   │   │   ├── Icon.jsx
│   │   │   ├── compiler.js      # WidgetSpec → JSX compiler
│   │   │   └── index.jsx
│   │   └── primitives-registry.json
│   │
│   └── icons/              # Icon library
│       ├── scripts/
│       │   └── generate-icons.js
│       └── src/
│           ├── generated/   # Auto-generated icon components
│           └── index.jsx
│
├── demo/                   # Demo application
│   ├── src/
│   │   ├── examples/       # Example WidgetSpec JSONs
│   │   ├── widgets/        # Pre-compiled example widgets
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
│
└── assets/
    └── icons/
        └── sf-symbols/     # Source SVG icons
```

## Quick Start

```bash
# Install dependencies
npm install

# Generate icon components from SVGs
npm run build:icons

# Start dev server
npm run dev
```

Visit http://localhost:5174/ to view the demo.

## Features Implemented

### 1. Component Library (@widget-factory/core)
- **WidgetShell**: Container with 3 sizes (S/M/L), padding, border-radius
- **Title**: Text with fontSize, color, align props
- **Metric**: Numeric display with tabular figures
- **Label**: Secondary text
- **Icon**: Icon wrapper supporting SVG icons

### 2. Icon Library (@widget-factory/icons)
Auto-generated from SF Symbols SVGs:
- HeartFill, StarFill, CircleFill
- CheckmarkCircleFill, CloudSunFill
- FlameFill, BoltFill, Calendar

### 3. Compiler
`compileWidgetSpec(widgetSpec)` → generates React JSX code string

Input: WidgetSpec JSON
Output: Single-file `widget.jsx` with imports and component code

### 4. Demo Application
- **Widget Gallery**: 3 example widgets
  - Weather (S size)
  - Stats (M size)
  - Dashboard (L size)
- **Live Editor**: Edit WidgetSpec JSON and see generated code
- Side-by-side preview of:
  - Rendered widget
  - Generated JSX code
  - Input WidgetSpec

## Example WidgetSpec

```json
{
  "widget": {
    "size": "S",
    "theme": "light",
    "root": {
      "type": "container",
      "direction": "col",
      "gap": 12,
      "children": [
        {
          "type": "leaf",
          "kind": "number.metric",
          "props": {
            "fontSize": 48,
            "color": "#000000"
          },
          "content": "72°"
        }
      ]
    }
  }
}
```

## Key Concepts Validated

✅ **Flex-first layout**: All layouts use flexbox containers
✅ **Primitives registry**: JSON-based component metadata
✅ **Deterministic compilation**: Same spec → same code
✅ **Single-file output**: Generated widget.jsx with all imports
✅ **Icon generation**: Automated SVG → React component pipeline

## Next Steps for Full Implementation

1. Add remaining primitives (Avatar, Sparkline, BarMini, etc.)
2. Implement Task 1: Screenshot → WidgetSpec extraction
3. Implement Task 2: Synthetic WidgetSpec generation
4. Add validation and error handling
5. Support for dark theme
6. More canvas sizes and responsive layouts
