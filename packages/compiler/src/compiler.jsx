import React from 'react';
import { WidgetShell } from '@widget-factory/primitives';
import { Text } from '@widget-factory/primitives';
import { Icon } from '@widget-factory/primitives';
import { Sparkline } from '@widget-factory/primitives';
import { AppLogo } from '@widget-factory/primitives';
import { MapImage } from '@widget-factory/primitives';
import { Image } from '@widget-factory/primitives';
import { Checkbox } from '@widget-factory/primitives';

function buildCodeAndMap(widgetSpec) {
  const imports = new Set();
  imports.add("import React from 'react';");
  imports.add("import { WidgetShell } from '@widget-factory/primitives';");

  const map = {};
  const lines = [];
  const write = (line) => { lines.push(line); };
  const formatJsxPropValue = (value) =>
    typeof value === 'string' ? `=${JSON.stringify(value)}` : `={${JSON.stringify(value)}}`;

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
      const { component, props = {}, flex, content } = node;

      const componentName = component;
      if (!componentName) {
        throw new Error('Invalid leaf node: missing component (kind is deprecated).');
      }
      imports.add(`import { ${componentName} } from '@widget-factory/primitives';`);

      const mergedProps = { ...props };

      const propsCode = [];
      for (const [key, value] of Object.entries(mergedProps)) {
        if (typeof value === 'string') propsCode.push(`${key}="${value}"`);
        else propsCode.push(`${key}={${JSON.stringify(value)}}`);
      }
      if (flex !== undefined) propsCode.push(`flex={${flex}}`);

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
  const { backgroundColor, borderRadius, padding, width, height } = widgetSpec.widget;
  const shellProps = [];
  if (backgroundColor) shellProps.push(`backgroundColor="${backgroundColor}"`);
  if (borderRadius !== undefined) shellProps.push(`borderRadius={${borderRadius}}`);
  if (padding !== undefined) shellProps.push(`padding={${padding}}`);
  if (width !== undefined) shellProps.push(`width${formatJsxPropValue(width)}`);
  if (height !== undefined) shellProps.push(`height${formatJsxPropValue(height)}`);
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

export function compileWidgetSpecToComponent(widgetSpec, options = {}) {
  if (!widgetSpec.widget?.root) {
    throw new Error('Invalid widget spec: missing widget.root');
  }
  const { inspect = false } = options;

  function renderNode(node, pathArr = []) {
    if (node.type === 'container') {
      const { direction = 'row', gap = 8, padding, alignMain, alignCross, flex, backgroundColor, children = [] } = node;
      const styles = {
        display: 'flex',
        flexDirection: direction === 'col' ? 'column' : 'row'
      };
      if (gap) styles.gap = gap;
      if (padding) styles.padding = padding;
      if (flex !== undefined) styles.flex = flex;
      if (backgroundColor) styles.backgroundColor = backgroundColor;

      if (alignMain) {
        const alignMap = { start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between' };
        styles.justifyContent = alignMap[alignMain] || alignMain;
      }
      if (alignCross) {
        const alignMap = { start: 'flex-start', end: 'flex-end', center: 'center' };
        styles.alignItems = alignMap[alignCross] || alignCross;
      }

      const wrapperProps = inspect ? { ['data-node-path']: pathArr.join('.'), ['data-node-type']: 'container' } : {};
      return (
        <div style={styles} {...wrapperProps}>
          {children.map((child, index) => (
            <React.Fragment key={index}>{renderNode(child, pathArr.concat(index))}</React.Fragment>
          ))}
        </div>
      );
    }

    if (node.type === 'leaf') {
      const { component, props = {}, flex, content } = node;
      const componentName = component;
      if (!componentName) throw new Error('Invalid leaf node: missing component (kind is deprecated).');

      const mergedProps = { ...props };
      const flexProp = flex;
      const inspectProps = inspect ? { ['data-node-path']: pathArr.join('.'), ['data-node-type']: 'leaf' } : {};

      if (componentName === 'Icon') return <Icon {...mergedProps} flex={flexProp} {...inspectProps} />;
      if (componentName === 'Text') return <Text {...mergedProps} flex={flexProp} {...inspectProps}>{content}</Text>;
      if (componentName === 'Sparkline') return <Sparkline {...mergedProps} flex={flexProp} {...inspectProps} />;
      if (componentName === 'AppLogo') return <AppLogo {...mergedProps} flex={flexProp} {...inspectProps} />;
      if (componentName === 'MapImage') return <MapImage {...mergedProps} flex={flexProp} {...inspectProps} />;
      if (componentName === 'Image') return <Image {...mergedProps} flex={flexProp} {...inspectProps} />;
      if (componentName === 'Checkbox') return <Checkbox {...mergedProps} flex={flexProp} {...inspectProps} />;
      throw new Error(`Unknown component: ${componentName}`);
    }

    return null;
  }

  const { backgroundColor, borderRadius, padding, width, height } = widgetSpec.widget;
  return function WidgetComponent() {
    return (
      <WidgetShell
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
        padding={padding}
        width={width}
        height={height}
      >
        {renderNode(widgetSpec.widget.root, ['0'])}
      </WidgetShell>
    );
  };
}

function toPascalCase(str) {
  return str
    .split(/[.-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
