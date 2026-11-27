// 端到端：筛选页 → 选年份 → 展开其他类型 → 查询 → 明细页按年份出数据 → 改数
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3});
  const p=await ctx.newPage();
  const base='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/';
  const out={};

  await p.goto(base+'filter.html'); await p.waitForTimeout(300);
  out.初始年份 = await p.textContent('#yearVal');
  out.初始类型数 = await p.$$eval('.typ', els=>els.length);
  await p.screenshot({path:path.resolve(__dirname,'..','shots','filter.png')});

  // 打开年份滚轮
  await p.click('#yearrow'); await p.waitForTimeout(400);
  out.弹层可见 = await p.$eval('#sheet', el=>el.classList.contains('on'));
  await p.screenshot({path:path.resolve(__dirname,'..','shots','filter_sheet.png')});
  // 点 2025
  await p.click('.wheel .yr[data-y="2025"]'); await p.waitForTimeout(200);
  await p.click('#ok'); await p.waitForTimeout(300);
  out.选中年份 = await p.textContent('#yearVal');

  // 展开其他类型
  await p.click('#toggle'); await p.waitForTimeout(300);
  out.展开后类型数 = await p.$$eval('.typ', els=>els.length);
  out.展开文案 = await p.textContent('#toggleText');
  await p.screenshot({path:path.resolve(__dirname,'..','shots','filter_expanded.png')});

  // 再勾一个「经营所得」
  await p.click('.typ[data-k="business"]'); await p.waitForTimeout(200);
  out.勾选后on数 = await p.$$eval('.typ.on', els=>els.length);

  // 查询
  await Promise.all([p.waitForNavigation(), p.click('#query')]);
  await p.waitForTimeout(400);
  out.跳转URL = decodeURIComponent(p.url().split('/').pop());
  out.明细合计 = await p.textContent('#sumIncome');
  out.明细条数 = await p.$$eval('.item', els=>els.length);
  await p.screenshot({path:path.resolve(__dirname,'..','shots','income2025.png')});

  // 直接开 2026 对比
  await p.goto(base+'income.html?year=2026&types=salary,labor,draft,royalty'); await p.waitForTimeout(300);
  out['2026合计'] = await p.textContent('#sumIncome');
  out['2026条数'] = await p.$$eval('.item', els=>els.length);

  // 编辑
  const cell=p.locator('.item .num[data-f="income"]').first();
  await cell.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('8888');
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  out.改后合计 = await p.textContent('#sumIncome');
  out.改后期望 = (21450-6000+8888).toFixed(2);

  // 返回按钮指向
  out.返回链接 = await p.$eval('.navbar .back', el=>el.getAttribute('href'));

  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
