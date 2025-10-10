import React from 'react';
import { WidgetShell } from '@widget-factory/primitives';
import { Text } from '@widget-factory/primitives';
import { Sparkline } from '@widget-factory/primitives';

export default function Widget() {
  return (
    <WidgetShell backgroundColor="#121212" borderRadius={16} padding={16} width={426} height={201}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flex: 1, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <Text fontSize={16} color="#FFFFFF" fontWeight={600} flex={0}>Dow Jones</Text>
          <Text fontSize={14} color="#888888" flex={0}>Dow Jones</Text>
        </div>
        <Sparkline width={80} height={32} color="#00FF00" data={[0,15,10,25,20,35,30,45,40,55,50,65,60,75,70]} flex={1} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 0, justifyContent: 'flex-end' }}>
          <Text fontSize={18} color="#FFFFFF" fontWeight={600} flex={0}>34,575.31</Text>
          <Text fontSize={14} color="#00FF00" flex={0}>+151.27</Text>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flex: 1, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <Text fontSize={16} color="#FFFFFF" fontWeight={600} flex={0}>S&P 500</Text>
          <Text fontSize={14} color="#888888" flex={0}>S&P 500</Text>
        </div>
        <Sparkline width={80} height={32} color="#00FF00" data={[0,10,5,20,15,30,25,40,35,50,45,60,55,70,65]} flex={1} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 0, justifyContent: 'flex-end' }}>
          <Text fontSize={18} color="#FFFFFF" fontWeight={600} flex={0}>4,202.08</Text>
          <Text fontSize={14} color="#00FF00" flex={0}>+9.66</Text>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flex: 1, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <Text fontSize={16} color="#FFFFFF" fontWeight={600} flex={0}>AAPL</Text>
          <Text fontSize={14} color="#888888" flex={0}>Apple Inc.</Text>
        </div>
        <Sparkline width={80} height={32} color="#00FF00" data={[0,20,15,30,25,40,35,50,45,60,55,70,65,80,75]} flex={1} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 0, justifyContent: 'flex-end' }}>
          <Text fontSize={18} color="#FFFFFF" fontWeight={600} flex={0}>132.94</Text>
          <Text fontSize={14} color="#00FF00" flex={0}>+5.50</Text>
        </div>
      </div>
    </div>
    </WidgetShell>
  );
}
