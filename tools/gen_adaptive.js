const path=require('path');const {chromium}=require('playwright-core');
(async()=>{
  const exe=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1161','chrome-win','chrome.exe');
  const b=await chromium.launch({executablePath:exe});
  const root=path.resolve(__dirname,'..');
  for (const [file,out,omit] of [['fg.html','fg-432.png',true],['bg.html','bg-432.png',false]]) {
    const p=await b.newPage({viewport:{width:432,height:432},deviceScaleFactor:1});
    await p.goto('file:///'+path.join(root,'build-assets',file).split(path.sep).join('/'));
    await p.waitForTimeout(300);
    await p.screenshot({path:path.join(root,'build-assets',out), omitBackground:omit});
    await p.close();
    console.log(out,'ok');
  }
  await b.close();
})();
