const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:512,height:512},deviceScaleFactor:1});
  await p.goto('file:///'+path.resolve(__dirname,'..','build-assets','icon.html').split(path.sep).join('/'));
  await p.waitForTimeout(400);
  const out=path.resolve(__dirname,'..','build-assets','icon-512.png');
  await p.screenshot({path:out});
  console.log('icon-512.png 已生成');
  await b.close();
})();
