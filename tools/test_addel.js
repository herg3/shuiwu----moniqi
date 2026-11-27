// 验证：编辑模式下小类可改、条目可删可增、全部落盘、汇总随动
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/income.html?year=2026&types=salary,labor';
  await p.goto(root); await p.waitForTimeout(300);
  const o={};
  o['默认条目数'] = await p.$$eval('.item', e=>e.length);
  o['默认有删除按钮'] = await p.$$eval('.del', e=>e.length);

  const box = await p.$eval('#hot', el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.move(box.x, box.y); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up();
  o['编辑模式'] = await p.$eval('body', el=>el.classList.contains('editing'));
  o['编辑下有删除按钮'] = await p.$$eval('.del', e=>e.length);
  o['有新增按钮'] = await p.$$eval('#addrow', e=>e.length);

  // 改所得项目小类
  const sub = p.locator('.txt[data-f="sub"]').first();
  await sub.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('劳务报酬所得');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  o['小类改后'] = await sub.textContent();

  // 删第一条
  const before = await p.textContent('#sumIncome');
  await p.click('.del'); await p.waitForTimeout(250);
  o['删除后条目数'] = await p.$$eval('.item', e=>e.length);
  o['删除后合计'] = await p.textContent('#sumIncome');
  o['删除前合计'] = before;

  // 新增一条
  await p.click('#addrow'); await p.waitForTimeout(250);
  o['新增后条目数'] = await p.$$eval('.item', e=>e.length);

  // 刷新持久化
  await p.reload(); await p.waitForTimeout(400);
  o['刷新后条目数'] = await p.$$eval('.item', e=>e.length);
  o['刷新后第一条小类'] = await p.locator('.txt[data-f="sub"]').first().textContent();
  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
