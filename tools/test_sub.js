// 单独验证：只改所得项目小类 → 刷新是否保留（不搞增删）
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/income.html?year=2026&types=salary,labor';
  await p.goto(root); await p.waitForTimeout(300);
  await p.evaluate(()=>localStorage.clear());
  await p.reload(); await p.waitForTimeout(300);

  const box = await p.$eval('#hot', el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.move(box.x, box.y); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up();

  const sub = p.locator('.txt[data-f="sub"]').first();
  const orig = await sub.textContent();
  await sub.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('测试小类ABC');
  await p.keyboard.press('Enter'); await p.waitForTimeout(300);

  await p.reload(); await p.waitForTimeout(400);
  const afterReload = await p.locator('.txt[data-f="sub"]').first().textContent();
  const stored = await p.evaluate(()=>JSON.parse(localStorage.getItem('taxapp:db:2026')||'[]')[0]?.sub);
  console.log(JSON.stringify({原值:orig, 改后DOM:'测试小类ABC', 刷新后DOM:afterReload, localStorage首条sub:stored},null,1));
  await b.close();
})();
