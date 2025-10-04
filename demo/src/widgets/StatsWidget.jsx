import React from 'react';
import { WidgetShell } from '@widget-factory/core';
import { Title } from '@widget-factory/core';
import { Metric } from '@widget-factory/core';
import { Label } from '@widget-factory/core';

export default function Widget() {
  return (
    <WidgetShell width={338} height={158} backgroundColor="#f2f2f7" borderRadius={20} padding={16}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Title fontSize={17} color="#000000">Activity</Title>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 24, justifyContent: 'space-between', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <Metric fontSize={32} color="#FF3B30">8,547</Metric>
            <Label fontSize={13} color="#666666">Steps</Label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <Metric fontSize={32} color="#34C759">247</Metric>
            <Label fontSize={13} color="#666666">Calories</Label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <Metric fontSize={32} color="#007AFF">4.2</Metric>
            <Label fontSize={13} color="#666666">km</Label>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}
