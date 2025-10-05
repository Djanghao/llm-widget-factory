import React from 'react';

export function Image({
  width,
  height,
  url,
  borderRadius = 0,
  style = {},
  ...rest
}) {
  return (
    <img
      src={url}
      alt="Widget Image"
      {...rest}
      style={{
        width,
        height,
        borderRadius,
        objectFit: 'cover',
        display: 'block',
        flexShrink: 0,
        ...style
      }}
    />
  );
}
