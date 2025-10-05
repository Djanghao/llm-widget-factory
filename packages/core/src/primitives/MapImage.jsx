import React from 'react';

export function MapImage({
  width,
  height,
  url,
  style = {}
}) {
  return (
    <img
      src={url}
      alt="Map"
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

