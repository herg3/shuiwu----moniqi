// 验证往返：2025 查询进明细 → 返回 → 筛选页仍是 2025
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/';
  await p.goto(root+'filter.html'); await p.waitForTimeout(300);
  await p.click('#yearrow'); await p.waitForTimeout(400);
  await p.click('.wheel .yr[data-y="2025"]'); await p.waitForTimeout(150);
  await p.click('#ok'); await p.waitForTimeout(200);
  await Promise.all([p.waitForNavigation(), p.click('#query')]);
  await p.waitForTimeout(300);
  const detail=decodeURIComponent(p.url().split('/').pop());
  const backHref=await p.$eval('.navbar .back', el=>el.getAttribute('href'));
  await Promise.all([p.waitForNavigation(), p.click('.navbar .back')]);
  await p.waitForTimeout(300);
  console.log(JSON.stringify({明细URL:detail, 返回链接:backHref, 返回后年份:await p.textContent('#yearVal')},null,1));
  await b.close();
})();
