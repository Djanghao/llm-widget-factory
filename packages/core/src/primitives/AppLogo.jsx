import React from 'react';

export function AppLogo({
  size = 20,
  name = '',
  backgroundColor = '#007AFF',
  style = {},
  ...rest
}) {
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div
      {...rest}
      style={{
        width: size,
        height: size,
        backgroundColor,
        borderRadius: size * 0.22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        fontWeight: 600,
        color: '#ffffff',
        ...style
      }}
    >
      {firstLetter}
    </div>
  );
}
