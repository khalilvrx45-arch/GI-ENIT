const fs = require('fs');
const src = fs.readFileSync('app/admin/page.tsx', 'utf8');

let depth = 0;
let inSingle = false, inDouble = false, inTemplate = false, inLineComment = false, inBlockComment = false;
let lastOpenLine = 0, lastOpenCol = 0;
let line = 1, col = 0;

for (let i = 0; i < src.length; i++) {
  const ch = src[i];
  const next = src[i + 1];
  col++;
  if (ch === '\n') { line++; col = 0; inLineComment = false; continue; }

  if (inLineComment) continue;
  if (inBlockComment) {
    if (ch === '*' && next === '/') { inBlockComment = false; i++; }
    continue;
  }

  if (!inDouble && !inTemplate && !inSingle && ch === '/' && next === '/') { inLineComment = true; continue; }
  if (!inDouble && !inTemplate && !inSingle && ch === '/' && next === '*') { inBlockComment = true; i++; continue; }

  if (!inDouble && !inTemplate && ch === "'" && src[i - 1] !== '\\') { inSingle = !inSingle; continue; }
  if (!inSingle && !inTemplate && ch === '"' && src[i - 1] !== '\\') { inDouble = !inDouble; continue; }
  if (!inSingle && !inDouble && ch === '`') { inTemplate = !inTemplate; continue; }

  if (inSingle || inDouble || inTemplate) continue;

  if (ch === '(') { depth++; lastOpenLine = line; lastOpenCol = col; }
  else if (ch === ')') { depth--; }
}

if (depth !== 0) {
  console.log('Imbalance: ' + depth + ' unclosed paren(s). Last open at line ' + lastOpenLine + ' col ' + lastOpenCol);
} else {
  console.log('Parentheses balanced!');
}
