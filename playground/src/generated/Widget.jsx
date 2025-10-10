import React from 'react';
import { WidgetShell } from '@widget-factory/primitives';
import { Text } from '@widget-factory/primitives';

export default function Widget() {
  return (
    <WidgetShell backgroundColor="#ffffff" borderRadius={20} padding={16} width={186} height={219}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'space-between' }}>
      <Text fontSize={12} color="#FF3B30" fontWeight={700} flex={0}>WEDNESDAY</Text>
      <Text fontSize={72} color="#000000" fontWeight={300} flex={0}>1</Text>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flex: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 0 }}>
          <Text fontSize={4} color="#007AFF" flex={0}>█</Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Text fontSize={14} color="#007AFF" fontWeight={600} flex={0}>Yoga class</Text>
          <Text fontSize={13} color="#007AFF" flex={0}>Golden Gate Park</Text>
          <Text fontSize={13} color="#007AFF" flex={0}>4:00-5:30PM</Text>
        </div>
      </div>
    </div>
    </WidgetShell>
  );
}
