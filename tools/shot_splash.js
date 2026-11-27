// 验证：启动时闪屏在，2.5 秒后消失且露出首页
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  await p.goto('file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/index.html');
  await p.waitForTimeout(600);
  const o={};
  o['0.6s 闪屏存在'] = (await p.$$eval('#splash', e=>e.length)) > 0;
  await p.screenshot({path:path.resolve(__dirname,'..','shots','splash.png')});
  await p.waitForTimeout(2300);
  o['2.9s 闪屏已移除'] = (await p.$$eval('#splash', e=>e.length)) === 0;
  o['首页可见'] = (await p.$$eval('.qcard', e=>e.length)) > 0;
  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
