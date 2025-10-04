import React from 'react';

export function Checkbox({
  size = 20,
  checked = false,
  color = '#FF3B30',
  style = {}
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        border: checked ? 'none' : `2px solid ${color}`,
        backgroundColor: checked ? color : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {checked && (
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}
