const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/';
  const o={};

  // 1) 闪屏元素实际位置（DOM 测量，不靠颜色检测）
  const p1=await b.newPage({viewport:{width:393,height:852}});
  await p1.goto(root+'index.html'); await p1.waitForTimeout(500);
  o.闪屏 = await p1.evaluate(()=>{
    const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();
      return {top:+b.top.toFixed(1),bottom:+b.bottom.toFixed(1),left:+b.left.toFixed(1),width:+b.width.toFixed(1),height:+b.height.toFixed(1)};};
    return {logo:r('#splash .sp-mid img'), title:r('#splash .sp-title'), sub:r('#splash .sp-sub'), foot:r('#splash .sp-foot')};
  });
  await p1.close();

  // 2) 三个页面 vs 原图
  const shots=[
    ['filter.html','ff928cf2d6c3c53435b973e7a69ad3c2.png','mine_filter.png'],
    ['income.html','16b974aac915cdff3aa297861dc18b25.png','mine_income.png'],
    ['detail.html?year=2026&i=0','36e1fedfa7b7fd3c8fe3cda305414c54.png','mine_detail.png'],
  ];
  for(const [page,ref,out] of shots){
    const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:3});
    await p.goto(root+page); await p.waitForTimeout(300);
    await p.evaluate(()=>localStorage.clear());
    await p.reload(); await p.waitForTimeout(400);
    await p.addStyleTag({content:'body{display:block!important;margin:0!important;padding:0!important;overflow:hidden!important} .phone{position:absolute!important;left:0!important;top:0!important;transform:none!important}'});
    await p.waitForTimeout(200);
    await p.screenshot({path:path.resolve(__dirname,'..','shots',out)});
    await p.close();
  }
  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
