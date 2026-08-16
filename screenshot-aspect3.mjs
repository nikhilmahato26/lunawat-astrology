import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
await page.evaluate(() => {
  const anyBannerImg = document.querySelector('img[src*="lunawat/banners"], img[src*="picsum.photos/seed/square"]');
  anyBannerImg?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(500);

// click "next" up to 7 times, checking after each click whether the square banner is now visible
let found = false;
for (let i = 0; i < 8; i++) {
  const hasSquare = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const squareImg = imgs.find(im => im.src.includes('picsum.photos/seed/square'));
    if (!squareImg) return false;
    // check if its parent (2 levels up) has opacity-100 class
    const slide = squareImg.closest('div.absolute.inset-0');
    return slide?.className.includes('opacity-100');
  });
  if (hasSquare) { found = true; break; }
  const nextBtn = await page.$('button[aria-label="Next banner"]');
  if (nextBtn) await nextBtn.click();
  await page.waitForTimeout(500);
}
console.log('found square active:', found);
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/banner-square-final.png' });
await browser.close();
