// Build a mapping from widget node path (e.g., "0.1.2") to text ranges
// in the provided JSON string (lineStart, lineEnd, and char indices).

function isEscaped(text, i) {
  let count = 0;
  i--;
  while (i >= 0 && text[i] === '\\') { count++; i--; }
  return count % 2 === 1;
}

function findMatching(text, startIdx, openChar, closeChar) {
  let i = startIdx;
  let depth = 0;
  let inStr = false;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === '"' && !isEscaped(text, i)) inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === openChar) {
      depth++;
    } else if (ch === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function indexToLineCol(text, index) {
  let line = 1, col = 1;
  for (let i = 0; i < index; i++) {
    if (text[i] === '\n') { line++; col = 1; } else { col++; }
  }
  return { line, col };
}

function lineRange(text, startIdx, endIdx) {
  const s = indexToLineCol(text, startIdx).line;
  const e = indexToLineCol(text, endIdx).line;
  return { lineStart: s, lineEnd: e };
}

function findPropertyValueRangeInObject(text, objStart, objEnd, propName) {
  // objStart at '{', objEnd at '}'
  let inStr = false;
  let i = objStart + 1;
  let depthObj = 0; // nested objects/arrays inside values
  while (i < objEnd) {
    const ch = text[i];
    if (inStr) {
      if (ch === '"' && !isEscaped(text, i)) inStr = false;
      i++;
      continue;
    }
    if (ch === '"') {
      // possible key
      const keyStart = i + 1;
      i = text.indexOf('"', keyStart);
      if (i === -1) break;
      if (!isEscaped(text, i)) {
        const key = text.slice(keyStart, i);
        i++;
        // skip spaces
        while (i < objEnd && /\s/.test(text[i])) i++;
        if (text[i] === ':') {
          i++;
          while (i < objEnd && /\s/.test(text[i])) i++;
          if (key === propName) {
            // value starts at i
            const valStart = i;
            const c = text[i];
            if (c === '{') {
              const valEnd = findMatching(text, i, '{', '}');
              return { start: valStart, end: valEnd, type: 'object' };
            } else if (c === '[') {
              const valEnd = findMatching(text, i, '[', ']');
              return { start: valStart, end: valEnd, type: 'array' };
            } else {
              // primitive value; scan until comma or end of object
              let j = i;
              let inValStr = c === '"';
              if (inValStr) {
                j = text.indexOf('"', i + 1);
                while (j !== -1 && isEscaped(text, j)) j = text.indexOf('"', j + 1);
                if (j === -1) j = objEnd;
              } else {
                while (j < objEnd && text[j] !== ',' && text[j] !== '}') j++;
                j--;
              }
              return { start: valStart, end: j, type: 'primitive' };
            }
          }
        }
      } else {
        // escaped end quote; re-enter string
        inStr = true;
        i++;
      }
      continue;
    }
    if (ch === '{' || ch === '[') {
      // skip nested value to next comma at same object depth
      const close = (ch === '{') ? findMatching(text, i, '{', '}') : findMatching(text, i, '[', ']');
      i = close + 1;
      continue;
    }
    i++;
  }
  return null;
}

function enumerateTopLevelArrayElements(text, arrStart, arrEnd) {
  const ranges = [];
  let i = arrStart + 1; // first after '['
  let inStr = false;
  let depth = 0; // nesting inside elements
  while (i < arrEnd) {
    const ch = text[i];
    if (inStr) {
      if (ch === '"' && !isEscaped(text, i)) inStr = false;
      i++;
      continue;
    }
    if (ch === '"') { inStr = true; i++; continue; }
    if (ch === '{') {
      const start = i;
      const end = findMatching(text, i, '{', '}');
      ranges.push({ start, end });
      i = end + 1;
      continue;
    }
    if (ch === '[') {
      // nested array as element; skip it as we expect objects for widget nodes
      const end = findMatching(text, i, '[', ']');
      i = end + 1;
      continue;
    }
    i++;
  }
  return ranges;
}

export function buildSpecPathLineMap(jsonText) {
  try {
    // Basic top-level object range
    const topStart = jsonText.indexOf('{');
    const topEnd = findMatching(jsonText, topStart, '{', '}');
    if (topStart === -1 || topEnd === -1) return {};

    const widgetRange = findPropertyValueRangeInObject(jsonText, topStart, topEnd, 'widget');
    if (!widgetRange || widgetRange.type !== 'object') return {};
    const rootRange = findPropertyValueRangeInObject(jsonText, widgetRange.start, widgetRange.end, 'root');
    if (!rootRange || rootRange.type !== 'object') return {};

    const map = {};
    const rootLines = lineRange(jsonText, rootRange.start, rootRange.end);
    map['0'] = { ...rootLines, start: rootRange.start, end: rootRange.end };

    function walkChildren(parentRange, parentPath) {
      const childrenRange = findPropertyValueRangeInObject(jsonText, parentRange.start, parentRange.end, 'children');
      if (!childrenRange || childrenRange.type !== 'array') return;
      const elems = enumerateTopLevelArrayElements(jsonText, childrenRange.start, childrenRange.end);
      elems.forEach((rng, idx) => {
        const path = `${parentPath}.${idx}`;
        const lr = lineRange(jsonText, rng.start, rng.end);
        map[path] = { ...lr, start: rng.start, end: rng.end };
        // Recurse into grandchildren
        walkChildren(rng, path);
      });
    }

    walkChildren(rootRange, '0');
    return map;
  } catch {
    return {};
  }
}

export default buildSpecPathLineMap;

