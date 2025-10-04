import React from 'react';
import { WidgetShell } from './WidgetShell.jsx';
import { Text } from './Text.jsx';
import { Icon } from './Icon.jsx';
import { Sparkline } from './Sparkline.jsx';
import { AppLogo } from './AppLogo.jsx';
import { MapImage } from './MapImage.jsx';
import { Image } from './Image.jsx';
import { Checkbox } from './Checkbox.jsx';
import * as Icons from '@widget-factory/icons';
import registry from '../primitives-registry.json';

function toPascalCase(str) {
  return str
    .split(/[.-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function renderNode(node) {
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

    return (
      <div style={styles}>
        {children.map((child, index) => (
          <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
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

    const style = flex !== undefined ? { flex } : undefined;

    if (componentName === 'Icon' && mergedProps.name) {
      const iconName = toPascalCase(mergedProps.name);
      const IconComponent = Icons[iconName];
      if (!IconComponent) {
        throw new Error(`Unknown icon: ${iconName}`);
      }
      return (
        <Icon {...mergedProps} style={style}>
          <IconComponent />
        </Icon>
      );
    }

    if (componentName === 'Text') {
      return <Text {...mergedProps} style={style}>{content}</Text>;
    }

    if (componentName === 'Sparkline') {
      return <Sparkline {...mergedProps} style={style} />;
    }

    if (componentName === 'AppLogo') {
      return <AppLogo {...mergedProps} style={style} />;
    }

    if (componentName === 'MapImage') {
      return <MapImage {...mergedProps} style={style} />;
    }

    if (componentName === 'Image') {
      return <Image {...mergedProps} style={style} />;
    }

    if (componentName === 'Checkbox') {
      return <Checkbox {...mergedProps} style={style} />;
    }

    throw new Error(`Unknown component: ${componentName}`);
  }

  return null;
}

export function renderWidgetFromSpec(spec) {
  if (!spec.widget?.root) {
    throw new Error('Invalid widget spec: missing widget.root');
  }

  const { backgroundColor, borderRadius, padding } = spec.widget;

  return function WidgetComponent() {
    return (
      <WidgetShell
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
        padding={padding}
      >
        {renderNode(spec.widget.root)}
      </WidgetShell>
    );
  };
}
