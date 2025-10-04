import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function HighlightOverlay({ containerRef, selectedPath, hoverPath, color = '#007AFF' }) {
  const overlayRef = useRef(null);
  const [rect, setRect] = useState(null);
  const activePath = hoverPath || selectedPath;

  const updatePosition = () => {
    if (!containerRef?.current || !activePath) {
      setRect(null);
      return;
    }
    const container = containerRef.current;
    const target = container.querySelector(`[data-node-path="${activePath}"]`);
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
  }, [activePath]);

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
  }, [containerRef, activePath]);

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
      <style>{`
        @keyframes wf-pulse-glow {
          0% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.55), 0 0 0 6px ${color}55, 0 0 10px ${color}66; }
          50% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.55), 0 0 0 8px ${color}66, 0 0 16px ${color}aa; }
          100% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.55), 0 0 0 6px ${color}55, 0 0 10px ${color}66; }
        }
      `}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: rect.top, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', top: rect.top + rect.height, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', top: rect.top, left: 0, width: rect.left, height: rect.height, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height, background: 'rgba(0,0,0,0.45)' }} />
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
