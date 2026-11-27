// 滚动到指定偏移截图，用于验证可滑动与 #12/#13 内容
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3});
  const p=await ctx.newPage();
  await p.goto('file:///'+path.resolve(__dirname,'..','index.html').split(path.sep).join('/'));
  await p.addStyleTag({content:'body{display:block!important;margin:0!important;padding:0!important;overflow:hidden!important} .phone{position:absolute!important;left:0!important;top:0!important}'});
  await p.waitForTimeout(400);
  const info=await p.evaluate(()=>{const s=document.querySelector('.scroll');return {scrollH:s.scrollHeight, clientH:s.clientHeight};});
  for(const y of [0,516,850]){
    await p.evaluate(v=>document.querySelector('.scroll').scrollTop=v, y);
    await p.waitForTimeout(150);
    await p.screenshot({path:path.resolve(__dirname,'..','shots','scroll_'+y+'.png')});
  }
  console.log(JSON.stringify(info));
  await b.close();
})();
