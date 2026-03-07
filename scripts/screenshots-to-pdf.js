/**
 * 6 PNG ekran görüntüsünü tek bir PDF'de birleştirir.
 * Kullanım: node scripts/screenshots-to-pdf.js
 */

const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'app-store-screenshots');
const OUT_PDF = path.join(__dirname, '..', 'docs', 'GGWP-App-Store-Screenshots.pdf');

async function main() {
  const pdfDoc = await PDFDocument.create();

  for (let i = 1; i <= 6; i++) {
    const pngPath = path.join(SCREENSHOTS_DIR, `app-store-${i}.png`);
    if (!fs.existsSync(pngPath)) {
      console.warn('Dosya yok:', pngPath);
      continue;
    }
    const pngBytes = fs.readFileSync(pngPath);
    const image = await pdfDoc.embedPng(pngBytes);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    console.log('PDF sayfa', i, 'eklendi.');
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(OUT_PDF, pdfBytes);
  console.log('PDF kaydedildi:', OUT_PDF);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
