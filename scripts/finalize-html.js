const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'public/index.html');
const html = fs.readFileSync(outputPath, 'utf8');
const title = html.match(/<title>([\s\S]*?)<\/title>/);

if (!title || !title[1].trim()) {
  throw new Error('Resume export is empty. Check the resume-cli errors above.');
}

const resumeCss = fs.readFileSync(path.join(root, 'styles/resume.css'), 'utf8');
const cleanHtml = html
  .replace(/\s*<style id="resume-styles">[\s\S]*?<\/style>/g, '')
  .replace(/\s*<p id="application-download"[^>]*>[\s\S]*?<\/p>/g, '');
const downloadLink = '<p id="application-download" class="hidden-print"><a href="https://github.com/strazto/resume/releases/download/daily/resume.pdf">Download resume (PDF)</a> | <a href="application.html">Print-friendly version</a></p>';
fs.writeFileSync(
  outputPath,
  cleanHtml
    .replace('</head>', `<style id="resume-styles">\n${resumeCss}\n</style>\n</head>`)
    .replace('<div class="card">', `<div class="card">${downloadLink}`)
    .replace('Download this resume', 'Save portfolio (HTML)'),
);
console.log('Verified populated HTML and added resume styles.');
