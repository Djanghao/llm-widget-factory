import React from 'react';

export function Image({
  width,
  height,
  url,
  borderRadius = 0,
  style = {}
}) {
  return (
    <img
      src={url}
      alt="Widget Image"
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

