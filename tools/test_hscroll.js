// 验证卡片横滑：滑到底后第4张卡片完整可见
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  await p.goto('file:///'+path.resolve(__dirname,'..','index.html').split(path.sep).join('/'));
  await p.waitForTimeout(300);
  const before=await p.evaluate(()=>{const w=document.querySelector('.qwrap');return {scrollW:w.scrollWidth,clientW:w.clientWidth,scrollLeft:w.scrollLeft};});
  await p.evaluate(()=>{document.querySelector('.qwrap').scrollLeft=999;});
  await p.waitForTimeout(150);
  const after=await p.evaluate(()=>{const w=document.querySelector('.qwrap');const c=[...w.querySelectorAll('.qcard')].pop();
    const r=c.getBoundingClientRect();return {scrollLeft:w.scrollLeft, lastCardRight:+r.right.toFixed(1), viewportW:393};});
  console.log(JSON.stringify({before,after},null,1));
  await b.close();
})();
