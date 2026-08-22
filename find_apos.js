const fs = require('fs');
const lines = fs.readFileSync('app/admin/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  // Match apostrophe that appears between > ... < (i.e. JSX text content)
  if (l.match(/>([^<{]*)'([^<{]*)</) ) {
    console.log('L' + (i + 1) + ': ' + l.trim());
  }
});
console.log('scan done');
