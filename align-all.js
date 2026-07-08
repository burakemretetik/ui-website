const fs = require('fs');
const path = require('path');
const dir = './sections';

fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const p = path.join(dir, file);
  let c = fs.readFileSync(p, 'utf8');
  let original = c;

  // Replace BarChart margins for vertical layouts
  // Example: <BarChart data={...} layout="vertical" margin={{ left: 130, right: 30 }}>
  c = c.replace(/(<BarChart[^>]*?layout="vertical"[^>]*?margin=\{\{\s*left:\s*)\d+(,\s*right:\s*)\d+(\s*\}\})/g, '$1290$230$3');

  // Replace YAxis width
  // Example: <YAxis interval={0} type="category" dataKey="name" width={130} ...
  // We need to match width={\d+} where it's inside a YAxis tag that has type="category"
  // Since YAxis can span multiple lines, we can just look for YAxis and width
  
  // A safe way is to just do a global replace of width={...} inside any YAxis that has type="category"
  // But wait, what if the XAxis has a width? Usually XAxis doesn't.
  c = c.replace(/(<YAxis[\s\S]*?type="category"[\s\S]*?)width=\{\d+\}/g, '$1width={290}');

  if (c !== original) {
    fs.writeFileSync(p, c);
    console.log('Aligned charts in ' + file);
  }
});
console.log('Global alignment applied.');
