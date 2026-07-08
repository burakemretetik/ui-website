const fs = require('fs');
const path = require('path');
const dir = './sections';

fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const p = path.join(dir, file);
  let c = fs.readFileSync(p, 'utf8');
  
  if (c.includes('<YAxis') && c.includes('type="category"')) {
    // Replace <YAxis type="category" with <YAxis interval={0} type="category"
    // Also handle cases where there are spaces or newlines
    c = c.replace(/<YAxis([\s\S]*?)type="category"/g, (match, group1) => {
      // Avoid adding interval={0} multiple times if it already exists
      if (group1.includes('interval={0}')) return match;
      return `<YAxis interval={0}${group1}type="category"`;
    });
    
    fs.writeFileSync(p, c);
    console.log('Updated ' + file);
  }
});
console.log('Interval fix applied.');
