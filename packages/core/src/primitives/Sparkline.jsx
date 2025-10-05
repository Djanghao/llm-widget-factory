import React, { useEffect, useRef } from 'react';

export function Sparkline({
  width = 80,
  height = 40,
  color = '#34C759',
  data = [],
  style = {},
  ...rest
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length < 2 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [width, height, color, data]);

  return (
    <canvas
      ref={canvasRef}
      {...rest}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'block',
        flexShrink: 0,
        ...style
      }}
    />
  );
}
