import React from 'react';

export function Image({
  width,
  height,
  url,
  borderRadius = 0,
  flex,
  flexGrow,
  flexShrink,
  flexBasis,
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
        flex: '0 0 auto',
        flexShrink: 0,
        ...style,
        ...(flex !== undefined ? { flex } : {}),
        ...(flexGrow !== undefined ? { flexGrow } : {}),
        ...(flexShrink !== undefined ? { flexShrink } : {}),
        ...(flexBasis !== undefined ? { flexBasis } : {})
      }}
    />
  );
}
