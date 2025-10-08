import React from 'react';
import { WidgetShell } from './primitives/WidgetShell.jsx';
import { Text } from './primitives/Text.jsx';
import { Icon } from './primitives/Icon.jsx';
import { Sparkline } from './primitives/Sparkline.jsx';
import { AppLogo } from './primitives/AppLogo.jsx';
import { MapImage } from './primitives/MapImage.jsx';
import { Image } from './primitives/Image.jsx';
import { Checkbox } from './primitives/Checkbox.jsx';
// kind is deprecated; specs must use explicit `component`

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
    const { component, props = {}, flex, content } = node;

    // Resolve component name from explicit 'component' only
    const componentName = component;
    if (!componentName) {
      throw new Error('Invalid leaf node: missing component (kind is deprecated).');
    }

    // Rely solely on explicit props from spec
    const mergedProps = { ...props };

    const inspectProps = inspect ? { ['data-node-path']: pathArr.join('.'), ['data-node-type']: 'leaf' } : {};

    if (componentName === 'Icon') {
      const el = <Icon {...mergedProps} flex={flex} {...inspectProps} />;
      return el;
    }

    if (componentName === 'Text') {
      const el = <Text {...mergedProps} flex={flex} {...inspectProps}>{content}</Text>;
      return el;
    }

    if (componentName === 'Sparkline') {
      const el = <Sparkline {...mergedProps} flex={flex} {...inspectProps} />;
      return el;
    }

    if (componentName === 'AppLogo') {
      const el = <AppLogo {...mergedProps} flex={flex} {...inspectProps} />;
      return el;
    }

    if (componentName === 'MapImage') {
      const el = <MapImage {...mergedProps} flex={flex} {...inspectProps} />;
      return el;
    }

    if (componentName === 'Image') {
      const el = <Image {...mergedProps} flex={flex} {...inspectProps} />;
      return el;
    }

    if (componentName === 'Checkbox') {
      const el = <Checkbox {...mergedProps} flex={flex} {...inspectProps} />;
      return el;
    }

    throw new Error(`Unknown component: ${componentName}`);
  }

  return null;
}

export function renderWidgetFromSpec(spec, options = {}) {
  if (!spec.widget?.root) {
    throw new Error('Invalid widget spec: missing widget.root');
  }

  const { backgroundColor, borderRadius, padding, width, height } = spec.widget;
  const { inspect = false } = options;

  return function WidgetComponent() {
    return (
      <WidgetShell
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
        padding={padding}
        width={width}
        height={height}
      >
        {inspect ? renderNode(spec.widget.root, ['0'], true) : renderNode(spec.widget.root)}
      </WidgetShell>
    );
  };
}
