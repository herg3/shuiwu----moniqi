const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:3});
  await p.goto('file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/detail.html?year=2026&i=0');
  await p.waitForTimeout(300);
  const o={};
  for (const w of [400,500,600,700]) {
    await p.evaluate(w=>{document.querySelector('.navbar .title').style.fontWeight=w;}, w);
    await p.waitForTimeout(120);
    const shot = await p.screenshot({clip:{x:100,y:50,width:200,height:30}});
    // 用像素统计墨迹
    const ink = await p.evaluate(()=>0); // 占位
    o[w] = shot.length; // 用 PNG 字节数粗略对比粗细
  }
  console.log('不同字重的 PNG 字节数（越大通常墨迹越多）:', JSON.stringify(o));
  await b.close();
})();
