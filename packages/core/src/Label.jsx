import React from 'react';

export function Label({ fontSize = 13, color = '#666666', align = 'left', children, style = {} }) {
  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign: align,
        fontWeight: 400,
        lineHeight: 1.3,
        ...style
      }}
    >
      {children}
    </div>
  );
}
