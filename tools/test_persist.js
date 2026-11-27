// 验证：改数 → 刷新 → 改动仍在；换年份互不污染
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3});
  const p=await ctx.newPage();
  const root=path.resolve(__dirname,'..');
  const url=y=>'file:///'+path.join(root,'income.html').split(path.sep).join('/')+`?year=${y}&types=salary,labor,draft,royalty`;
  const o={};

  await p.goto(url(2026)); await p.waitForTimeout(300);
  o['2026改前'] = await p.textContent('#sumIncome');
  const cell=p.locator('.item .num[data-f="income"]').first();
  await cell.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('7000');
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  o['2026改后'] = await p.textContent('#sumIncome');

  await p.reload(); await p.waitForTimeout(400);
  o['2026刷新后'] = await p.textContent('#sumIncome');
  o['2026首格'] = await p.locator('.item .num[data-f="income"]').first().textContent();

  await p.goto(url(2025)); await p.waitForTimeout(300);
  o['2025合计(不应受影响)'] = await p.textContent('#sumIncome');
  await p.goto(url(2026)); await p.waitForTimeout(300);
  o['切回2026'] = await p.textContent('#sumIncome');

  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
