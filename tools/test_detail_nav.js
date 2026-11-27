// 验证：非编辑模式点条目 → 详情页；编辑模式下点击不跳转
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/';
  const o={};

  await p.goto(root+'income.html?year=2026&types=salary,labor'); await p.waitForTimeout(300);
  await p.evaluate(()=>localStorage.clear());
  await p.reload(); await p.waitForTimeout(300);

  // 1) 非编辑模式点击 → 应跳详情
  await Promise.all([p.waitForNavigation(), p.click('.item')]);
  await p.waitForTimeout(300);
  o['点击后URL'] = decodeURIComponent(p.url().split('/').pop());
  o['详情页标题'] = await p.textContent('.navbar .title');
  o['收入值'] = await p.$$eval('.v', els=>els[0].textContent);
  o['返回链接'] = await p.$eval('#back', e=>e.getAttribute('href'));

  // 2) 回列表，进编辑模式，点条目不应跳转
  await p.goto(root+'income.html?year=2026&types=salary,labor'); await p.waitForTimeout(300);
  const box=await p.$eval('#hot', e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.move(box.x,box.y); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up();
  o['编辑模式'] = await p.$eval('body', e=>e.classList.contains('editing'));
  await p.click('.item .cat'); await p.waitForTimeout(300);
  o['编辑模式下点击后URL'] = decodeURIComponent(p.url().split('/').pop());
  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
