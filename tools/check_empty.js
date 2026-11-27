const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/income.html';
  const o={};
  for (const [tag,q] of [['有数据','?year=2026&types=salary'],['无数据','?year=2023&types=draft']]) {
    await p.goto(root+q); await p.waitForTimeout(300);
    o[tag] = { empty: await p.$$eval('.empty',e=>e.length), items: await p.$$eval('.item',e=>e.length),
               合计: await p.textContent('#sumIncome'), 税额: await p.textContent('#sumTax') };
  }
  console.log(JSON.stringify(o,null,1)); await b.close();
})();
