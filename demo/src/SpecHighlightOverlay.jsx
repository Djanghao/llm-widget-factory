import React, { useEffect, useMemo, useState } from 'react';

export default function SpecHighlightOverlay({ textareaRef, activeRange, color = 'rgba(255,214,10,0.18)' }) {
  const [metrics, setMetrics] = useState({ lineHeight: 20, paddingTop: 16, paddingLeft: 16, scrollTop: 0 });

  useEffect(() => {
    const ta = textareaRef?.current;
    if (!ta) return;
    const compute = () => {
      const cs = window.getComputedStyle(ta);
      const lh = parseFloat(cs.lineHeight) || 20;
      const pt = parseFloat(cs.paddingTop) || 16;
      const pl = parseFloat(cs.paddingLeft) || 16;
      setMetrics({ lineHeight: lh, paddingTop: pt, paddingLeft: pl, scrollTop: ta.scrollTop });
    };
    compute();
    const onScroll = () => setMetrics(m => ({ ...m, scrollTop: ta.scrollTop }));
    ta.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      ta.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
    };
  }, [textareaRef]);

  if (!activeRange) return null;
  const { lineHeight, paddingTop, paddingLeft, scrollTop } = metrics;
  const { lineStart, lineEnd } = activeRange;
  const top = paddingTop + (lineStart - 1) * lineHeight - scrollTop;
  const height = (lineEnd - lineStart + 1) * lineHeight;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 2
      }}
    >
      <div
        style={{
          position: 'absolute',
          top,
          left: paddingLeft,
          right: paddingLeft,
          height,
          background: color,
          borderRadius: 6,
          boxShadow: 'inset 0 0 0 1px rgba(255,214,10,0.4)'
        }}
      />
    </div>
  );
}

