const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/';
  await p.goto(root+'filter.html'); await p.waitForTimeout(300);
  const secs=await p.$$eval('.sect', els=>els.map(e=>+e.getBoundingClientRect().top.toFixed(1)));
  const yr=await p.$eval('.yearrow', e=>{const r=e.getBoundingClientRect();return {top:+r.top.toFixed(1),bottom:+(r.top+r.height).toFixed(1)}});
  console.log('标题top:', JSON.stringify(secs), '年度行:', JSON.stringify(yr));
  await p.goto(root+'income.html?year=2026&types=salary'); await p.waitForTimeout(300);
  console.log('txt字段数:', await p.$$eval('.txt', e=>e.length), '默认可编辑:', await p.$eval('.txt', e=>e.getAttribute('contenteditable')));
  await b.close();
})();
