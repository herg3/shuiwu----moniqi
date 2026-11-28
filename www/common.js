/* 状态栏时钟：把 .st-time 同步成设备当前时间（HH:MM）
   各页面原本写死的是截图里的时刻，装到手机上不会走，这里统一接管。 */
(function () {
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function nowText() {
    var d = new Date();
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function tick() {
    var s = nowText();
    var els = document.querySelectorAll('.st-time');
    for (var i = 0; i < els.length; i++) {
      if (els[i].textContent !== s) els[i].textContent = s;
    }
  }
  tick();
  // 10 秒一轮：分钟跳变最多延迟 10 秒，又不会每分钟重绘多次
  setInterval(tick, 10000);
  // WebView 切后台会挂起定时器，回到前台立刻校准，避免显示半小时前的时刻
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });
  window.addEventListener('pageshow', tick);
})();
