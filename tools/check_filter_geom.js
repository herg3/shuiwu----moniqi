const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  await p.goto('file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/filter.html');
  await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const g=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();
      return {top:+b.top.toFixed(1),bottom:+b.bottom.toFixed(1),h:+b.height.toFixed(1)};};
    const typs=[...document.querySelectorAll('.typ')].map(e=>+e.getBoundingClientRect().top.toFixed(1));
    return {sect1:g('.sect'),yearrow:g('#yearrow'),types:g('#types'),toggle:g('#toggle'),query:g('#query'),typTops:typs, typH:+document.querySelector('.typ').getBoundingClientRect().height.toFixed(1)};
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
