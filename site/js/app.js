/* 路由与共享渲染：hash 导航，按需注入各页面脚本 */
(function () {
  'use strict';
  var D = window.DSH_ARCH;
  var FILES = { overview: 'pages/overview.js', map: 'pages/map.js', ledger: 'pages/ledger.js', phases: 'pages/phases.js', about: 'pages/about.js' };
  var TITLES = { overview: '总览', map: '架构', ledger: '账簿', phases: '阶段', about: '体例' };
  var pages = {};
  var injected = {};
  var current = null;

  var PHASES = {
    '2026-06': ['立骨架', '微内核事件分类、事件溯源会话、能力缝、agent 生命周期当月定型，这套词汇沿用至今。'],
    '2026-07': ['铺开能力缝', '能力缝复制到 LSP、subprocess、jobs；provider 路由的模型适配器，GUI、TUI 与 Web 客户端在这一月成型。'],
    '2026-08': ['产品化', 'profile 与 bundle 组合、单一 dsh 启动器、Electron 桌面与 Python SDK；session 日志引入版本机制。'],
    '2026-09': ['发布冲刺', '桌面加固、插件生态与 v3 规范信封；9-04 与 9-30 两次封存共 158 篇，历史笔记入库冻结。'],
    '2026-10': ['活跃前沿', '骨架稳定，决策转向 CUA、持久 PTC、会话分叉与官方模型目录；全部现行，其中 34 篇尚未同步到本地。']
  };
  var MON = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  var MARK = { a: '◦', i: '●', r: '◇' };
  var CLS = { a: 'a', i: 'i', r: 'r' };
  var STATUS = { a: '已封存', i: '现行', r: '仅远端' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function byMonth() {
    var m = {};
    D.notes.forEach(function (x) {
      var k = x.d.slice(0, 7);
      (m[k] = m[k] || []).push(x);
    });
    return m;
  }
  function monthKey(k) { return MON[Number(k.slice(5, 7)) - 1] + '月'; }
  function legendHtml() {
    return '<p class="legend"><span><i class="i k">●</i> 现行（implemented）</span>' +
      '<span><i class="a k">◦</i> 已封存（archived，永久冻结）</span>' +
      '<span><i class="r k">◇</i> 仅存在于远端</span></p>';
  }

  function refCounts() {
    var c = {};
    D.notes.forEach(function (x) {
      (x.out || []).forEach(function (s) { c[s] = (c[s] || 0) + 1; });
    });
    return c;
  }
  function lang() {
    try { return localStorage.getItem('arch-lang') || 'zh'; } catch (e) { return 'zh'; }
  }
  function setLang(v) {
    try { localStorage.setItem('arch-lang', v); } catch (e) { /* 私有模式下忽略 */ }
  }
  /* 段落数组 -> <p> 串（调用方负责外层包裹） */
  function para(arr) {
    return (arr || []).map(esc).join('</p><p class="pp">');
  }

  var api = {
    data: D,
    zh: window.DSH_ARCH_ZH || {},
    esc: esc,
    para: para,
    byMonth: byMonth,
    monthKey: monthKey,
    legendHtml: legendHtml,
    refCounts: refCounts,
    lang: lang,
    setLang: setLang,
    rerender: function () { if (current && pages[current]) paint(current); },
    PHASES: PHASES,
    MON: MON,
    MARK: MARK,
    CLS: CLS,
    STATUS: STATUS
  };

  function route() {
    var m = location.hash.match(/^#\/([a-z]+)/);
    var name = m && FILES[m[1]] ? m[1] : 'overview';
    var qm = location.hash.match(/\?q=([^&]+)/);
    D.presetQuery = qm ? decodeURIComponent(qm[1]) : '';
    current = name;
    paintNav();
    if (pages[name]) { paint(name); return; }
    if (injected[name]) return;
    injected[name] = true;
    document.getElementById('page').innerHTML = '<p class="loading" role="status">载入中…</p>';
    var s = document.createElement('script');
    s.src = FILES[name];
    s.onload = function () { if (current === name && pages[name]) paint(name); };
    s.onerror = function () {
      if (current === name) document.getElementById('page').innerHTML =
        '<p class="load-error">页面加载失败：' + esc(FILES[name]) + '</p>';
    };
    document.head.appendChild(s);
  }
  function paint(name) {
    var main = document.getElementById('page');
    main.innerHTML = '';
    pages[name].render(main, api);
    document.title = '架构决策编年 · ' + TITLES[name];
    window.scrollTo(0, 0);
  }
  function paintNav() {
    Array.prototype.forEach.call(document.querySelectorAll('#nav a'), function (a) {
      var name = (a.getAttribute('href') || '').replace('#/', '');
      if (name === current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  window.DSH_ARCH.pages = {
    register: function (name, def) {
      pages[name] = def;
      if (current === name) paint(name);
    }
  };
  window.addEventListener('hashchange', route);
  route();
})();
