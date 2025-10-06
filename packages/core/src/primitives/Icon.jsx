import React from 'react'
import { iconsMap, metadata as iconsMetadata } from '@widget-factory/icons'

export function Icon({ name, size = 20, color = '#000000', flex, style = {}, ...rest }) {
  const IconComp = name ? iconsMap?.[name] : null
  const isSingle = name && iconsMetadata && iconsMetadata[name] ? !!iconsMetadata[name].isSingleColor : false
  const applyColor = IconComp ? isSingle : true
  const wrapperStyle = {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...(applyColor ? { color } : {}),
    ...style,
    ...(flex !== undefined ? { flex } : {})
  }
  if (!IconComp) {
    return (
      <div {...rest} style={wrapperStyle}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity="0.2" />
          <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    )
  }
  return (
    <div {...rest} style={wrapperStyle}>
      <IconComp />
    </div>
  )
}
