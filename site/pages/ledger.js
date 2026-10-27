/* 账簿：全部 379 条决策，可搜索；行展开后以 Markdown 渲染完整章节；中英切换 */
(function () {
  'use strict';
  window.DSH_ARCH.pages.register('ledger', {
    render: function (root, api) {
      var bm = api.byMonth();
      var M = api.data.meta;
      var lang = api.lang();
      var counts = api.refCounts();
      root.innerHTML =
        '<section class="ledger-tools">' +
        '<input id="ledger-q" type="search" placeholder="搜索标题、文件名或正文（中英文均可）…"' +
        ' aria-label="按标题、文件名或正文搜索决策">' +
        '<span id="ledger-count" class="small muted" aria-live="polite"></span>' +
        '<button id="lang-toggle" type="button" aria-pressed="' + (lang === 'zh') + '">' +
        (lang === 'zh' ? '切换到 English 原文' : '切换到中文') + '</button>' +
        '</section>' +
        '<p class="small muted">共 ' + M.total + ' 条，按提出时间排序。点击行展开完整章节（原始 Markdown 渲染）：动机、决策、备选与落选原因、代价与收益、承接的基础。' +
        '中文取自仓库内每篇笔记的 .zh.md 维护副本（' + Object.keys(api.zh).length + '/' + M.total + ' 篇）。</p>' +
        api.legendHtml() +
        '<div class="ledger" id="ledger-list"></div>';
      var list = root.querySelector('#ledger-list');
      var groups = [];
      Object.keys(bm).sort().forEach(function (k, idx) {
        var det = document.createElement('details');
        var ph = api.phaseOf(k) || { name: '', para: [] };
        if (idx === 0) det.open = true;
        det.innerHTML = '<summary><span class="vol">' + api.MON[idx] + '</span>' +
          '<span class="m">' + api.monthKey(k) + '</span>' +
          '<span class="phase">' + ph.name + '</span>' +
          '<span class="count">' + bm[k].length + ' 篇</span></summary>' +
          '<p class="phase-note">' + ph.para.join('') + '</p>';
        var rows = document.createElement('div');
        rows.className = 'rows';
        bm[k].forEach(function (x) { rows.appendChild(rowEl(x, api, counts, lang)); });
        det.appendChild(rows);
        list.appendChild(det);
        groups.push(det);
      });
      updateCount('');
      root.querySelector('#lang-toggle').addEventListener('click', function () {
        api.setLang(api.lang() === 'zh' ? 'en' : 'zh');
        api.rerender();
      });
      root.querySelector('#ledger-q').addEventListener('input', function (e) {
        var q = e.target.value.trim().toLowerCase();
        groups.forEach(function (det, idx) {
          var any = false;
          Array.prototype.forEach.call(det.querySelectorAll('.rowd'), function (row) {
            var hit = !q || row.getAttribute('data-hay').indexOf(q) !== -1;
            row.hidden = !hit;
            if (hit) any = true;
          });
          det.hidden = q && !any;
          det.open = q ? any : idx === 0;
        });
        updateCount(q);
      });
      if (api.data.presetQuery) {
        var q0 = root.querySelector('#ledger-q');
        q0.value = api.data.presetQuery;
        q0.dispatchEvent(new Event('input', { bubbles: true }));
      }

      function updateCount(q) {
        root.querySelector('#ledger-count').textContent = q
          ? Array.prototype.filter.call(list.querySelectorAll('.rowd'), function (r) { return !r.hidden; }).length + ' / ' + M.total + ' 条匹配'
          : '共 ' + M.total + ' 条';
      }
    }
  });

  function rowEl(x, api, counts, lang) {
    var det = document.createElement('details');
    det.className = 'rowd ' + api.CLS[x.s];
    var zh = lang === 'zh' ? (api.zh[x.n] || null) : null;
    var hay = (x.t + ' ' + x.n + ' ' + x.d + ' ' + (x.p || '') + ' ' + (x.dc || '') + ' ' + (x.cs || '')).toLowerCase();
    if (zh) hay += (' ' + (zh.t || '') + ' ' + zh.p + ' ' + zh.dc + ' ' + zh.cs).toLowerCase();
    det.setAttribute('data-hay', hay.replace(/\s+/g, ' '));
    det.innerHTML =
      '<summary><span class="mark" aria-hidden="true">' + api.MARK[x.s] + '</span>' +
      '<code class="d">' + x.d.slice(5) + '</code>' +
      '<span class="tt">' + api.esc((zh && zh.t) || x.t || x.n) + '</span></summary>' +
      '<div class="detail"></div>';
    det.addEventListener('toggle', function () {
      if (det.open && !det.dataset.loaded) {
        det.dataset.loaded = '1';
        var body = det.querySelector('.detail');
        body.innerHTML = detailHtml(x, api, counts, lang);
        rewriteLinks(body, api);
      }
    });
    return det;
  }

  function detailHtml(x, api, counts, lang) {
    var zh = lang === 'zh' ? (api.zh[x.n] || null) : null;
    function sec(label, enMd, zhMd) {
      var md = (zh && zhMd) ? zhMd : enMd;
      var body = md ? '<div class="md">' + api.md(md) + '</div>'
                    : '<p class="muted">（本篇没有该章节）</p>';
      return '<div class="sec"><span class="lbl">' + label + '</span>' + body + '</div>';
    }
    var refs = (x.out && x.out.length)
      ? x.out.map(function (s) {
          return '<a href="#/ledger?q=' + encodeURIComponent(s) + '"><code>' + s + '</code></a>';
        }).join(' ')
      : '<span class="muted">（无指向本类其他决策的引用）</span>';
    return sec('动机', x.p, zh && zh.p) +
      sec('决策', x.dc, zh && zh.dc) +
      sec('备选与落选原因', x.alt, zh && zh.alt) +
      sec('代价与收益', x.cs, zh && zh.cs) +
      '<p class="sec"><span class="lbl">承接的基础</span>' + refs + '</p>' +
      '<p class="meta small muted">' + api.STATUS[x.s] + ' · 提出 ' + x.d +
      (x.ar ? ' · 封存 ' + x.ar : '') +
      (counts[x.n] ? ' · 被 ' + counts[x.n] + ' 篇后续决策引用' : '') +
      ' · 全文见 <code>' + x.path + '</code></p>';
  }

  /* 笔记内部链接 -> 账簿深链接；站外链接新窗口；本站无法解析的仓库文件链接降级为代码文本 */
  function rewriteLinks(container, api) {
    Array.prototype.forEach.call(container.querySelectorAll('a'), function (a) {
      var href = a.getAttribute('href') || '';
      if (/^https?:/i.test(href)) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
        return;
      }
      var base;
      try { base = decodeURIComponent(href.split('/').pop() || ''); } catch (e) { base = href; }
      base = base.replace(/\.zh\.md$/, '').replace(/\.md$/, '');
      var m = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
      if (m && api.slugSet[m[1]]) {
        a.setAttribute('href', '#/ledger?q=' + encodeURIComponent(m[1]));
      } else {
        var code = document.createElement('code');
        code.className = 'md-ref';
        code.textContent = a.textContent || base;
        a.replaceWith(code);
      }
    });
  }
})();
