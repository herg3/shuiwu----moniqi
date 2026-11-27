// 验证核心承诺：点数字能改，汇总实时重算
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3});
  const p=await ctx.newPage();
  await p.goto('file:///'+path.resolve(__dirname,'..','income.html').split(path.sep).join('/'));
  await p.waitForTimeout(300);
  const before=await p.textContent('#sumIncome');
  const cell=p.locator('.item .num[data-f="income"]').first();
  await cell.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.type('12345.67');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(200);
  const after=await p.textContent('#sumIncome');
  const cellTxt=await cell.textContent();
  const taxAfter=await p.textContent('#sumTax');
  // 非法输入回滚
  await cell.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('abc'); await p.keyboard.press('Enter');
  await p.waitForTimeout(150);
  const afterBad=await cell.textContent();
  const sumBad=await p.textContent('#sumIncome');
  console.log(JSON.stringify({
    初始合计:before, 改后单元格:cellTxt, 改后合计:after,
    期望合计:(21450-6000+12345.67).toFixed(2),
    非法输入后单元格:afterBad, 非法输入后合计:sumBad, 税额合计:taxAfter
  },null,1));
  await b.close();
})();
