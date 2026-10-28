/* 阶段：逐月叙事与承重决策——内容来自 content/narrative.json 的「阶段」章节 */
(function () {
  'use strict';
  window.DSH_ARCH.pages.register('phases', {
    render: function (root, api) {
      var S = api.static, C = api.site;
      var bm = api.byMonth();
      var status = {};
      api.data.notes.forEach(function (x) { status[x.n] = x.s; });
      var CN = api.static['序数'];
      var html = '<p class="small muted">' + api.esc(C['阶段-说明']) + '</p>';
      api.phasesList.forEach(function (st, idx) {
        var list = bm[st.key] || [];
        var a = list.filter(function (x) { return x.s === 'a'; }).length;
        var i = list.filter(function (x) { return x.s === 'i'; }).length;
        var r = list.filter(function (x) { return x.s === 'r'; }).length;
        var breakdown = api.fill(S['阶段-全月'], { n: list.length, a: a, i: i + r }) +
          (r ? api.fill(S['阶段-仅远端段'], { r: r }) : '');
        html += '<section class="phase-block" data-key="' + st.key + '"><header>' +
          '<span class="vol">' + CN[idx] + '</span>' +
          '<span class="m">' + api.monthKey(st.key) + ' · ' + st.name + '</span>' +
          '<span class="range">' + st.key.slice(0, 7) + '</span>' +
          '<span class="count">' + breakdown + '</span></header>' +
          '<p>' + st.para + '</p>' +
          (st.note && st.note.length
            ? '<div class="sweep-callout"><p class="small">' + st.note + '</p></div>'
            : '') +
          '<ul class="keys">' + st.items.map(function (it) {
            var s = status[it.slug] || 'i';
            return '<li class="' + s + '"><span class="mark" aria-hidden="true">' + api.MARK[s] +
              '</span><code>' + it.slug + '</code><span class="gloss">' + it.gloss + '</span></li>';
          }).join('') + '</ul></section>';
      });
      root.innerHTML = html;
      if (api.data.presetMonth) {
        var blk = root.querySelector('.phase-block[data-key="' + api.data.presetMonth + '"]');
        if (blk) {
          var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
          blk.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
          blk.classList.add('flash');
          setTimeout(function () { blk.classList.remove('flash'); }, 1600);
        }
      }
    }
  });
})();
