# @widget-factory/icons

Convert SF Symbols SVGs to React icon components, export `iconsMap` & `metadata` (for `@widget-factory/primitives` `<Icon />`).

## Usage
- Build: `npm run build:icons`
- Recommended: `<Icon name="cloud.sun.fill" size={24} color="#FF9500" />`
- Direct: `const C = iconsMap['cloud.sun.fill']; return <C />`

## Implementation
- Scan `assets/icons/sf-symbols/`, clean SVGs, normalize `width/height=100%`
- Single-color detection → replace with `currentColor` (enables external coloring)
- Generate to `src/components/`, write `src/map.js` & `src/metadata.json`

Auto-generated files are gitignored: `src/components/`, `src/map.js`, `src/metadata.json`.
