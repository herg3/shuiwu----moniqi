const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/';
  const o={};
  // 真实路径：先进列表页（触发初次落盘），再点条目进详情
  await p.goto(root+'income.html?year=2026&types=salary,labor');
  await p.evaluate(()=>localStorage.clear());
  await p.reload(); await p.waitForTimeout(400);
  o['列表已落盘'] = !!(await p.evaluate(()=>localStorage.getItem('taxapp:db:2026')));

  await Promise.all([p.waitForNavigation(), p.click('.item')]);
  await p.waitForTimeout(300);

  // 长按导航栏中部进编辑
  const box=await p.$eval('#hot', e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.move(box.x,box.y); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up();
  o['编辑模式'] = await p.$eval('body', e=>e.classList.contains('editing'));

  const first=p.locator('.v').first();
  await first.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('8888.88');
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  o['改后'] = await first.textContent();

  const taxOffice=p.locator('.v[data-f="taxOffice"]');
  await taxOffice.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('测试税务局');
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  o['税务机关改后'] = await taxOffice.textContent();

  // 刷新详情页
  await p.reload(); await p.waitForTimeout(400);
  o['详情刷新后收入'] = await p.locator('.v').first().textContent();
  o['详情刷新后税务机关'] = await p.locator('.v[data-f="taxOffice"]').textContent();

  // 回列表看是否同步
  await p.goto(root+'income.html?year=2026&types=salary,labor'); await p.waitForTimeout(400);
  o['列表第一条收入'] = await p.locator('.num[data-f="income"]').first().textContent();
  o['列表合计'] = await p.textContent('#sumIncome');
  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
