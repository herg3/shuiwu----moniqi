// 空态 + 编辑模式的视觉存证（确认「＋ 新增一条」不与空态插画重叠、可点）
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:2});
  const p=await ctx.newPage();
  const root=path.resolve(__dirname,'..');
  await p.goto('file:///'+path.join(root,'income.html').split(path.sep).join('/')+'?year=2023&types=draft,rent');
  await p.waitForTimeout(350);
  const box=await p.$eval('#hot', el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.move(box.x,box.y); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up();
  await p.waitForTimeout(350);
  const out={};
  out['编辑模式']=await p.$eval('body',el=>el.classList.contains('editing'));
  const btn=await p.$eval('#addrow', el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,h:r.height};}).catch(()=>null);
  const art=await p.$eval('.empty .art', el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}).catch(()=>null);
  const txt=await p.$eval('.empty p', el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}).catch(()=>null);
  out['按钮盒']=btn; out['插画盒']=art; out['文案盒']=txt;
  out['按钮与插画重叠']= btn&&art ? (btn.top < art.bottom) : null;
  out['按钮在文案下']= btn&&txt ? (btn.top >= txt.bottom) : null;
  console.log(JSON.stringify(out,null,1));
  await p.screenshot({path:path.join(root,'shots','empty_edit.png')});
  await b.close();
})();
