import React from 'react';
import { WidgetShell } from '@widget-factory/core';
import { Title } from '@widget-factory/core';
import { Metric } from '@widget-factory/core';
import { Label } from '@widget-factory/core';
import { Icon } from '@widget-factory/core';
import { CheckmarkCircleFill } from '@widget-factory/icons';
import { FlameFill } from '@widget-factory/icons';

export default function Widget() {
  return (
    <WidgetShell width={338} height={354} backgroundColor="#f2f2f7" borderRadius={20} padding={16}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
          <Title fontSize={20} color="#000000">Revenue Dashboard</Title>
          <Icon size={20} color="#34C759"><CheckmarkCircleFill /></Icon>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            <Icon size={20} color="#FF9500"><FlameFill /></Icon>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <Label fontSize={13} color="#666666">Total Revenue</Label>
              <Metric fontSize={28} color="#000000">$124,580</Metric>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <Metric fontSize={24} color="#34C759">+18.2%</Metric>
              <Label fontSize={12} color="#666666">vs last month</Label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <Metric fontSize={24} color="#007AFF">2,847</Metric>
              <Label fontSize={12} color="#666666">Transactions</Label>
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}
