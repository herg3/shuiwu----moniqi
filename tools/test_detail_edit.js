const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  await p.goto('file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/detail.html?year=2026&i=0');
  await p.evaluate(()=>localStorage.clear());
  await p.reload(); await p.waitForTimeout(400);
  const o={};
  o['字段总数'] = await p.$$eval('.v', e=>e.length);
  o['默认可编辑'] = await p.$eval('.v', e=>e.getAttribute('contenteditable'));
  o['申诉元素存在'] = (await p.$$eval('#hot', e=>e.length)) > 0;

  // 长按申诉 1.5s
  const box=await p.$eval('#hot', e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.move(box.x,box.y); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up();
  o['长按后 editing'] = await p.$eval('body', e=>e.classList.contains('editing'));
  o['长按后可编辑'] = await p.$eval('.v', e=>e.getAttribute('contenteditable'));

  // 改第一个字段（收入）
  const first=p.locator('.v').first();
  o['第一个字段原值'] = await first.textContent();
  await first.click(); await p.waitForTimeout(120);
  o['点击后焦点'] = await p.evaluate(()=>document.activeElement?.className);
  await p.keyboard.press('Control+A'); await p.keyboard.type('8888.88');
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  o['改后'] = await first.textContent();
  o['第二个字段(同步收入)'] = await p.locator('.v').nth(0).textContent();

  // 改一个文本字段（主管税务机关）
  const taxOffice = p.locator('.v[data-f="taxOffice"]');
  o['税务机关原值'] = await taxOffice.textContent();
  await taxOffice.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('测试税务局');
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  o['税务机关改后'] = await taxOffice.textContent();

  // 刷新持久化
  await p.reload(); await p.waitForTimeout(400);
  o['刷新后第一字段'] = await p.locator('.v').first().textContent();
  o['刷新后税务机关'] = await p.locator('.v[data-f="taxOffice"]').textContent();
  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
