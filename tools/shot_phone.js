// 模拟真实手机视口，检查是否有黑边/裁切
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/';
  const cases=[{name:'pixel-412x915',w:412,h:915},{name:'iphone-430x932',w:430,h:932}];
  for (const c of cases){
    const ctx=await b.newContext({viewport:{width:c.w,height:c.h},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const p=await ctx.newPage();
    await p.goto(root+'index.html'); await p.waitForTimeout(400);
    const m=await p.evaluate(()=>{
      const ph=document.querySelector('.phone'); const r=ph.getBoundingClientRect();
      return {scale:getComputedStyle(ph).transform, rect:{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)},
              vw:innerWidth, vh:innerHeight, bodyBg:getComputedStyle(document.body).backgroundColor};
    });
    console.log(c.name, JSON.stringify(m));
    await p.screenshot({path:path.resolve(__dirname,'..','shots','phone_'+c.name+'.png')});
    await ctx.close();
  }
  await b.close();
})();
