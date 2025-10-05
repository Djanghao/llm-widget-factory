import registry from '../primitives-registry.json' assert { type: 'json' };

function buildCodeAndMap(widgetSpec) {
  const imports = new Set();
  imports.add("import React from 'react';");
  imports.add("import { WidgetShell } from '@widget-factory/core';");

  const map = {};
  const lines = [];
  const write = (line) => { lines.push(line); };

  function renderNode(node, depth = 0, path = '0') {
    const indent = '  '.repeat(depth);

    if (node.type === 'container') {
      const { direction = 'row', gap = 8, padding, alignMain, alignCross, flex, backgroundColor, children = [] } = node;

      const styles = [];
      styles.push(`display: 'flex'`);
      styles.push(`flexDirection: '${direction === 'col' ? 'column' : 'row'}'`);
      if (gap) styles.push(`gap: ${gap}`);
      if (padding) styles.push(`padding: ${padding}`);
      if (flex !== undefined) styles.push(`flex: ${flex}`);
      if (backgroundColor) styles.push(`backgroundColor: '${backgroundColor}'`);
      if (alignMain) {
        const alignMap = { start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between' };
        styles.push(`justifyContent: '${alignMap[alignMain] || alignMain}'`);
      }
      if (alignCross) {
        const alignMap = { start: 'flex-start', end: 'flex-end', center: 'center' };
        styles.push(`alignItems: '${alignMap[alignCross] || alignCross}'`);
      }

      const startLine = lines.length + 1;
      write(`${indent}<div style={{ ${styles.join(', ')} }}>`);
      children.forEach((child, idx) => renderNode(child, depth + 1, `${path}.${idx}`));
      write(`${indent}</div>`);
      const endLine = lines.length;
      map[path] = { startLine, endLine };
      return;
    }

    if (node.type === 'leaf') {
      const { kind, props = {}, flex, content } = node;

      const primitive = Object.values(registry.primitives).find(p => p.kind === kind);
      if (!primitive) {
        throw new Error(`Unknown primitive kind: ${kind}`);
      }

      const componentName = primitive.id;
      imports.add(`import { ${componentName} } from '@widget-factory/core';`);

      

      const mergedProps = {};
      if (primitive.props) {
        for (const [key, propDef] of Object.entries(primitive.props)) {
          if (propDef.default !== undefined) mergedProps[key] = propDef.default;
        }
      }
      Object.assign(mergedProps, props);

      const propsCode = [];
      for (const [key, value] of Object.entries(mergedProps)) {
        if (typeof value === 'string') propsCode.push(`${key}="${value}"`);
        else propsCode.push(`${key}={${JSON.stringify(value)}}`);
      }
      if (flex !== undefined) propsCode.push(`style={{ flex: ${flex} }}`);

      let childrenStr = '';
      if (content) {
        childrenStr = content;
      }

      const propsStr = propsCode.length > 0 ? ' ' + propsCode.join(' ') : '';
      const startLine = lines.length + 1;
      if (childrenStr) write(`${indent}<${componentName}${propsStr}>${childrenStr}</${componentName}>`);
      else write(`${indent}<${componentName}${propsStr} />`);
      const endLine = lines.length;
      map[path] = { startLine, endLine };
      return;
    }
  }

  if (!widgetSpec.widget?.root) {
    throw new Error('Invalid widget spec: missing widget.root');
  }

  renderNode(widgetSpec.widget.root, 2, '0');

  const importsCode = Array.from(imports).join('\n');
  const { backgroundColor, borderRadius, padding } = widgetSpec.widget;
  const shellProps = [];
  if (backgroundColor) shellProps.push(`backgroundColor="${backgroundColor}"`);
  if (borderRadius !== undefined) shellProps.push(`borderRadius={${borderRadius}}`);
  if (padding !== undefined) shellProps.push(`padding={${padding}}`);
  const shellPropsStr = shellProps.length > 0 ? ' ' + shellProps.join(' ') : '';

  const prefix = `${importsCode}\n\nexport default function Widget() {\n  return (\n    <WidgetShell${shellPropsStr}>\n`;
  const suffix = `\n    </WidgetShell>\n  );\n}\n`;
  const prefixLineCount = prefix.split('\n').length - 1;

  const adjustedMap = {};
  for (const [p, r] of Object.entries(map)) {
    adjustedMap[p] = { startLine: r.startLine + prefixLineCount, endLine: r.endLine + prefixLineCount };
  }

  const code = prefix + lines.join('\n') + suffix;
  return { code, map: adjustedMap };
}

export function compileWidgetSpec(widgetSpec) {
  const { code } = buildCodeAndMap(widgetSpec);
  return code;
}

export function compileWidgetSpecWithMap(widgetSpec) {
  return buildCodeAndMap(widgetSpec);
}

function toPascalCase(str) {
  return str
    .split(/[.-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
