import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { compileWidgetSpecToJSX } from '@widget-factory/compiler';
import TreeView from './TreeView.jsx';
import Widget from './generated/Widget.jsx';
import weatherSmallLight from './examples/weather-small-light.json';
import weatherMediumDark from './examples/weather-medium-dark.json';
import calendarSmallLight from './examples/calendar-small-light.json';
import calendarSmallDark from './examples/calendar-small-dark.json';
import notesSmallLight from './examples/notes-small-light.json';
import notesSmallDark from './examples/notes-small-dark.json';
import stockMediumDark from './examples/stock-medium-dark.json';
import remindersLargeLight from './examples/reminders-large-light.json';
import photoMediumLight from './examples/photo-medium-light.json';
import mapMediumDark from './examples/map-medium-dark.json';

function App() {
  const [selectedExample, setSelectedExample] = useState('weatherSmallLight');
  const [editedSpec, setEditedSpec] = useState('');
  const [showComponentsModal, setShowComponentsModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [treeRoot, setTreeRoot] = useState(null);
  const previewContainerRef = useRef(null);
  const widgetFrameRef = useRef(null);
  const treeContainerRef = useRef(null);
  const specTextareaRef = useRef(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const latestWriteTokenRef = useRef(0);
  const expectedSizeRef = useRef(null);
  const resizingRef = useRef(false);

  const handleSelectNode = (path) => setSelectedPath(prev => (prev === path ? null : path));

  useEffect(() => {
    const onDocClick = (e) => {
      if (!treeContainerRef.current) return;
      if (!treeContainerRef.current.contains(e.target)) {
        setSelectedPath(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const examples = {
    weatherSmallLight: { name: 'Weather S-Light', spec: weatherSmallLight },
    weatherMediumDark: { name: 'Weather M-Dark', spec: weatherMediumDark },
    calendarSmallLight: { name: 'Calendar S-Light', spec: calendarSmallLight },
    calendarSmallDark: { name: 'Calendar S-Dark', spec: calendarSmallDark },
    notesSmallLight: { name: 'Notes S-Light', spec: notesSmallLight },
    notesSmallDark: { name: 'Notes S-Dark', spec: notesSmallDark },
    stockMediumDark: { name: 'Stock M-Dark', spec: stockMediumDark },
    remindersLargeLight: { name: 'Reminders L-Light', spec: remindersLargeLight },
    photoMediumLight: { name: 'Photo M-Light', spec: photoMediumLight },
    mapMediumDark: { name: 'Map M-Dark', spec: mapMediumDark }
  };

  const currentExample = examples[selectedExample];
  const currentSpec = editedSpec || JSON.stringify(currentExample.spec, null, 2);

  useEffect(() => {
    const compileAndWrite = async () => {
      try {
        const spec = editedSpec ? JSON.parse(editedSpec) : currentExample.spec;
        const jsx = compileWidgetSpecToJSX(spec);
        setGeneratedCode(jsx);
        setTreeRoot(spec?.widget || null);

        const isResizeWrite = !!resizingRef.current;
        if (isResizeWrite) {
          latestWriteTokenRef.current += 1;
          const token = latestWriteTokenRef.current;
          const w = spec?.widget?.width;
          const h = spec?.widget?.height;
          expectedSizeRef.current = typeof w === 'number' && typeof h === 'number' ? { width: Math.round(w), height: Math.round(h) } : null;
          setIsLoading(true);

          await fetch('/__write_widget', {
            method: 'POST',
            body: jsx,
            headers: { 'Content-Type': 'text/plain' }
          });

          if (!expectedSizeRef.current && latestWriteTokenRef.current === token) {
            setIsLoading(false);
          }
        } else {
          expectedSizeRef.current = null;
          setIsLoading(false);
          await fetch('/__write_widget', {
            method: 'POST',
            body: jsx,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      } catch (err) {
        setGeneratedCode(`// Error: ${err.message}`);
        setTreeRoot(null);
        setIsLoading(false);
      }
    };

    compileAndWrite();
  }, [currentExample, editedSpec]);

  const handleSpecChange = (value) => {
    setEditedSpec(value);
  };

  // Track live widget frame size using ResizeObserver for accurate measurement guides
  useEffect(() => {
    if (!widgetFrameRef.current) return;
    const el = widgetFrameRef.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      setFrameSize(next);
      const expected = expectedSizeRef.current;
      if (expected && next.width === expected.width && next.height === expected.height) {
        setIsLoading(false);
      }
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [widgetFrameRef.current]);

  // Ensure `widget.root` is serialized as the last key in `widget`
  const formatSpecWithRootLast = (spec) => {
    if (!spec || typeof spec !== 'object') return spec;
    const w = spec.widget;
    if (!w || typeof w !== 'object' || !('root' in w)) return spec;
    const { root, ...rest } = w;
    // Reassemble with `root` placed last
    return { ...spec, widget: { ...rest, root } };
  };

  const handleExampleChange = (key) => {
    setSelectedExample(key);
    setEditedSpec('');
    setSelectedPath(null);
  };

  const parseCurrentSpecObject = () => {
    try {
      return editedSpec ? JSON.parse(editedSpec) : JSON.parse(JSON.stringify(currentExample.spec));
    } catch {
      return null;
    }
  };

  const applySizeToSpec = (width, height) => {
    const obj = parseCurrentSpecObject();
    if (!obj || !obj.widget) return;
    const next = { ...obj, widget: { ...obj.widget } };
    next.widget.width = Math.max(1, Math.round(width));
    next.widget.height = Math.max(1, Math.round(height));
    setEditedSpec(JSON.stringify(formatSpecWithRootLast(next), null, 2));
  };

  const restoreSizeInSpec = () => {
    const obj = parseCurrentSpecObject();
    if (!obj || !obj.widget) return;
    const next = { ...obj, widget: { ...obj.widget } };
    delete next.widget.width;
    delete next.widget.height;
    setEditedSpec(JSON.stringify(formatSpecWithRootLast(next), null, 2));
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#1c1c1e',
      padding: '24px 32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <header style={{ marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: '#f5f5f7', letterSpacing: '-0.5px' }}>
              Widget Factory
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowComponentsModal(true)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: '#2c2c2e',
                color: '#f5f5f7',
                border: '1px solid #3a3a3c',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2c2c2e'}
            >
              Component Library
            </button>
          </div>
        </div>
      </header>

      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <h3 style={{
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 12,
          color: '#6e6e73',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Presets
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(examples).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => handleExampleChange(key)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 500,
                backgroundColor: selectedExample === key ? '#007AFF' : '#2c2c2e',
                color: '#f5f5f7',
                border: selectedExample === key ? 'none' : '1px solid #3a3a3c',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedExample === key ? '0 0 0 3px rgba(0, 122, 255, 0.2)' : 'none'
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gridTemplateAreas: '"spec preview" "code tree"',
          gap: 16,
          minWidth: 0,
          flex: 1,
          minHeight: 0,
          paddingBottom: 24,
          gridAutoRows: 'minmax(0, 1fr)'
        }}>

          <div style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gridArea: 'spec' }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#34C759'
              }} />
              WidgetSpec
            </h2>
            <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
              <textarea
                value={currentSpec}
                onChange={(e) => handleSpecChange(e.target.value)}
                spellCheck={false}
                ref={specTextareaRef}
                style={{
                  width: '100%',
                  height: '100%',
                  padding: 16,
                  fontSize: 13,
                  fontFamily: 'Monaco, Consolas, monospace',
                  backgroundColor: '#0d0d0d',
                  color: '#f5f5f7',
                  border: '1px solid #3a3a3c',
                  borderRadius: 10,
                  resize: 'none',
                  boxSizing: 'border-box',
                  overflowY: 'auto',
                  lineHeight: 1.6,
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007AFF'}
                onBlur={(e) => e.target.style.borderColor = '#3a3a3c'}
              />
            </div>
          </div>

          <div style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gridArea: 'code' }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#FF9500'
              }} />
              Generated widget.jsx
            </h2>
            <div style={{
              flex: 1,
              minHeight: 0,
              borderRadius: 10,
              border: '1px solid #3a3a3c',
              backgroundColor: '#1e1e1e',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <SyntaxHighlighter
                  language="jsx"
                  style={vscDarkPlus}
                  showLineNumbers
                  wrapLongLines={false}
                  customStyle={{
                    margin: 0,
                    fontSize: 13,
                    borderRadius: 10,
                    whiteSpace: 'pre',
                    minHeight: 0,
                    overflow: 'visible'
                  }}
                >
                  {generatedCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>

          <div style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gridArea: 'preview' }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#007AFF'
              }} />
              Preview
              <button
                onClick={restoreSizeInSpec}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 500,
                  backgroundColor: '#2c2c2e',
                  color: '#f5f5f7',
                  border: '1px solid #3a3a3c',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2c2c2e'}
                title="Restore widget size"
              >
                Restore
              </button>
            </h2>
          <div style={{
              backgroundColor: '#0d0d0d',
              padding: 40,
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              minHeight: 0,
              boxSizing: 'border-box',
              border: '1px solid #3a3a3c',
              position: 'relative',
              overflow: 'auto'
            }} ref={previewContainerRef}>
              <div
                ref={widgetFrameRef}
                style={{ position: 'relative', display: 'inline-block' }}
              >
                <Widget />
                {isLoading && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.12)',
                      zIndex: 3,
                      pointerEvents: 'none'
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" role="img" aria-label="Loading">
                      <circle cx="12" cy="12" r="10" stroke="#8e8e93" strokeWidth="3" fill="none" opacity="0.25" />
                      <path d="M12 2 a10 10 0 0 1 0 20" stroke="#007AFF" strokeWidth="3" strokeLinecap="round" fill="none">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
                      </path>
                    </svg>
                  </div>
                )}
                {/* Measurement overlays for width / height (no aspect ratio) */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 4
                  }}
                >
                  {/* Horizontal measurement line (above widget) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: -20,
                      height: 0
                    }}
                  >
                    {/* end ticks */}
                    <div style={{ position: 'absolute', left: 0, top: -5, width: 1, height: 12, background: '#8e8e93' }} />
                    <div style={{ position: 'absolute', right: 0, top: -5, width: 1, height: 12, background: '#8e8e93' }} />
                    {/* center dashed line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 1,
                        height: 1,
                        backgroundImage: 'repeating-linear-gradient(90deg, rgba(142,142,147,0.9) 0 6px, rgba(142,142,147,0) 6px 12px)'
                      }}
                    />
                    {/* label capsule */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        transform: 'translate(-50%, -60%)',
                        background: 'rgba(44,44,46,0.9)',
                        color: '#d1d1d6',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 9999,
                        padding: '3px 10px',
                        fontSize: 11,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        letterSpacing: 0.2,
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {frameSize.width}px
                    </div>
                  </div>

                  {/* Vertical measurement line (right of widget) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 'calc(100% + 16px)',
                      width: 0
                    }}
                  >
                    {/* end ticks */}
                    <div style={{ position: 'absolute', left: -5, top: 0, width: 12, height: 1, background: '#8e8e93' }} />
                    <div style={{ position: 'absolute', left: -5, bottom: 0, width: 12, height: 1, background: '#8e8e93' }} />
                    {/* center dashed line */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 1,
                        width: 1,
                        backgroundImage: 'repeating-linear-gradient(180deg, rgba(142,142,147,0.9) 0 6px, rgba(142,142,147,0) 6px 12px)'
                      }}
                    />
                    {/* label capsule */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(44,44,46,0.9)',
                        color: '#d1d1d6',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 9999,
                        padding: '3px 10px',
                        fontSize: 11,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        letterSpacing: 0.2,
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {frameSize.height}px
                    </div>
                  </div>
                </div>
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const frame = widgetFrameRef.current;
                    if (!frame) return;
                    const rect = frame.getBoundingClientRect();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startW = rect.width;
                    const startH = rect.height;
                    resizingRef.current = true;

                    const onMove = (ev) => {
                      const dx = ev.clientX - startX;
                      const dy = ev.clientY - startY;
                      const nw = Math.max(40, Math.round(startW + dx));
                      const nh = Math.max(40, Math.round(startH + dy));
                      applySizeToSpec(nw, nh);
                    };
                    const onUp = () => {
                      window.removeEventListener('mousemove', onMove);
                      window.removeEventListener('mouseup', onUp);
                      resizingRef.current = false;
                    };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                  style={{
                    position: 'absolute',
                    width: 14,
                    height: 14,
                    right: -7,
                    bottom: -7,
                    background: '#007AFF',
                    borderRadius: 4,
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 0 1px #3a3a3c',
                    cursor: 'se-resize',
                    zIndex: 5
                  }}
                  title="Drag to resize"
                />
              </div>
            </div>
          </div>

          <div ref={treeContainerRef} style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gridArea: 'tree' }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#BF5AF2'
              }} />
              Tree
            </h2>
            <TreeView
              root={treeRoot}
              style={{ flex: 1, minHeight: 0 }}
              selectedPath={selectedPath}
              onSelect={handleSelectNode}
            />
          </div>
        </div>

      {showComponentsModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowComponentsModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1c1c1e',
              borderRadius: 16,
              padding: 32,
              maxWidth: '900px',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid #3a3a3c'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#f5f5f7' }}>
                Component Library
              </h2>
              <button
                onClick={() => setShowComponentsModal(false)}
                style={{
                  backgroundColor: '#2c2c2e',
                  border: '1px solid #3a3a3c',
                  color: '#f5f5f7',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
                  Flex Usage
                </h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ fontSize: 13, color: '#98989d' }}>
                    Use CSS-like shorthand or longhand. Longhand overrides shorthand.
                  </div>
                  <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                    Shorthand: flex: 0 | "0 0 auto" | "1 0 auto" | "1 1 auto"
                  </div>
                  <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                    Longhand: flexGrow / flexShrink / flexBasis (overrides flex)
                  </div>
                  <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                    Text default: 0 1 auto. Fixed media (Icon/Image/MapImage/AppLogo/Checkbox) default: none (0 0 auto).
                  </div>
                  <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                    Sparkline uses pixel width/height (no responsive); control size via width/height or parent layout.
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
                  Text Components
                </h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>Text</code> - Title/Heading
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      Main headings and important text
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: fontSize (default: 18), color, fontWeight (default: 400), align
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginTop: 4 }}>
                      Default flex: 0 1 auto. Fill space: flex="1 0 auto".
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>Text</code> - Label
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      Secondary text and labels
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: fontSize (default: 13), color (#666666), fontWeight (default: 400), align
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginTop: 4 }}>
                      Default flex: 0 1 auto.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>Text</code> - Metric
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      Numbers with tabular figures
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: fontSize (default: 32), color, fontWeight (default: 600), align
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginTop: 4 }}>
                      Default flex: 0 1 auto.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
                  Media Components
                </h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>Icon</code> - Icon
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      SF Symbols style icons
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginBottom: 8 }}>
                      Props: size (default: 20), color, name (required)
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Default flex: none (0 0 auto). Use flex to override if needed.
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73' }}>
                      Available: heart.fill, star.fill, circle.fill, checkmark.circle.fill, cloud.sun.fill, flame.fill, bolt.fill, calendar
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>Image</code> - Image
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      Display images from URLs
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: width (required), height (required), url (required), borderRadius (default: 0)
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginTop: 4 }}>
                      objectFit: cover, Default flex: none (0 0 auto).
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>MapImage</code> - Map Image
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      Display map images
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: width (required), height (required), url (required)
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginTop: 4 }}>
                      objectFit: cover, Default flex: none (0 0 auto).
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>AppLogo</code> - App Logo
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      App icon with first letter
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: size (default: 20), name (required), backgroundColor (default: #007AFF)
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginTop: 4 }}>
                      Default flex: none (0 0 auto).
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
                  Chart Components
                </h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>Sparkline</code> - Sparkline
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      Small line chart for trends
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: width (default: 80), height (default: 40), color (default: #34C759), data (required array)
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginTop: 4 }}>
                      Uses pixel width/height; not responsive by default. Control layout via parent or width.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
                  Control Components
                </h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>Checkbox</code> - Checkbox
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      Circular checkbox
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: size (default: 20), checked (default: false), color (default: #FF3B30)
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace', marginTop: 4 }}>
                      Default flex: none (0 0 auto).
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
                  Layout
                </h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#f5f5f7', fontWeight: 600, marginBottom: 8 }}>
                      <code style={{ color: '#FF9500', backgroundColor: '#3a3a3c', padding: '2px 6px', borderRadius: 4 }}>container</code> - Flex Container
                    </div>
                    <div style={{ fontSize: 13, color: '#98989d', marginBottom: 8 }}>
                      Flexbox layout container
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73', fontFamily: 'Monaco, monospace' }}>
                      Props: direction (row|col), gap, padding, alignMain (start|end|center|between), alignCross (start|end|center), flex, backgroundColor
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
