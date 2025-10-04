import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_SOURCE_DIR = path.resolve(__dirname, '../../../assets/icons/sf-symbols');
const ICONS_OUTPUT_DIR = path.resolve(__dirname, '../src/generated');

const ICONS_TO_GENERATE = [
  'heart.fill',
  'star.fill',
  'circle.fill',
  'checkmark.circle.fill',
  'cloud.sun.fill',
  'flame.fill',
  'bolt.fill',
  'calendar'
];

function toPascalCase(str) {
  return str
    .split(/[.-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function generateIconComponent(iconName, svgContent) {
  const componentName = toPascalCase(iconName);

  let cleanedSvg = svgContent
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<!--[^>]*-->/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .replace(/width="[^"]*"/g, '')
    .replace(/height="[^"]*"/g, '')
    .trim();

  if (!cleanedSvg.startsWith('<svg')) {
    const svgMatch = cleanedSvg.match(/<svg[\s\S]*<\/svg>/);
    if (svgMatch) {
      cleanedSvg = svgMatch[0];
    }
  }

  cleanedSvg = cleanedSvg.replace('<svg', '<svg width="100%" height="100%"');

  return `import React from 'react';

export function ${componentName}() {
  return (
    ${cleanedSvg}
  );
}
`;
}

if (!fs.existsSync(ICONS_OUTPUT_DIR)) {
  fs.mkdirSync(ICONS_OUTPUT_DIR, { recursive: true });
}

const exports = [];

for (const iconName of ICONS_TO_GENERATE) {
  const svgPath = path.join(ICONS_SOURCE_DIR, `${iconName}.svg`);

  if (!fs.existsSync(svgPath)) {
    console.warn(`Warning: ${iconName}.svg not found`);
    continue;
  }

  const svgContent = fs.readFileSync(svgPath, 'utf-8');
  const componentCode = generateIconComponent(iconName, svgContent);
  const componentName = toPascalCase(iconName);
  const outputPath = path.join(ICONS_OUTPUT_DIR, `${componentName}.jsx`);

  fs.writeFileSync(outputPath, componentCode);
  exports.push(`export { ${componentName} } from './generated/${componentName}.jsx';`);

  console.log(`Generated ${componentName}.jsx`);
}

const indexContent = exports.join('\n') + '\n';
fs.writeFileSync(path.join(__dirname, '../src/index.jsx'), indexContent);

console.log(`\nGenerated ${exports.length} icon components`);
