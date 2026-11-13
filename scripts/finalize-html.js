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
const cleanHtml = html.replace(/\s*<style id="resume-styles">[\s\S]*?<\/style>/g, '');
fs.writeFileSync(
  outputPath,
  cleanHtml.replace('</head>', `<style id="resume-styles">\n${resumeCss}\n</style>\n</head>`),
);
console.log('Verified populated HTML and added resume styles.');
