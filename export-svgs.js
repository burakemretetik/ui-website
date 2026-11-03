const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function exportChartsSVG() {
  console.log('Starting Puppeteer for SVG export...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000/export...');
  try {
    await page.goto('http://localhost:3000/export', { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (err) {
    console.error('Failed to load page. Make sure the dev server is running on port 3000.');
    throw err;
  }

  console.log('Waiting for charts to render...');
  await page.waitForSelector('.recharts-wrapper svg', { timeout: 10000 });
  
  // Wait for animations to finish
  await new Promise(resolve => setTimeout(resolve, 2000));

  const exportDir = path.join(__dirname, 'exported_svgs');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const figures = await page.$$('div[id^="fig-"]');
  console.log(`Found ${figures.length} figures.`);

  for (let i = 0; i < figures.length; i++) {
    const fig = figures[i];
    
    const id = await fig.evaluate(el => el.id);
    
    // Extract the SVG element's outer HTML
    const svgHtml = await fig.evaluate(el => {
      // En büyük svg'yi al: figürdeki ilk svg bazen 388 baytlık bir lejant ikonu oluyordu.
      const svgs = [...el.querySelectorAll('svg')];
      if (!svgs.length) return null;
      const area = (s) => { const r = s.getBoundingClientRect(); return r.width * r.height; };
      const svgEl = svgs.sort((a, b) => area(b) - area(a))[0];
      
      // Inject font-family inline so it looks correct in SVG viewers
      svgEl.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
      svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      return svgEl.outerHTML;
    });

    if (svgHtml) {
      const svgPath = path.join(exportDir, `${id}.svg`);
      fs.writeFileSync(svgPath, svgHtml, 'utf8');
      console.log(`Saved: ${id}.svg`);
    } else {
      console.log(`No SVG found in: ${id}`);
    }
  }

  await browser.close();
  console.log(`\nExport complete! SVGs saved to ./exported_svgs/ directory.`);
}

exportChartsSVG().catch(console.error);
