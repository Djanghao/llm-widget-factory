import registry from '../primitives-registry.json' assert { type: 'json' };

export function compileWidgetSpec(widgetSpec) {
  const imports = new Set();
  imports.add("import React from 'react';");
  imports.add("import { WidgetShell } from '@widget-factory/core';");

  function renderNode(node, depth = 0) {
    const indent = '  '.repeat(depth);

    if (node.type === 'container') {
      const { direction = 'row', gap = 8, padding, alignMain, alignCross, flex, children = [] } = node;

      const styles = [];
      styles.push(`display: 'flex'`);
      styles.push(`flexDirection: '${direction === 'col' ? 'column' : 'row'}'`);
      if (gap) styles.push(`gap: ${gap}`);
      if (padding) styles.push(`padding: ${padding}`);
      if (flex !== undefined) styles.push(`flex: ${flex}`);
      if (alignMain) {
        const alignMap = {
          start: 'flex-start',
          end: 'flex-end',
          center: 'center',
          between: 'space-between'
        };
        styles.push(`justifyContent: '${alignMap[alignMain] || alignMain}'`);
      }
      if (alignCross) {
        const alignMap = {
          start: 'flex-start',
          end: 'flex-end',
          center: 'center'
        };
        styles.push(`alignItems: '${alignMap[alignCross] || alignCross}'`);
      }

      const childrenCode = children.map(child => renderNode(child, depth + 1)).join('\n');

      return `${indent}<div style={{ ${styles.join(', ')} }}>
${childrenCode}
${indent}</div>`;
    }

    if (node.type === 'leaf') {
      const { kind, props = {}, flex, content } = node;

      const primitive = Object.values(registry.primitives).find(p => p.kind === kind);
      if (!primitive) {
        throw new Error(`Unknown primitive kind: ${kind}`);
      }

      const componentName = primitive.id;
      imports.add(`import { ${componentName} } from '@widget-factory/core';`);

      if (componentName === 'Icon' && props.name) {
        const iconName = toPascalCase(props.name);
        imports.add(`import { ${iconName} } from '@widget-factory/icons';`);
      }

      // Merge default props from registry with provided props
      const mergedProps = {};
      if (primitive.props) {
        for (const [key, propDef] of Object.entries(primitive.props)) {
          if (propDef.default !== undefined) {
            mergedProps[key] = propDef.default;
          }
        }
      }
      Object.assign(mergedProps, props);

      const propsCode = [];
      for (const [key, value] of Object.entries(mergedProps)) {
        if (key === 'name') continue;
        if (typeof value === 'string') {
          propsCode.push(`${key}="${value}"`);
        } else {
          propsCode.push(`${key}={${JSON.stringify(value)}}`);
        }
      }

      let styleCode = '';
      if (flex !== undefined) {
        propsCode.push(`style={{ flex: ${flex} }}`);
      }

      let children = '';
      if (componentName === 'Icon' && props.name) {
        const iconName = toPascalCase(props.name);
        children = `<${iconName} />`;
      } else if (content) {
        children = content;
      }

      const propsStr = propsCode.length > 0 ? ' ' + propsCode.join(' ') : '';

      if (children) {
        return `${indent}<${componentName}${propsStr}>${children}</${componentName}>`;
      } else {
        return `${indent}<${componentName}${propsStr} />`;
      }
    }

    return '';
  }

  if (widgetSpec.widget?.root) {
    const { width, height, backgroundColor, borderRadius, padding } = widgetSpec.widget;

    const rootContent = renderNode(widgetSpec.widget.root, 2);

    const importsCode = Array.from(imports).join('\n');

    const shellProps = [];
    if (width !== undefined) shellProps.push(`width={${width}}`);
    if (height !== undefined) shellProps.push(`height={${height}}`);
    if (backgroundColor) shellProps.push(`backgroundColor="${backgroundColor}"`);
    if (borderRadius !== undefined) shellProps.push(`borderRadius={${borderRadius}}`);
    if (padding !== undefined) shellProps.push(`padding={${padding}}`);

    const shellPropsStr = shellProps.length > 0 ? ' ' + shellProps.join(' ') : '';

    const code = `${importsCode}

export default function Widget() {
  return (
    <WidgetShell${shellPropsStr}>
${rootContent}
    </WidgetShell>
  );
}
`;

    return code;
  }

  throw new Error('Invalid widget spec: missing widget.root');
}

function toPascalCase(str) {
  return str
    .split(/[.-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
