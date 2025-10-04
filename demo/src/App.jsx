import React, { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { compileWidgetSpec } from '@widget-factory/core/compiler.js';
import weatherSpec from './examples/weather-widget-spec.json';
import statsSpec from './examples/stats-widget-spec.json';
import dashboardSpec from './examples/dashboard-widget-spec.json';
import calendarSpec from './examples/calendar-widget-spec.json';
import stockSpec from './examples/stock-widget-spec.json';
import musicSpec from './examples/music-widget-spec.json';
import batterySpec from './examples/battery-widget-spec.json';

import WeatherWidget from './widgets/WeatherWidget.jsx';
import StatsWidget from './widgets/StatsWidget.jsx';
import DashboardWidget from './widgets/DashboardWidget.jsx';

function App() {
  const [selectedExample, setSelectedExample] = useState('weather');
  const [editedSpec, setEditedSpec] = useState('');

  const examples = {
    weather: { name: 'Weather', spec: weatherSpec, component: WeatherWidget },
    calendar: { name: 'Calendar', spec: calendarSpec },
    battery: { name: 'Battery', spec: batterySpec },
    stats: { name: 'Stats', spec: statsSpec, component: StatsWidget },
    music: { name: 'Music', spec: musicSpec },
    stock: { name: 'Stock (Dark)', spec: stockSpec },
    dashboard: { name: 'Dashboard', spec: dashboardSpec, component: DashboardWidget }
  };

  const currentExample = examples[selectedExample];

  const currentSpec = editedSpec || JSON.stringify(currentExample.spec, null, 2);

  const { generatedCode, PreviewWidget } = useMemo(() => {
    try {
      const spec = editedSpec ? JSON.parse(editedSpec) : currentExample.spec;
      const code = compileWidgetSpec(spec);

      // Dynamically create preview widget
      const WidgetComponent = currentExample.component || (() => {
        const { width, height, backgroundColor, borderRadius, padding } = spec.widget;
        return (
          <div style={{
            width, height, backgroundColor, borderRadius, padding,
            overflow: 'hidden', display: 'flex', boxSizing: 'border-box'
          }}>
            {/* Simplified preview - real widget would need full rendering */}
            <div style={{ color: '#666', fontSize: 13 }}>Preview unavailable</div>
          </div>
        );
      });

      return { generatedCode: code, PreviewWidget: WidgetComponent };
    } catch (error) {
      return {
        generatedCode: `// Error: ${error.message}`,
        PreviewWidget: () => <div style={{ color: '#ff453a', fontSize: 13 }}>Error: {error.message}</div>
      };
    }
  }, [currentExample, editedSpec]);

  const handleSpecChange = (value) => {
    setEditedSpec(value);
  };

  const handleExampleChange = (key) => {
    setSelectedExample(key);
    setEditedSpec('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1c1c1e',
      padding: '32px 48px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, color: '#f5f5f7', letterSpacing: '-0.5px' }}>
          Widget Factory
        </h1>
        <p style={{ fontSize: 17, color: '#98989d', marginTop: 8, fontWeight: 400 }}>
          WidgetSpec → JSX Compiler
        </p>
      </header>

      {/* Presets */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 16,
          color: '#6e6e73',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Presets
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(examples).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => handleExampleChange(key)}
              style={{
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: selectedExample === key ? '#007AFF' : '#2c2c2e',
                color: '#f5f5f7',
                border: selectedExample === key ? 'none' : '1px solid #3a3a3c',
                borderRadius: 8,
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

      {/* Main Layout: Spec → JSX → Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '30% 42% 28%', gap: 20 }}>
          {/* 1. WidgetSpec */}
          <div>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#34C759'
              }} />
              WidgetSpec
            </h2>
            <textarea
              value={currentSpec}
              onChange={(e) => handleSpecChange(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                height: 'calc(100vh - 300px)',
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

          {/* 2. Generated JSX */}
          <div>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              gap: 8
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
              height: 'calc(100vh - 300px)',
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid #3a3a3c'
            }}>
              <SyntaxHighlighter
                language="jsx"
                style={vscDarkPlus}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  fontSize: 13,
                  borderRadius: 10,
                  height: '100%',
                  overflow: 'auto'
                }}
              >
                {generatedCode}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* 3. Preview */}
          <div>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#007AFF'
              }} />
              Preview
            </h2>
            <div style={{
              backgroundColor: '#0d0d0d',
              padding: 40,
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 300px)',
              boxSizing: 'border-box',
              border: '1px solid #3a3a3c'
            }}>
              <PreviewWidget />
            </div>
          </div>
        </div>

      {/* Available Components Section */}
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #3a3a3c' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: '#f5f5f7' }}>
          Available Components
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {/* Text Components */}
          <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
              Text
            </h3>
            <div style={{ fontSize: 14, color: '#98989d', lineHeight: 1.8 }}>
              <div><code style={{ color: '#FF9500' }}>Title</code> - Main headings</div>
              <div><code style={{ color: '#FF9500' }}>Metric</code> - Numbers with tabular figures</div>
              <div><code style={{ color: '#FF9500' }}>Label</code> - Secondary text</div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#6e6e73' }}>
              Props: fontSize, color, align
            </div>
          </div>

          {/* Media Components */}
          <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
              Media
            </h3>
            <div style={{ fontSize: 14, color: '#98989d', lineHeight: 1.8 }}>
              <div><code style={{ color: '#FF9500' }}>Icon</code> - SF Symbols icons</div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#6e6e73' }}>
              Props: size, color, name
              <div style={{ marginTop: 8 }}>
                Available icons: heart.fill, star.fill, bolt.fill, calendar, checkmark.circle.fill
              </div>
            </div>
          </div>

          {/* Layout */}
          <div style={{ backgroundColor: '#2c2c2e', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#f5f5f7' }}>
              Layout
            </h3>
            <div style={{ fontSize: 14, color: '#98989d', lineHeight: 1.8 }}>
              <div><code style={{ color: '#FF9500' }}>container</code> - Flex layout</div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#6e6e73' }}>
              Props: direction (row|col), gap, alignMain, alignCross, flex
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
