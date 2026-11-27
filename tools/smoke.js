const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3});
  for(const f of ['index.html','income.html']){
    const p=await ctx.newPage(); const errs=[];
    p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    p.on('pageerror',e=>errs.push('pageerror: '+e.message));
    await p.goto('file:///'+path.resolve(__dirname,'..',f).split(path.sep).join('/'));
    await p.waitForTimeout(500);
    const info=await p.evaluate(()=>({
      imgs:[...document.images].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})),
      sum:document.getElementById('sumIncome')?.textContent||null,
    }));
    console.log(f, JSON.stringify({jsErrors:errs, brokenImgs:info.imgs.filter(i=>!i.ok).map(i=>i.src), 合计:info.sum}));
    await p.close();
  }
  await b.close();
})();
