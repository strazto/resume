#!/usr/bin/env node

const { PDFDocument, PageSizes } = require('pdf-lib');
const fs = require('fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) {
  console.error('Usage: node fix-pdf.js <input.pdf> <output.pdf>');
  process.exit(1);
}

// Doesnt seem to work for me
// https://github.com/puppeteer/puppeteer/issues/2278#issuecomment-1670810686
const getScalingOld = () => {
    const pdfPageWidthInMM = 210;
    const pdfPageHeightInMM = 297;
    

    const pdfPageWidthInPoints = PageSizes.A4[0];
    

    // calculate a number of PDF points in 1 mm (595.28 points = 210 mm)
    // See PDF-LIB documentation: https://pdf-lib.js.org/docs/api/#a4
    const sizeOf1mm = Math.trunc(pdfPageWidthInPoints / pdfPageWidthInMM * 10000) / 10000; 

    const width = pdfPageWidthInMM * sizeOf1mm;
    const height =  pdfPageHeightInMM * sizeOf1mm;

    return { width, height };
}

const getFixedSize = (width, height) => {
    return { width: width * 0.75, height };
}


/**
 * @param {import('pdf-lib').PDFPage} p
 */
const resizePage = (p) => {
    const {width, height} = p.getSize();
    
    const {width: width_out, height: height_out} = getFixedSize(width, height);

    p.setSize(width_out, height_out);
    return p;
}

(async () => {
  const inputPdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(inputPdfBytes);

  const pages = pdfDoc.getPages();
  pages.forEach(resizePage);

  const pdfBytes /* : Unit8Array */ = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
})().catch(err => {
  console.error(err);
  process.exit(1);
});


