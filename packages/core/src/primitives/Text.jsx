import React from 'react';

export function Text({
  fontSize = 14,
  color = '#000000',
  align = 'left',
  fontWeight = 400,
  lineHeight = 1.3,
  children,
  flex,
  style = {},
  ...rest
}) {
  return (
    <div
      {...rest}
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign: align,
        fontWeight,
        lineHeight,
        ...style,
        ...(flex !== undefined ? { flex } : {})
      }}
    >
      {children}
    </div>
  );
}
