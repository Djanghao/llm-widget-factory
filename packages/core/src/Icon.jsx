import React from 'react';

export function Icon({ size = 20, color = '#000000', children, style = {}, ...rest }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
