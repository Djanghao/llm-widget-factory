import React, { useEffect, useRef, useState } from 'react';

export default function SpecHighlightOverlay({ textareaRef, activeRange, color = 'rgba(255,214,10,0.18)' }) {
  const [metrics, setMetrics] = useState({
    lineHeight: 20,
    innerTop: 0,
    innerLeft: 0,
    contentWidth: 0,
    contentHeight: 0,
    borderRadius: 0,
    scrollTop: 0,
  });

  useEffect(() => {
    const ta = textareaRef?.current;
    if (!ta) return;
    const compute = () => {
      const cs = window.getComputedStyle(ta);
      const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.6) || 20;
      const pt = parseFloat(cs.paddingTop) || 0;
      const pb = parseFloat(cs.paddingBottom) || 0;
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      const innerTop = ta.offsetTop + ta.clientTop + pt;
      const innerLeft = ta.offsetLeft + ta.clientLeft + pl;
      const contentWidth = ta.clientWidth - pl - pr;
      const contentHeight = ta.clientHeight - pt - pb;
      const br = parseFloat(cs.borderRadius) || 0;
      setMetrics({ lineHeight: lh, innerTop, innerLeft, contentWidth, contentHeight, borderRadius: br, scrollTop: ta.scrollTop });
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
  const { lineHeight, innerTop, innerLeft, contentWidth, contentHeight, borderRadius, scrollTop } = metrics;
  const { lineStart, lineEnd } = activeRange;
  const localTop = (lineStart - 1) * lineHeight - scrollTop;
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
          top: innerTop,
          left: innerLeft,
          width: contentWidth,
          height: contentHeight,
          overflow: 'hidden',
          borderRadius: Math.max(0, borderRadius - 2)
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: localTop,
            left: 0,
            right: 0,
            height,
            background: color,
            borderRadius: 6,
            boxShadow: 'inset 0 0 0 1px rgba(255,214,10,0.4)'
          }}
        />
      </div>
    </div>
  );
}
