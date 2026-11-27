const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  // 3 倍图，保证高分屏清晰
  const p=await b.newPage({viewport:{width:240,height:280},deviceScaleFactor:3});
  await p.goto('file:///'+path.resolve(__dirname,'..','build-assets','logo.html').split(path.sep).join('/'));
  await p.waitForTimeout(400);
  await p.screenshot({path:path.resolve(__dirname,'..','assets','splash-logo.png'), omitBackground:true});
  console.log('assets/splash-logo.png 已生成（720x840）');
  await b.close();
})();
