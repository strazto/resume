const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

async function exportPdf() {
  const root = path.resolve(__dirname, '..');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.join(root, 'public/application.html')).href, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    await page.pdf({
      path: path.join(root, 'resume.pdf'),
      format: 'A4',
      scale: 1,
      displayHeaderFooter: false,
      printBackground: false,
      margin: { top: '12mm', left: '12mm', right: '12mm', bottom: '12mm' },
    });
  } finally {
    await browser.close();
  }
  console.log('Exported resume.pdf from the application layout.');
}

exportPdf().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
