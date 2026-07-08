const fs = require('fs');
let c = fs.readFileSync('sections/Export.tsx', 'utf8');
const replacements = [
  { k: 'titleData', w: 130 },
  { k: 'acTopicData', w: 230 },
  { k: 'acRegionData', w: 230 }, // CHANGED from 160 to 230
  { k: 'topCourses', w: 260 },
  { k: 'projTopicData', w: 230 },
  { k: 'projRegionData', w: 230 }, // CHANGED from 160 to 230
  { k: 'top2025', w: 290 }
];

replacements.forEach(r => {
  const reBar = new RegExp('<BarChart data=\\{' + r.k + '\\} layout="vertical" margin=\\{\\{ left: \\d+, right: \\d+ \\}\\}>');
  
  if (c.match(reBar)) {
    let blockStartIndex = c.indexOf('<BarChart data={' + r.k + '}');
    let blockEndIndex = c.indexOf('</BarChart>', blockStartIndex);
    let block = c.substring(blockStartIndex, blockEndIndex);
    
    block = block.replace(reBar, '<BarChart data={' + r.k + '} layout="vertical" margin={{ left: ' + r.w + ', right: 30 }}>');
    
    const reY = /<YAxis type="category" dataKey="([a-zA-Z_]+)".*?width=\{\d+\}.*?\/>/;
    const replacement = '<YAxis \n              interval={0} \n              type="category" \n              dataKey="$1" \n              width={' + r.w + '} \n              tick={(props: any) => (<text x={props.x - 5} y={props.y} dy={3} textAnchor="end" fill="#94A3B8" fontSize={10}>{props.payload.value}</text>)} \n            />';
    
    block = block.replace(reY, replacement);
    c = c.substring(0, blockStartIndex) + block + c.substring(blockEndIndex);
  }
});

fs.writeFileSync('sections/Export.tsx', c);
console.log("Export.tsx fixed perfectly.");
