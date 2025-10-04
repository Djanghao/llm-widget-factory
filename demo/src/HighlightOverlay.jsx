import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function HighlightOverlay({ containerRef, selectedPath, color = '#007AFF' }) {
  const overlayRef = useRef(null);
  const [rect, setRect] = useState(null);

  const updatePosition = () => {
    if (!containerRef?.current || !selectedPath) {
      setRect(null);
      return;
    }
    const container = containerRef.current;
    const target = container.querySelector(`[data-node-path="${selectedPath}"]`);
    if (!target) {
      setRect(null);
      return;
    }
    const cRect = container.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const top = tRect.top - cRect.top + container.scrollTop;
    const left = tRect.left - cRect.left + container.scrollLeft;
    setRect({ top, left, width: tRect.width, height: tRect.height });
  };

  useLayoutEffect(() => {
    updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath]);

  useEffect(() => {
    if (!containerRef?.current) return;
    const ro = new ResizeObserver(() => updatePosition());
    ro.observe(containerRef.current);
    const onScroll = () => updatePosition();
    containerRef.current.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      ro.disconnect();
      containerRef.current && containerRef.current.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  if (!rect) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* marching glow animation */}
      <style>{`
        @keyframes wf-pulse-glow {
          0% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.55), 0 0 0 6px ${color}55, 0 0 10px ${color}66; }
          50% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.55), 0 0 0 8px ${color}66, 0 0 16px ${color}aa; }
          100% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.55), 0 0 0 6px ${color}55, 0 0 10px ${color}66; }
        }
      `}</style>

      {/* Dim everything except the target rect */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: rect.top, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', top: rect.top + rect.height, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', top: rect.top, left: 0, width: rect.left, height: rect.height, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height, background: 'rgba(0,0,0,0.45)' }} />

      {/* High-contrast highlight box */}
      <div
        style={{
          position: 'absolute',
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: `2px solid ${color}`,
          borderRadius: 6,
          background: `${color}18`,
          outline: '2px solid #fff',
          outlineOffset: 2,
          animation: 'wf-pulse-glow 1.2s ease-in-out infinite',
        }}
      />
    </div>
  );
}
