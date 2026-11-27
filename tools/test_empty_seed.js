// 验证：内置明细已清空 → 空态可编辑、可新增、可改值、可持久化、可删除；旧键被清理
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/');
  const url=root+'/income.html?year=2026&types=salary,labor,draft,royalty';
  const o={};

  // 0) 预置一条旧版遗留键，模拟老安装升级
  await p.goto(url); await p.waitForTimeout(200);
  await p.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('taxapp:db:2026', JSON.stringify([
      {type:'salary',cat:'工资薪金',month:'2026-05',sub:'正常工资薪金',agent:'文昌市第二建筑安装工...',income:6000,tax:24}
    ]));
  });

  // 1) 全新进入 → 应为空
  await p.goto(url); await p.waitForTimeout(350);
  o['首次进入条目数'] = await p.$$eval('.item', e=>e.length);
  o['空态文案'] = await p.locator('.empty p').textContent().catch(()=>null);
  o['空态合计收入'] = await p.textContent('#sumIncome');
  o['空态合计税额'] = await p.textContent('#sumTax');
  o['旧键已清除'] = await p.evaluate(()=>localStorage.getItem('taxapp:db:2026')===null);
  o['v2键已落盘'] = await p.evaluate(()=>localStorage.getItem('taxapp:db:v2:2026'));

  // 2) 编辑模式（长按标题热区 1.5s）+ 空态新增
  const press=async()=>{
    const box=await p.$eval('#hot', el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
    await p.mouse.move(box.x,box.y); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up();
  };
  await press(); await p.waitForTimeout(150);
  o['编辑模式'] = await p.$eval('body', el=>el.classList.contains('editing'));
  o['空态有新增按钮'] = await p.$$eval('#addrow', e=>e.length);

  await p.click('#addrow'); await p.waitForTimeout(250);
  o['新增后条目数'] = await p.$$eval('.item', e=>e.length);
  o['新增后合计'] = await p.textContent('#sumIncome');

  // 3) 改收入数值 → 汇总随动
  const inc = p.locator('.num[data-f="income"]').first();
  await inc.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('8888');
  await p.keyboard.press('Enter'); await p.waitForTimeout(220);
  o['改后收入'] = await inc.textContent();
  o['改后合计'] = await p.textContent('#sumIncome');

  // 4) 刷新 → 持久化
  await p.reload(); await p.waitForTimeout(400);
  o['刷新后条目数'] = await p.$$eval('.item', e=>e.length);
  o['刷新后首条收入'] = await p.locator('.num[data-f="income"]').first().textContent();
  o['刷新后合计'] = await p.textContent('#sumIncome');

  // 5) 删除 → 回到空态
  await press(); await p.waitForTimeout(150);
  o['重进编辑模式'] = await p.$eval('body', el=>el.classList.contains('editing'));
  await p.click('.del'); await p.waitForTimeout(250);
  o['删除后条目数'] = await p.$$eval('.item', e=>e.length);
  o['删除后合计'] = await p.textContent('#sumIncome');
  o['删除后空态文案'] = await p.locator('.empty p').textContent().catch(()=>null);

  // 6) 刷新 → 空态也应持久
  await p.reload(); await p.waitForTimeout(400);
  o['刷新后仍为空'] = await p.$$eval('.item', e=>e.length);

  // 7) 详情页在无数据时不得回落到假数据
  const p2 = await b.newPage({viewport:{width:393,height:852}});
  await p2.goto(root+'/detail.html?year=2026&i=0'); await p2.waitForTimeout(350);
  const body = await p2.$eval('#body', el=>el.innerText);
  o['详情页收入行'] = (body.match(/收入：\s*([0-9.]+)元/)||[])[1] || null;
  o['详情页含文昌'] = body.includes('文昌');
  o['详情页含识别号'] = body.includes('91469005201449453B');

  console.log(JSON.stringify(o,null,1));
  await b.close();
})();
