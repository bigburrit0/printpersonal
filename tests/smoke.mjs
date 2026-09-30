// Prueba de humo: sirve la carpeta, abre la app con el proyecto de ejemplo y
// verifica los números del ajedrez medieval (calculados a mano).
// Uso: npm install && npm test   (necesita Chromium de Playwright)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8' };
const server = createServer(async (req, res) => {
  const path = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  try { res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' }); res.end(await readFile(path)); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

const expect = {
  pCost: '$72,15', pSale: '$150',           // Placa 1: 23:00 jue, 10 h, 103 g, PLA+ US$16
  projTotal: '$149,70', projGrams: '206 g', projSale: '$300',
};
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errors = []; let fail = 0;
for (const vp of [{ width: 1200, height: 900 }, { width: 390, height: 844, isMobile: true, hasTouch: true }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await page.goto(url); await page.waitForTimeout(1500);
  for (const [id, want] of Object.entries(expect)) {
    const got = (await page.textContent('#' + id)).trim();
    if (got !== want) { fail++; console.log(`✗ ${vp.width}px #${id}: ${got} (esperado ${want})`); }
  }
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  if (sw > vp.width) { fail++; console.log(`✗ ${vp.width}px: desplazamiento horizontal (${sw}px)`); }
  await ctx.close();
}
await browser.close(); server.close();
if (errors.length) { fail += errors.length; console.log('✗ errores JS:', errors); }
console.log(fail ? `${fail} fallas` : '✓ todo OK');
process.exit(fail ? 1 : 0);
