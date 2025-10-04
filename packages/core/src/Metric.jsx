import React from 'react';

export function Metric({ fontSize = 32, color = '#000000', align = 'left', children, style = {} }) {
  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign: align,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        ...style
      }}
    >
      {children}
    </div>
  );
}
