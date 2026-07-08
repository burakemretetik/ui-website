const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function exportCharts() {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport large enough so all charts render properly
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 }); // 2x scale for higher quality PNGs

  console.log('Navigating to http://localhost:3000/export...');
  try {
    await page.goto('http://localhost:3000/export', { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (err) {
    console.error('Failed to load page. Make sure the dev server (npm run dev) is running on port 3000.');
    throw err;
  }

  console.log('Waiting for charts to render...');
  await page.waitForSelector('.recharts-wrapper', { timeout: 10000 });
  
  // Wait an extra 2 seconds for Recharts entrance animations to finish completely
  await new Promise(resolve => setTimeout(resolve, 2000));

  const exportDir = path.join(__dirname, 'exported_charts');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const figures = await page.$$('div[id^="fig-"]');
  console.log(`Found ${figures.length} figures.`);

  for (let i = 0; i < figures.length; i++) {
    const fig = figures[i];
    
    const id = await fig.evaluate(el => el.id);
    const screenshotPath = path.join(exportDir, `${id}.png`);
    
    await fig.screenshot({ path: screenshotPath });
    console.log(`Saved: ${id}.png`);
  }

  await browser.close();
  console.log(`\nExport complete! ${figures.length} PNGs saved to ./exported_charts/ directory.`);
}

exportCharts().catch(console.error);
