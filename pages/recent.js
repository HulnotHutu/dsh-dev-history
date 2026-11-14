/* 「近期」页：三种视图（脉搏时间线 / 区域动向 / 增量日报），#/recent?v=A|B|C 切换，←/→ 循环。
   文案来自 static.json（chrome）与 narrative.json（编辑句）；数据从 DSH_ARCH 运行时派生，无内嵌快照。 */
(function () {
  'use strict';
  var DAY = 86400000;
  function isoShift(iso, days) {
    return new Date(Date.parse(iso + 'T00:00:00Z') + days * DAY).toISOString().slice(0, 10);
  }
  function themeOf(slug, themes, fallback) {
    for (var i = 0; i < themes.length; i++) {
      if (themes[i].re.test(slug)) return themes[i].name;
    }
    return fallback;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  window.DSH_ARCH.pages.register('recent', {
    render: function (root, api) {
      var S = api.static, C = api.site;
      var M = api.data.meta;
      var fill = function (s) {
        return String(s || '').replace(/\{([\w\u4e00-\u9fff]+)\}/g, function (_, k) {
          return vals[k] !== undefined ? vals[k] : (M[k] !== undefined ? M[k] : '');
        });
      };
      /* 运行时派生：近 30 天窗口与统计 */
      var d30 = isoShift(M.last, -29), d14 = isoShift(M.last, -13), prev0 = isoShift(M.last, -27);
      var regions = {};
      api.regions.forEach(function (r) {
        r.items.forEach(function (i) { regions[i.slug] = r.name; });
      });
      var counts = api.refCounts();
      var themes = (S['近期-主题'] || []).map(function (t) {
        return { name: t.name, re: new RegExp(t.match, 'i') };
      });
      var fallbackTheme = S['近期-未归类'] || '未归类';
      var newPrefix = S['近期-新方向'] || '新方向 · ';
      var items = api.data.notes.filter(function (x) { return x.d >= d30; })
        .map(function (x) {
          var zt = (api.zh[x.n] || {}).t || x.t || x.n;
          return { d: x.d, n: x.n, s: x.s, t: zt, rg: regions[x.n] || '', rc: counts[x.n] || 0 };
        }).sort(function (a, b) { return b.d < a.d ? -1 : b.d > a.d ? 1 : 0; });
      var vals = {
        w30: items.length,
        w30d: d30,
        w14d: d14,
        w14d短: d14.slice(5),
        w14: items.filter(function (x) { return x.d >= d14; }).length,
        prev14: api.data.notes.filter(function (x) { return x.d >= prev0 && x.d < d14; }).length,
        seal14: api.data.notes.filter(function (x) { return x.ar >= d14; }).length,
        mapped: items.filter(function (x) { return x.rg; }).length
      };
      var v = api.data.presetVariant || 'A';
      var views = S['近期视图'] || [];
      var viewName = (views.filter(function (x) { return x.v === v; })[0] || {}).名称 || v;

      function mark(s) { return api.MARK[s]; }
      function row(it) {
        return '<li class="' + it.s + '"><span class="mark" aria-hidden="true">' + mark(it.s) + '</span>' +
          '<code class="d">' + it.d.slice(5) + '</code>' +
          '<a href="#/ledger?q=' + encodeURIComponent(it.n) + '"><span class="t">' + esc(it.t) + '</span></a>' +
          '<span class="tag">' + esc(it.rg || newPrefix + themeOf(it.n, themes, fallbackTheme)) + '</span></li>';
      }
      function bodyA() {
        var byDay = {};
        items.forEach(function (it) { (byDay[it.d.slice(5)] = byDay[it.d.slice(5)] || []).push(it); });
        var html = '<h2>' + esc(S['近期-脉搏']) + '</h2>' +
          '<div class="pulse-band">' +
          '<div class="hero"><b data-log="' + esc(M.remoteHeadLog || S['近期-提交缺省']) + '">' + M.remoteHead + '</b><span>' + esc(S['近期-最新提交']) + '</span></div>' +
          '<div><b>' + M.last + '</b><span>' + esc(S['近期-最新决策']) + '</span></div>' +
          '<div><b>' + vals.w14 + ' 篇</b><span>' + esc(S['近期-近14天']) + '（上期 ' + vals.prev14 + '）</span></div>' +
          '<div><b>' + vals.seal14 + ' 篇</b><span>' + esc(S['近期-封存14']) + '</span></div>' +
          '</div>' +
          '<p class="small muted">' + esc(fill(C['近期-按天说明'])) + '</p>' +
          '<h2>' + esc(S['近期-最近决策']) + '</h2>';
        Object.keys(byDay).sort().reverse().forEach(function (d) {
          html += '<h3 class="day">' + d + ' <span class="n">' + byDay[d].length + ' 篇</span></h3><ul class="feed">' +
            byDay[d].map(row).join('') + '</ul>';
        });
        return html;
      }
      function bodyB() {
        var buckets = {};
        items.forEach(function (it) {
          var k = it.rg || (newPrefix + themeOf(it.n, themes, fallbackTheme));
          (buckets[k] = buckets[k] || []).push(it);
        });
        var html = '<h2>' + esc(S['近期-动向']) + '</h2>' +
          '<p class="small muted">' + esc(fill(C['近期-动向说明'])) + '</p>';
        Object.keys(buckets).sort(function (a, b) { return buckets[b].length - buckets[a].length; }).forEach(function (k) {
          var list = buckets[k];
          var recent3 = list.slice(0, 3).map(function (it) {
            return '<li>' + it.d.slice(5) + ' <a href="#/ledger?q=' + encodeURIComponent(it.n) + '">' + esc(it.t) + '</a></li>';
          }).join('');
          html += '<section class="digest"><header><span class="dn">' + esc(k) + '</span>' +
            '<span class="dc">' + list.length + ' 篇</span></header>' +
            '<ul class="latest3">' + recent3 + '</ul></section>';
        });
        return html;
      }
      function bodyC() {
        var delta = vals.w14 - vals.prev14;
        var pct = vals.prev14 ? Math.round(delta / vals.prev14 * 100) : 0;
        var th = {};
        items.filter(function (it) { return it.d >= d14; }).forEach(function (it) {
          var t = it.rg || (newPrefix + themeOf(it.n, themes, fallbackTheme));
          th[t] = (th[t] || 0) + 1;
        });
        var chips = Object.keys(th).sort(function (a, b) { return th[b] - th[a]; })
          .map(function (t) { return '<span class="chip">' + esc(t) + ' <b>' + th[t] + '</b></span>'; }).join('');
        var added = items.filter(function (it) { return it.d >= d14; }).slice(0, 8)
          .map(function (it) { return '<li>' + it.d.slice(5) + ' ' + row(it) + '</li>'; }).join('');
        return '<h2>' + esc(fill(S['近期-看点'])) + '</h2>' +
          '<div class="delta-band"><b>' + vals.w14 + ' 篇</b><span>本期新增，环比 ' +
          (delta >= 0 ? '+' : '') + delta + '（' + (pct >= 0 ? '+' : '') + pct + '%）</span>' +
          '<b>' + vals.seal14 + ' 篇</b><span>' + esc(S['近期-封存14']) + '</span></div>' +
          '<h3>' + esc(S['近期-主题分布']) + '</h3><p class="chips">' + chips + '</p>' +
          '<h3>' + esc(S['近期-新增决策']) + '</h3><ul class="feed">' + added + '</ul>' +
          '<p class="small muted">' + esc(C['近期-完整清单']) + '</p>';
      }
      var toggle = '<nav class="recent-toggle" aria-label="近期视图">' + views.map(function (x) {
        return '<button type="button" aria-pressed="' + (x.v === v) + '" data-v="' + x.v + '">' + esc(x['名称']) + '</button>';
      }).join('') + '</nav>';
      root.innerHTML = toggle + (v === 'B' ? bodyB() : v === 'C' ? bodyC() : bodyA());
      Array.prototype.forEach.call(root.querySelectorAll('.recent-toggle button'), function (b) {
        b.addEventListener('click', function () {
          location.hash = '#/recent?v=' + b.getAttribute('data-v');
        });
      });
      if (!window.__recentKeys) {
        window.__recentKeys = true;
        document.addEventListener('keydown', function (e) {
          if (!/#\/recent/.test(location.hash)) return;
          if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          var ks = views.map(function (x) { return x.v; });
          var i = ks.indexOf(api.data.presetVariant || 'A');
          i = (i + (e.key === 'ArrowRight' ? 1 : -1) + ks.length) % ks.length;
          location.hash = '#/recent?v=' + ks[i];
        });
      }
    }
  });
})();
