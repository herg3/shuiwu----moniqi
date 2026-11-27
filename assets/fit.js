/* 真机适配：页面按 393×852 设计，这里等比缩放到任意屏幕，
   避免在手机上出现黑边/裁切。桌面浏览器打开时同样生效（居中显示手机框）。 */
(function () {
  var W = 393, H = 852;
  function fit() {
    var phone = document.querySelector('.phone');
    if (!phone) return;
    var vw = window.innerWidth, vh = window.innerHeight;
    var s = Math.min(vw / W, vh / H);
    document.body.style.padding = '0';
    document.body.style.margin = '0';
    // 用页面自身的主色铺底，缩放过的地方不会露出深灰
    var bg = getComputedStyle(phone).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)') document.body.style.background = bg;
    phone.style.transform = 'scale(' + s + ')';
    phone.style.transformOrigin = 'center center';
    phone.style.margin = '0';
    phone.style.boxShadow = 'none';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit);
  else fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
})();
