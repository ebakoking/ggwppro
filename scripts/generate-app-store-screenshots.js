/**
 * GGWP App Store ekran görüntülerini oluşturur.
 * Kullanım: node scripts/generate-app-store-screenshots.js
 * Gereksinim: npm install puppeteer (proje kökünde veya scripts ile)
 */

const path = require('path');
const fs = require('fs');

const HTML_PATH = path.join(__dirname, '..', 'docs', 'app-store-screenshots.html');
const OUT_DIR = path.join(__dirname, '..', 'docs', 'app-store-screenshots');

async function main() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('Puppeteer yüklü değil. Önce çalıştır: npm install puppeteer');
    process.exit(1);
  }

  if (!fs.existsSync(HTML_PATH)) {
    console.error('HTML bulunamadı:', HTML_PATH);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const fileUrl = 'file://' + HTML_PATH.replace(/\\/g, '/');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({ width: 1290, height: 2796, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  for (let i = 1; i <= 6; i++) {
    const el = await page.$(`#screen${i}`);
    if (!el) {
      console.warn('Ekran bulunamadı: #screen' + i);
      continue;
    }
    const outPath = path.join(OUT_DIR, `app-store-${i}.png`);
    await el.screenshot({ path: outPath, type: 'png' });
    console.log('Yazıldı:', outPath);
  }

  await browser.close();
  console.log('Bitti. Görseller:', OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
