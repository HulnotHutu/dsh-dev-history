/* 阶段：逐月叙事与承重决策——内容来自 content/narrative.md 的「阶段」章节 */
(function () {
  'use strict';
  window.DSH_ARCH.pages.register('phases', {
    render: function (root, api) {
      var bm = api.byMonth();
      var status = {};
      api.data.notes.forEach(function (x) { status[x.n] = x.s; });
      var CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
      var html = '<p class="small muted">每阶段的叙事与承重决策（带一句话注释）。标记含义见' +
        ' <a href="#/overview">总览</a>；每条的标题、摘要与路径见<a href="#/ledger">账簿</a>。</p>';
      api.phasesList.forEach(function (st, idx) {
        var list = bm[st.key] || [];
        var a = list.filter(function (x) { return x.s === 'a'; }).length;
        var i = list.filter(function (x) { return x.s === 'i'; }).length;
        var r = list.filter(function (x) { return x.s === 'r'; }).length;
        var breakdown = '全月 ' + list.length + ' 篇：' + a + ' 已封存 · ' + (i + r) + ' 现行' +
          (r ? '（' + r + ' 篇仅远端）' : '');
        html += '<section class="phase-block"><header>' +
          '<span class="vol">' + CN[idx] + '</span>' +
          '<span class="m">' + api.monthKey(st.key) + ' · ' + st.name + '</span>' +
          '<span class="range">' + st.key.slice(0, 7) + '</span>' +
          '<span class="count">' + breakdown + '</span></header>' +
          '<p>' + st.para.join('') + '</p>' +
          (st.note && st.note.length
            ? '<div class="sweep-callout"><p class="small">' + st.note.join('') + '</p></div>'
            : '') +
          '<ul class="keys">' + st.items.map(function (it) {
            var s = status[it.slug] || 'i';
            return '<li class="' + s + '"><span class="mark" aria-hidden="true">' + api.MARK[s] +
              '</span><code>' + it.slug + '</code><span class="gloss">' + it.gloss + '</span></li>';
          }).join('') + '</ul></section>';
      });
      root.innerHTML = html;
    }
  });
})();
