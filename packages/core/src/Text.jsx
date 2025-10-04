import React from 'react';

export function Text({
  fontSize = 14,
  color = '#000000',
  align = 'left',
  fontWeight = 400,
  lineHeight = 1.3,
  children,
  style = {},
  ...rest
}) {
  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign: align,
        fontWeight,
        lineHeight,
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
