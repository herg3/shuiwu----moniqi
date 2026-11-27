const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  // 模拟手机环境（touch + isMobile），和 App 内 WebView 更接近
  const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:3});
  const p=await ctx.newPage();
  await p.goto('file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/income.html?year=2026&types=salary,labor');
  await p.evaluate(()=>localStorage.clear());
  await p.reload(); await p.waitForTimeout(400);
  const o={};
  o['默认 contenteditable'] = await p.$eval('.num', e=>e.getAttribute('contenteditable'));

  // 用 touch 长按（手机上是 touch 事件，不是 mouse）
  const box=await p.$eval('#hot', e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.touchscreen.tap(box.x, box.y).catch(()=>{});
  await p.evaluate(()=>{ // 直接派发 touchstart 并等 1.7s
    const hot=document.querySelector('#hot');
    hot.dispatchEvent(new TouchEvent('touchstart',{bubbles:true}));
  });
  await p.waitForTimeout(1700);
  o['touch长按后 editing'] = await p.$eval('body', e=>e.classList.contains('editing'));
  o['touch长按后 contenteditable'] = await p.$eval('.num', e=>e.getAttribute('contenteditable'));

  // 点击数字能否进入编辑
  const before = await p.textContent('#sumIncome');
  const cell=p.locator('.item .num[data-f="income"]').first();
  await cell.click(); await p.waitForTimeout(150);
  o['点击后是否聚焦'] = await p.evaluate(()=>document.activeElement && document.activeElement.className);
  await p.keyboard.press('Control+A'); await p.keyboard.type('7777');
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  o['改前合计']=before; o['改后合计']=await p.textContent('#sumIncome');
  o['单元格值']=await cell.textContent();
  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
