const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3});
  const p=await ctx.newPage();
  const root=path.resolve(__dirname,'..');
  await p.goto('file:///'+path.join(root,'income.html').split(path.sep).join('/')+'?year=2023&types=draft,rent');
  await p.waitForTimeout(400);
  const o={
    合计: await p.textContent('#sumIncome'),
    税额: await p.textContent('#sumTax'),
    有空态: await p.$$eval('.empty', e=>e.length),
    文案: await p.$eval('.empty p', e=>e.textContent).catch(()=>null),
    有插画: await p.$$eval('.empty svg', e=>e.length),
  };
  console.log(JSON.stringify(o,null,1));
  await p.screenshot({path:path.join(root,'shots','empty.png')});
  await b.close();
})();
