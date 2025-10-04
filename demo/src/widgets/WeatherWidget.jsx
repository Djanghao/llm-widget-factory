import React from 'react';
import { WidgetShell } from '@widget-factory/core';
import { Metric } from '@widget-factory/core';
import { Label } from '@widget-factory/core';
import { Icon } from '@widget-factory/core';
import { CloudSunFill } from '@widget-factory/icons';

export default function Widget() {
  return (
    <WidgetShell width={158} height={158} backgroundColor="#f2f2f7" borderRadius={20} padding={16}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Icon size={24} color="#FF9500"><CloudSunFill /></Icon>
          <Label fontSize={13} color="#666666">San Francisco</Label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Metric fontSize={48} color="#000000" align="left">72°</Metric>
          <Label fontSize={15} color="#666666">Partly Cloudy</Label>
        </div>
      </div>
    </WidgetShell>
  );
}
