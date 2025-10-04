import React from 'react';

export function WidgetShell({
  backgroundColor = '#f2f2f7',
  borderRadius = 20,
  padding = 16,
  children,
  style = {}
}) {
  return (
    <div
      style={{
        backgroundColor,
        borderRadius,
        padding,
        overflow: 'hidden',
        display: 'inline-flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {children}
    </div>
  );
}
