const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:3});
  const root=path.resolve(__dirname,'..');
  await p.goto('file:///'+path.join(root,'filter.html').split(path.sep).join('/'));
  await p.waitForTimeout(300);
  await p.click('#yearrow'); await p.waitForTimeout(500);
  await p.screenshot({path:path.join(root,'shots','filter_sheet.png')});
  await b.close();
})();
