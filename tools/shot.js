// headless 截图：viewport 393x852，DPR 3 → 输出 1179x2556，与原图逐像素可比
const path = require('path');
const { chromium } = require('playwright-core');

(async () => {
  const exe = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1161', 'chrome-win', 'chrome.exe');
  const browser = await chromium.launch({ executablePath: exe });
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const pageFile = process.argv[2] || 'index.html';
  const outName = process.argv[3] || 'mine.png';
  const file = path.resolve(__dirname, '..', pageFile).split(path.sep).join('/');
  await page.goto('file:///' + file, { waitUntil: 'load' });
  // 截图专用：强制 .phone 对齐 (0,0)。flex 居中会引入 0.1667px 偏移，
  // 在 @3x 下变成 0.5 物理像素，导致所有边缘整圈变红。
  await page.addStyleTag({ content: 'body{display:block!important;margin:0!important;padding:0!important;overflow:hidden!important;} .phone{position:absolute!important;left:0!important;top:0!important;}' });
  await page.waitForTimeout(400);
  const out = path.resolve(__dirname, '..', 'shots', outName);
  await page.screenshot({ path: out });
  const box = await page.evaluate(() => {
    const el = document.querySelector('.phone');
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, dpr: window.devicePixelRatio, iw: innerWidth, ih: innerHeight };
  });
  console.log(JSON.stringify(box));
  await browser.close();
})();
