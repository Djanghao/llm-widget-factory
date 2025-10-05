import React from 'react';
import { WidgetShell } from './primitives/WidgetShell.jsx';
import { Text } from './primitives/Text.jsx';
import { Icon } from './primitives/Icon.jsx';
import { Sparkline } from './primitives/Sparkline.jsx';
import { AppLogo } from './primitives/AppLogo.jsx';
import { MapImage } from './primitives/MapImage.jsx';
import { Image } from './primitives/Image.jsx';
import { Checkbox } from './primitives/Checkbox.jsx';
import registry from '../primitives-registry.json';

function renderNode(node, pathArr = [], inspect = false) {
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
      const alignMap = {
        start: 'flex-start',
        end: 'flex-end',
        center: 'center',
        between: 'space-between'
      };
      styles.justifyContent = alignMap[alignMain] || alignMain;
    }

    if (alignCross) {
      const alignMap = {
        start: 'flex-start',
        end: 'flex-end',
        center: 'center'
      };
      styles.alignItems = alignMap[alignCross] || alignCross;
    }

    if (inspect) {
      const path = pathArr.join('.');
      return (
        <div style={styles} data-node-path={path} data-node-type="container">
          {children.map((child, index) => (
            <React.Fragment key={index}>{renderNode(child, pathArr.concat(index), inspect)}</React.Fragment>
          ))}
        </div>
      );
    }

    return (
      <div style={styles}>
        {children.map((child, index) => (
          <React.Fragment key={index}>{renderNode(child, undefined, inspect)}</React.Fragment>
        ))}
      </div>
    );
  }

  if (node.type === 'leaf') {
    const { kind, props = {}, flex, content } = node;

    const primitive = Object.values(registry.primitives).find(p => p.kind === kind);
    if (!primitive) {
      throw new Error(`Unknown primitive kind: ${kind}`);
    }

    const componentName = primitive.id;

    const mergedProps = {};
    if (primitive.props) {
      for (const [key, propDef] of Object.entries(primitive.props)) {
        if (propDef.default !== undefined) {
          mergedProps[key] = propDef.default;
        }
      }
    }
    Object.assign(mergedProps, props);

    const style = flex !== undefined ? { flex } : undefined;

    if (componentName === 'Icon') {
      const el = <Icon {...mergedProps} style={style} />;
      if (!inspect) return el;
      return (
        <span style={{ display: 'contents' }} data-node-path={pathArr.join('.')} data-node-type="leaf">{el}</span>
      );
    }

    if (componentName === 'Text') {
      const el = <Text {...mergedProps} style={style}>{content}</Text>;
      if (!inspect) return el;
      return <span style={{ display: 'contents' }} data-node-path={pathArr.join('.')} data-node-type="leaf">{el}</span>;
    }

    if (componentName === 'Sparkline') {
      const el = <Sparkline {...mergedProps} style={style} />;
      if (!inspect) return el;
      return <span style={{ display: 'contents' }} data-node-path={pathArr.join('.')} data-node-type="leaf">{el}</span>;
    }

    if (componentName === 'AppLogo') {
      const el = <AppLogo {...mergedProps} style={style} />;
      if (!inspect) return el;
      return <span style={{ display: 'contents' }} data-node-path={pathArr.join('.')} data-node-type="leaf">{el}</span>;
    }

    if (componentName === 'MapImage') {
      const el = <MapImage {...mergedProps} style={style} />;
      if (!inspect) return el;
      return <span style={{ display: 'contents' }} data-node-path={pathArr.join('.')} data-node-type="leaf">{el}</span>;
    }

    if (componentName === 'Image') {
      const el = <Image {...mergedProps} style={style} />;
      if (!inspect) return el;
      return <span style={{ display: 'contents' }} data-node-path={pathArr.join('.')} data-node-type="leaf">{el}</span>;
    }

    if (componentName === 'Checkbox') {
      const el = <Checkbox {...mergedProps} style={style} />;
      if (!inspect) return el;
      return <span style={{ display: 'contents' }} data-node-path={pathArr.join('.')} data-node-type="leaf">{el}</span>;
    }

    throw new Error(`Unknown component: ${componentName}`);
  }

  return null;
}

export function renderWidgetFromSpec(spec, options = {}) {
  if (!spec.widget?.root) {
    throw new Error('Invalid widget spec: missing widget.root');
  }

  const { backgroundColor, borderRadius, padding } = spec.widget;
  const { inspect = false } = options;

  return function WidgetComponent() {
    return (
      <WidgetShell
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
        padding={padding}
      >
        {inspect ? renderNode(spec.widget.root, ['0'], true) : renderNode(spec.widget.root)}
      </WidgetShell>
    );
  };
}
