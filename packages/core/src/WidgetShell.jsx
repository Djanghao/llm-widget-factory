import React from 'react';

export function WidgetShell({
  width,
  height,
  backgroundColor = '#f2f2f7',
  borderRadius = 20,
  padding = 16,
  children,
  style = {}
}) {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        borderRadius,
        padding,
        overflow: 'hidden',
        display: 'flex',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {children}
    </div>
  );
}
