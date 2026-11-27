// 验证首页↔明细页跳转（答复前文声称可用，此前未实测）
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:3});
  const p=await ctx.newPage();
  const base='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/')+'/';
  await p.goto(base+'index.html'); await p.waitForTimeout(250);
  // 点「收入纳税明细」卡片（left125.7 / top147.67 / 106x116 中心）
  await p.mouse.click(125.7+53, 147.67+58);
  await p.waitForTimeout(400);
  const afterClick=p.url();
  const title=await p.title();
  // 再点返回
  await p.click('.navbar .back');
  await p.waitForTimeout(400);
  const afterBack=p.url();
  console.log(JSON.stringify({点击卡片后:afterClick.split('/').pop(), 页面标题:title, 点返回后:afterBack.split('/').pop()},null,1));
  await b.close();
})();
