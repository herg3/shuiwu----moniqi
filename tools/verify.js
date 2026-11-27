// 交付自检：1) 字体是否真的落到 Noto Sans SC  2) 不注入任何覆盖样式时页面是否正常
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3});
  const p=await ctx.newPage();
  await p.goto('file:///'+path.resolve(__dirname,'..','index.html').split(path.sep).join('/'));
  await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{
    const el=document.querySelector('.ntabs .on');
    const probe=document.createElement('span');
    probe.style.cssText='position:absolute;visibility:hidden;font-size:100px;white-space:nowrap';
    probe.textContent='未依法办理个人所得税';
    document.body.appendChild(probe);
    const wOf=(fam)=>{probe.style.fontFamily=fam;return probe.getBoundingClientRect().width;};
    const noto=wOf('"Noto Sans SC"'), yahei=wOf('"Microsoft YaHei"'), sys=getComputedStyle(el).fontFamily;
    probe.remove();
    const ph=document.querySelector('.phone').getBoundingClientRect();
    return {
      sysFamily: sys,
      widthNoto: noto, widthYahei: yahei, notoDiffers: Math.abs(noto-yahei)>1,
      fontsCheck: document.fonts.check('16px "Noto Sans SC"'),
      phone:{x:ph.x,y:ph.y,w:ph.width,h:ph.height},
      scrollH: document.documentElement.scrollHeight, innerH: innerHeight,
    };
  });
  console.log(JSON.stringify(r,null,1));
  // 不注入任何样式的原始截图
  await p.screenshot({path:path.resolve(__dirname,'..','shots','raw_open.png')});
  await b.close();
})();
