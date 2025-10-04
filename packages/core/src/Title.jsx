import React from 'react';

export function Title({ fontSize = 24, color = '#000000', align = 'left', children, style = {} }) {
  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign: align,
        fontWeight: 600,
        lineHeight: 1.2,
        ...style
      }}
    >
      {children}
    </div>
  );
}
