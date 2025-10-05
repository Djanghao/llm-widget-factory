import React from 'react';

export function MapImage({
  width,
  height,
  url,
  style = {},
  ...rest
}) {
  return (
    <img
      src={url}
      alt="Map"
      {...rest}
      style={{
        width,
        height,
        objectFit: 'cover',
        display: 'block',
        flexShrink: 0,
        ...style
      }}
    />
  );
}
