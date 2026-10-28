/* 原型（throwaway）：「近期」页三种形态，#/recent?v=A|B|C 切换。
   数据快照 2026-10-25：仅本地探索用，验收后按 prototype 规则处置（胜者折叠进正式页，其余弃置）。 */
(function () {
  'use strict';
  var R = {"meta":{"last":"2026-10-25","remoteHead":"2026-10-28","total":384,"w14":29,"prev14":21,"seal14":0,"w30":53,"mapped":4,"w14d":"2026-10-12"}, "items": [{"d": "2026-10-25", "n": "cua-bundle-id-consent", "s": "i", "t": "按 Bundle ID 共用 macOS 应用授权", "rg": "", "rc": 3}, {"d": "2026-10-23", "n": "store-scoped-image-reads", "s": "i", "t": "图片读取使用附件存储访问权限", "rg": "", "rc": 5}, {"d": "2026-10-23", "n": "independent-session-forks", "s": "i", "t": "普通 fork 不保留持久创建者关系", "rg": "Session 日志", "rc": 1}, {"d": "2026-10-22", "n": "deepseek-official-model-listing", "s": "i", "t": "DeepSeek 官方路由在目录未自定义时跟随官方模型列表", "rg": "", "rc": 2}, {"d": "2026-10-21", "n": "when-access", "s": "i", "t": "按访问状态注册的 whenAccess", "rg": "", "rc": 1}, {"d": "2026-10-21", "n": "session-history-stream-and-snapshot", "s": "i", "t": "Session 快照、纯订阅与 Web 聚合", "rg": "", "rc": 2}, {"d": "2026-10-21", "n": "replaceable-icon-sprite", "s": "i", "t": "通过 SVG sprite 实现可替换的产品图标", "rg": "", "rc": 1}, {"d": "2026-10-20", "n": "ptc-script-evaluation-and-retention", "s": "i", "t": "PTC Script 求值与状态保留", "rg": "", "rc": 2}, {"d": "2026-10-20", "n": "new-session-blank-reuse-by-preset", "s": "i", "t": "新会话复用空白会话，指定预设时按预设匹配", "rg": "", "rc": 1}, {"d": "2026-10-19", "n": "pi-ai-system-reminder-fallback", "s": "i", "t": "Pi-ai 系统提醒回退", "rg": "", "rc": 1}, {"d": "2026-10-19", "n": "file-drag-plugin-ownership", "s": "i", "t": "应用布局之外的文件拖放归属", "rg": "", "rc": 1}, {"d": "2026-10-19", "n": "cua-profile-consent-storage", "s": "i", "t": "同一 profile 内的持久 Computer Use 授权", "rg": "", "rc": 3}, {"d": "2026-10-19", "n": "client-plugin-package-assets", "s": "i", "t": "Client 插件包资源经 URL 提供", "rg": "", "rc": 2}, {"d": "2026-10-18", "n": "websocket-permessage-deflate", "s": "i", "t": "用 permessage-deflate 压缩 Remote 流 WebSocket", "rg": "", "rc": 2}, {"d": "2026-10-18", "n": "session-list-summary-projections", "s": "i", "t": "Serve Session-list rows from a summary key set", "rg": "", "rc": 1}, {"d": "2026-10-16", "n": "steering-batch-start-in-definition-state", "s": "i", "t": "在 Conversation Node Definition 的 State 中预计算插话批首", "rg": "", "rc": 1}, {"d": "2026-10-16", "n": "separate-instruction-chain-budgets", "s": "i", "t": "用户全局指令链与项目指令链分别使用字节预算", "rg": "", "rc": 1}, {"d": "2026-10-14", "n": "webworker-preview-profile-parity", "s": "i", "t": "Preview Worker 按正式 profile 启动，懒加载 chunk 按需拉取", "rg": "", "rc": 1}, {"d": "2026-10-14", "n": "registry-bundle-updates", "s": "i", "t": "注册表组合包更新", "rg": "", "rc": 1}, {"d": "2026-10-14", "n": "plugin-entry-customization", "s": "i", "t": "插件入口自定义：区域自管的 Pin 与“更多”菜单", "rg": "", "rc": 1}, {"d": "2026-10-13", "n": "team-identity-runtime-context", "s": "i", "t": "必需 runtime context 中的 Team 身份", "rg": "", "rc": 1}, {"d": "2026-10-13", "n": "cua-hover-routes-and-coordinates", "s": "i", "t": "后台悬停与截图坐标", "rg": "", "rc": 3}, {"d": "2026-10-13", "n": "cua-continuous-hover", "s": "i", "t": "CUA 连续悬停不分配跨调用所有权", "rg": "", "rc": 3}, {"d": "2026-10-13", "n": "context-breakdown-system-prompt-state", "s": "i", "t": "上下文构成只保留系统提示词", "rg": "", "rc": 1}, {"d": "2026-10-13", "n": "chat-single-fold-motion", "s": "i", "t": "「下条消息时收起」只用一条折叠动画", "rg": "", "rc": 2}, {"d": "2026-10-12", "n": "session-projection-registration-handles", "s": "i", "t": "异步投影注册与保留读取句柄", "rg": "", "rc": 2}, {"d": "2026-10-12", "n": "peer-principal-and-remote-access", "s": "i", "t": "Peer 身份属性与 Remote 方法级访问控制", "rg": "", "rc": 3}, {"d": "2026-10-12", "n": "headless-environment-auth", "s": "i", "t": "Headless 任务不挂载交互式凭据存储", "rg": "", "rc": 2}, {"d": "2026-10-12", "n": "exclusive-conversation-matches", "s": "i", "t": "Conversation 独占匹配", "rg": "", "rc": 2}, {"d": "2026-10-11", "n": "chat-group-tree-exchanges", "s": "i", "t": "Chat 分组树位置与交互段", "rg": "", "rc": 2}, {"d": "2026-10-10", "n": "user-text-json-nodes", "s": "i", "t": "用户文本候选调度与 Facts 驱动刷新", "rg": "", "rc": 1}, {"d": "2026-10-09", "n": "stored-credential-precedence", "s": "i", "t": "存储的凭据优先于启动环境", "rg": "", "rc": 4}, {"d": "2026-10-09", "n": "reasoning-content-slot-factory", "s": "i", "t": "思考正文的标准 Slot 与可复用 Content Factory", "rg": "", "rc": 3}, {"d": "2026-10-09", "n": "ptc-owned-policy-cleanup", "s": "i", "t": "PTC 自行等待策略变化后的清理", "rg": "", "rc": 2}, {"d": "2026-10-09", "n": "operator-scoped-connect-handshake", "s": "i", "t": "以 Peer 为作用域的建连握手", "rg": "", "rc": 3}, {"d": "2026-10-09", "n": "message-node-factories-and-delegates", "s": "i", "t": "领域图片 Slot 与共享画廊 Factory", "rg": "", "rc": 1}, {"d": "2026-10-09", "n": "cua-shared-native-helper", "s": "i", "t": "Shared native CUA process with Agent-scoped state", "rg": "", "rc": 3}, {"d": "2026-10-09", "n": "composer-command-chip", "s": "i", "t": "已认领命令作为输入框原子 chip", "rg": "", "rc": 1}, {"d": "2026-10-08", "n": "persistent-ptc-sandbox", "s": "i", "t": "保留状态的 PTC 进程遵循文件策略", "rg": "Capability Seam", "rc": 4}, {"d": "2026-10-08", "n": "desktop-shell-configuration", "s": "i", "t": "Desktop 壳层配置独立于 Host", "rg": "", "rc": 1}, {"d": "2026-10-06", "n": "web-desktop-plugin-identity-compatibility", "s": "i", "t": "在实验能力整合中保留 Web 和 Desktop 插件身份", "rg": "", "rc": 2}, {"d": "2026-10-05", "n": "shared-agents-root-instructions", "s": "i", "t": "共享 agents 根目录加入用户全局指令链", "rg": "", "rc": 2}, {"d": "2026-10-05", "n": "persistent-machine-translation", "s": "i", "t": "机器翻译结果使用统一的 Session 记录", "rg": "", "rc": 3}, {"d": "2026-10-05", "n": "paid-native-flash-reasoning-translation", "s": "i", "t": "付费原生 Flash 翻译使用独立查询", "rg": "", "rc": 1}, {"d": "2026-10-05", "n": "official-on-demand-bundles", "s": "i", "t": "发现 Official bundle 而不安装其运行时", "rg": "Profile 与 Bundle", "rc": 3}, {"d": "2026-10-05", "n": "anonymous-reasoning-translation", "s": "i", "t": "免登录翻译独立于模型历史", "rg": "", "rc": 5}, {"d": "2026-10-01", "n": "replace-changed-package-modules-on-recomposition", "s": "i", "t": "profile 重新组合时替换已加载包文件发生变化的插件", "rg": "", "rc": 3}, {"d": "2026-09-30", "n": "structured-draft-initialization", "s": "i", "t": "草稿初始内容与结构化引用恢复", "rg": "", "rc": 1}, {"d": "2026-09-30", "n": "profile-package-refresh-and-manifest-invalidation", "s": "i", "t": "包操作刷新 runtime resolution 与 HMR 包配置失效", "rg": "Profile 与 Bundle", "rc": 3}, {"d": "2026-09-29", "n": "explicit-session-history-preparation", "s": "i", "t": "需要迁移时引导打开会话", "rg": "", "rc": 2}, {"d": "2026-09-27", "n": "web-search-offered-by-provider-readiness", "s": "i", "t": "仅在选中的提供方就绪时提供 web_search 与 web_fetch", "rg": "", "rc": 2}, {"d": "2026-09-27", "n": "progressive-office-skills", "s": "i", "t": "Office 技能渐进加载与普通 shell 执行", "rg": "", "rc": 1}, {"d": "2026-09-26", "n": "cua-application-consent", "s": "i", "t": "原生 Computer Use 的应用授权", "rg": "", "rc": 3}]};
  var MARK = { a: '◦', i: '●', r: '◇' };
  var SNAME = { a: '已封存', i: '现行', r: '仅远端' };
  var THEMES = [
    ['CUA / 计算机操作', /cua|computer-use/i],
    ['PTC / 沙箱', /ptc|sandbox/i],
    ['会话 / 上下文', /session|projection|context/i],
    ['桌面 / 插件生态', /desktop|plugin|sidebar|composer/i],
    ['推理 / 翻译', /reasoning|translation/i],
    ['搜索 / 抓取', /web-search|fetch|crawl/i],
    ['办公 / 技能', /office|skill/i],
    ['凭据 / 认证', /credential|auth|consent|token/i],
    ['收尾 / 清理', /cleanup|deprecat|remove|readiness|prepare/i]
  ];
  function themeOf(slug) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i][1].test(slug)) return THEMES[i][0];
    return '未归类';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function row(it) {
    return '<li class="' + it.s + '"><span class="mark" aria-hidden="true">' + MARK[it.s] + '</span>' +
      '<code class="d">' + it.d.slice(5) + '</code>' +
      '<a href="#/ledger?q=' + encodeURIComponent(it.n) + '"><span class="t">' + esc(it.t) + '</span></a>' +
      '<span class="tag">' + (it.rg || themeOf(it.n)) + '</span></li>';
  }
  var CSS_INJECTED = false;
  function injectCss() {
    if (CSS_INJECTED) return;
    CSS_INJECTED = true;
    var st = document.createElement('style');
    st.textContent = [
      '.proto-ribbon{font-size:12px;color:var(--seal);border:1px dashed var(--seal);border-radius:4px;padding:4px 10px;display:inline-block;margin:0 0 14px}',
      '.pulse-band,.delta-band{display:flex;flex-wrap:wrap;gap:4px 26px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:12px 0;margin:0 0 14px}',
      '.pulse-band b,.delta-band b{font-family:var(--serif);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums;display:block;line-height:1.3}',
      '.pulse-band span,.delta-band span{color:var(--ink-2);font-size:13px}',
      '.day{font-family:var(--serif);font-size:15px;font-weight:600;margin:18px 0 4px}',
      '.day .n{font-family:var(--sans);font-size:12px;font-weight:400;color:var(--ink-2)}',
      '.feed{list-style:none;margin:0;padding:0}',
      '.feed li{display:flex;align-items:baseline;gap:10px;padding:4px 0;border-bottom:1px solid var(--line-soft)}',
      '.feed .mark{flex:none;width:1em;text-align:center}',
      '.feed .d{flex:none;color:var(--ink-2);font-family:var(--mono);font-size:.9em}',
      '.feed .t{color:inherit}',
      '.feed .i .mark{color:var(--seal)}',
      '.feed .a{color:var(--ink-2)}',
      '.feed .r .mark{color:var(--remote)}',
      '.feed .tag{flex:none;margin-left:auto;color:var(--ink-2);font-size:12px;border:1px solid var(--line);border-radius:2px;padding:0 7px}',
      '.digest{border-top:1px solid var(--line);padding:10px 0}',
      '.digest header{display:flex;align-items:baseline;gap:12px}',
      '.digest .dn{font-family:var(--serif);font-size:16px;font-weight:600}',
      '.digest .dc{color:var(--ink-2);font-size:13px;font-variant-numeric:tabular-nums}',
      '.latest3{list-style:none;margin:6px 0 0;padding:0}',
      '.latest3 li{padding:2px 0;font-size:13.5px}',
      '.latest3 a{color:inherit}',
      '.chips .chip{display:inline-block;border:1px solid var(--line);border-radius:14px;padding:2px 12px;margin:0 6px 6px 0;font-size:13px}',
      '.chips .chip b{font-weight:600;color:var(--seal)}',
      '.pulse-band .hero b{font-size:30px;color:var(--seal)}',
      '.pulse-band .hero span{display:block;max-width:22ch}',
      '.pulse-band .hero{position:relative}',
      '.pulse-band .hero b[data-log]{cursor:help}',
      '.pulse-band .hero b::after{content:attr(data-log);position:absolute;left:0;top:calc(100% + 8px);background:var(--ink);color:var(--paper);font-family:var(--sans);font-size:12px;font-weight:400;padding:4px 10px;border-radius:4px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s;z-index:5}',
      '.pulse-band .hero b:hover::after{opacity:1}',
      '#proto-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:99;display:flex;align-items:center;gap:10px;background:var(--ink);color:var(--paper);border-radius:20px;padding:6px 14px;box-shadow:0 2px 10px rgba(0,0,0,.25)}',
      '#proto-bar button{background:none;border:0;color:inherit;font-size:16px;cursor:pointer;padding:0 4px}',
      '#proto-bar .pv{font-size:13px}'
    ].join('\n');
    document.head.appendChild(st);
  }
  function ribbon() {
    return '<p class="proto-ribbon">原型 · 三种形态供比选（底部浮条切换）· 数据快照 ' + R.meta.last + '</p>';
  }
  function bodyA(api) {
    var M = api.data.meta;
    var byDay = {};
    R.items.forEach(function (it) { (byDay[it.d.slice(5)] = byDay[it.d.slice(5)] || []).push(it); });
    var days = Object.keys(byDay).sort().reverse();
    var html = '<h2>上游脉搏</h2>' +
      '<div class="pulse-band">' +
      '<div class="hero"><b data-log="' + esc(M.remoteHeadLog || '（提取数据中暂无提交信息）') + '">' + M.remoteHead + '</b><span>dsh 最新提交</span></div>' +
      '<div><b>' + M.last + '</b><span>最新决策笔记</span></div>' +
      '<div><b>' + R.meta.w14 + ' 篇</b><span>近 14 天（上期 ' + R.meta.prev14 + '）</span></div>' +
      '<div><b>' + R.meta.seal14 + ' 篇</b><span>近 14 天封存</span></div>' +
      '</div>' +
      '<p class="small muted">近 30 天共 ' + R.meta.w30 + ' 篇决策；按天倒序，点击任意条目进入账簿详情。</p>' +
      '<h2>最近决策</h2>';
    days.forEach(function (d) {
      html += '<h3 class="day">' + d + ' <span class="n">' + byDay[d].length + ' 篇</span></h3><ul class="feed">' +
        byDay[d].map(row).join('') + '</ul>';
    });
    return html;
  }
  function bodyB() {
    var buckets = {};
    R.items.forEach(function (it) {
      var k = it.rg || ('新方向 · ' + themeOf(it.n));
      (buckets[k] = buckets[k] || []).push(it);
    });
    var keys = Object.keys(buckets).sort(function (a, b) { return buckets[b].length - buckets[a].length; });
    var html = '<h2>近 30 天动向（按去向聚合）</h2>' +
      '<p class="small muted">' + R.meta.w30 + ' 篇近期决策中，仅 ' + R.meta.mapped + ' 篇落入既有的四个架构区域——' +
      '其余是四区域模型尚未覆盖的新方向。这正是「近期」页要回答的问题。</p>';
    keys.forEach(function (k) {
      var list = buckets[k];
      var recent3 = list.slice(0, 3).map(function (it) {
        return '<li>' + it.d.slice(5) + ' <a href="#/ledger?q=' + encodeURIComponent(it.n) + '">' + esc(it.t) + '</a></li>';
      }).join('');
      html += '<section class="digest"><header><span class="dn">' + k + '</span>' +
        '<span class="dc">' + list.length + ' 篇</span></header>' +
        '<ul class="latest3">' + recent3 + '</ul></section>';
    });
    return html;
  }
  function bodyC() {
    var delta = R.meta.w14 - R.meta.prev14;
    var pct = R.meta.prev14 ? Math.round(delta / R.meta.prev14 * 100) : 0;
    var themes = {};
    R.items.filter(function (it) { return it.d >= (R.meta.w14d || R.meta.last); }).forEach(function (it) {
      var t = it.rg || themeOf(it.n);
      themes[t] = (themes[t] || 0) + 1;
    });
    var chips = Object.keys(themes).sort(function (a, b) { return themes[b] - themes[a]; })
      .map(function (t) { return '<span class="chip">' + t + ' <b>' + themes[t] + '</b></span>'; }).join('');
    var added = R.items.filter(function (it) { return it.d >= (R.meta.w14d || R.meta.last); }).slice(0, 8)
      .map(function (it) { return '<li>' + it.d.slice(5) + ' ' + row(it) + '</li>'; }).join('');
    return '<h2>本期看点（' + R.meta.w14 + ' 之后）</h2>' +
      '<div class="delta-band"><b>' + R.meta.w14 + ' 篇</b><span>本期新增，环比 ' +
      (delta >= 0 ? '+' : '') + delta + '（' + (pct >= 0 ? '+' : '') + pct + '%）</span>' +
      '<b>' + R.meta.seal14 + ' 篇</b><span>本期封存</span></div>' +
      '<h3>主题分布</h3><p class="chips">' + chips + '</p>' +
      '<h3>新增决策（前 8 条）</h3><ul class="feed">' + added + '</ul>' +
      '<p class="small muted">完整清单见<a href="#/ledger">账簿</a>，按日期倒序。</p>';
  }
  var NAMES = { A: '脉搏时间线', B: '区域动向看板', C: '增量日报' };
  window.DSH_ARCH.pages.register('recent', {
    render: function (root, api) {
      var v = api.data.presetVariant || 'A';
      injectCss();
      root.innerHTML = ribbon() + (v === 'B' ? bodyB() : v === 'C' ? bodyC() : bodyA(api));
      var bar = document.getElementById('proto-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'proto-bar';
        document.body.appendChild(bar);
        document.addEventListener('keydown', function (e) {
          if (!/#\/recent/.test(location.hash)) return;
          if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          cycle(e.key === 'ArrowRight' ? 1 : -1);
        });
      }
      function idx() { return Math.max(0, VARIANTS_X.indexOf(curVariant())); }
      function curVariant() { return api.data.presetVariant || 'A'; }
      function cycle(d) {
        var i = idx();
        location.hash = '#/recent?v=' + VARIANTS_X[(i + d + VARIANTS_X.length) % VARIANTS_X.length].k;
      }
      bar.innerHTML = '<button type="button" id="pb-prev" aria-label="上一个形态">←</button>' +
        '<span class="pv">原型 <b>' + v + '</b> · ' + NAMES[v] + '</span>' +
        '<button type="button" id="pb-next" aria-label="下一个形态">→</button>';
      bar.querySelector('#pb-prev').onclick = function () { cycle(-1); };
      bar.querySelector('#pb-next').onclick = function () { cycle(1); };
    }
  });
  var VARIANTS_X = [{ k: 'A', name: '脉搏时间线' }, { k: 'B', name: '区域动向看板' }, { k: 'C', name: '增量日报' }];
})();
