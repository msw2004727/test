/* ===== 最小可操作 JS（外觀預覽用） ===== */
document.addEventListener('DOMContentLoaded', function() {

  /* --- 漢堡選單（手機版全屏卡片側邊欄） --- */
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.querySelector('.nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', function() {
      navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navList.classList.contains('open'));
    });
    // 點擊「✕ 關閉選單」偽元素區域（nav-list::before）
    navList.addEventListener('click', function(e) {
      if (e.target === navList) {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // 手機版子選單展開/收合
    navList.querySelectorAll(':scope > li').forEach(function(li) {
      var link = li.querySelector(':scope > a');
      var dropdown = li.querySelector('.dropdown');
      if (dropdown && link) {
        link.addEventListener('click', function(e) {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('open');
          }
        });
      }
    });
  }

  /* --- Banner 輪播 --- */
  var slides = document.querySelector('.banner-slides');
  var dots = document.querySelectorAll('.banner-dot');
  if (slides && dots.length) {
    var current = 0;
    var total = dots.length;
    var autoTimer;

    function goTo(i) {
      current = ((i % total) + total) % total;
      slides.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function(d, idx) { d.classList.toggle('active', idx === current); });
    }
    function start() { autoTimer = setInterval(function() { goTo(current + 1); }, 5000); }
    function stop() { clearInterval(autoTimer); }

    document.querySelector('.banner-arrow.next').addEventListener('click', function() { stop(); goTo(current + 1); start(); });
    document.querySelector('.banner-arrow.prev').addEventListener('click', function() { stop(); goTo(current - 1); start(); });
    dots.forEach(function(d, i) { d.addEventListener('click', function() { stop(); goTo(i); start(); }); });

    // visibilitychange 暫停
    document.addEventListener('visibilitychange', function() { document.hidden ? stop() : start(); });

    // prefers-reduced-motion
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { start(); }
  }

  /* --- Tab 切換 --- */
  document.querySelectorAll('.tab-nav a').forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      var target = this.getAttribute('data-tab');
      // 切換 tab 狀態
      this.closest('.tab-nav').querySelectorAll('a').forEach(function(t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      // 切換 panel
      this.closest('.section, .announce-section').querySelectorAll('.tab-panel').forEach(function(p) {
        p.classList.remove('active');
        p.hidden = true;
      });
      var panel = document.getElementById(target);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
    });
  });

  /* --- Back to Top --- */
  var btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', function() {
      btt.hidden = window.scrollY < 400;
    }, { passive: true });
    btt.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- 主題切換（暫用按鈕或快捷鍵 T） --- */
  document.addEventListener('keydown', function(e) {
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      var html = document.documentElement;
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch(err) {}
    }
  });

  /* --- Console 版本 --- */
  if (window.__APP_VERSION__) {
    console.log('%c CYUT Leisure v' + window.__APP_VERSION__ + ' ', 'background:#1b4f72;color:#fff;padding:4px 8px;border-radius:4px;');
  }
});
