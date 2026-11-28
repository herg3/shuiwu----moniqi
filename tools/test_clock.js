// 验证：7 个页面状态栏显示的时间必须等于设备当前时间 HH:MM
const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const p=await b.newPage({viewport:{width:393,height:852}});
  const root='file:///'+path.resolve(__dirname,'..').split(path.sep).join('/');
  const pages=['index.html','filter.html','income.html','detail.html','message.html','office.html','todo.html'];
  const pad=n=>n<10?'0'+n:''+n;
  const d=new Date();
  const want=pad(d.getHours())+':'+pad(d.getMinutes());
  const out={系统当前时间:want,页面:{}};
  let fail=0;
  for(const f of pages){
    await p.goto(root+'/'+f); await p.waitForTimeout(250);
    const t=((await p.locator('.st-time').first().textContent().catch(()=>null))||'').trim();
    const ok=t===want;
    if(!ok) fail++;
    out.页面[f]={显示:t||'(无)',符合:ok};
  }
  out.汇总={通过:pages.length-fail,失败:fail};
  console.log(JSON.stringify(out,null,1));
  await b.close();
  process.exit(fail?1:0);
})();
