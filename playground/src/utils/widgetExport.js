/**
 * @file widgetExport.js
 * @description Utilities for widget validation and export.
 * Provides reusable functions for both interactive UI and headless batch rendering.
 * @author Houston Zhang
 * @date 2025-10-17
 */

import html2canvas from 'html2canvas';

export function generateFilename(presetCode, metadata) {
  const { width, height, aspectRatio } = metadata;
  const arFormatted = aspectRatio.toFixed(4).replace('.', '-');
  return `${presetCode}_${width}x${height}_ar${arFormatted}.png`;
}

export async function captureWidgetAsPNG(widgetElement, options = {}) {
  const { scale = 2, backgroundColor = null } = options;

  const canvas = await html2canvas(widgetElement, {
    backgroundColor,
    scale,
    logging: false,
    useCORS: true
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

export async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportWidget(widgetElement, presetCode, metadata, options = {}) {
  const blob = await captureWidgetAsPNG(widgetElement, options);
  const filename = generateFilename(presetCode, metadata);

  if (options.returnBlob) {
    return { blob, filename, metadata };
  }

  await downloadBlob(blob, filename);
  return { filename, metadata };
}
