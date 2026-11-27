// 验证：编辑模式下日期、扣缴义务人也能改，并落盘
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/income.html?year=2026&types=salary,labor';
  await p.goto(root); await p.waitForTimeout(300);
  const o={};

  const box = await p.$eval('#hot', el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await p.mouse.move(box.x, box.y); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up();
  o['编辑模式'] = await p.$eval('body', el=>el.classList.contains('editing'));

  const month = p.locator('.txt[data-f="month"]').first();
  await month.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('2026-09');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  o['日期改后'] = await month.textContent();

  const agent = p.locator('.txt[data-f="agent"]').first();
  await agent.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('测试公司');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  o['扣缴义务人改后'] = await agent.textContent();

  await p.reload(); await p.waitForTimeout(400);
  o['刷新后日期'] = await p.locator('.txt[data-f="month"]').first().textContent();
  o['刷新后扣缴'] = await p.locator('.txt[data-f="agent"]').first().textContent();
  o['刷新后合计(未受影响)'] = await p.textContent('#sumIncome');

  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
