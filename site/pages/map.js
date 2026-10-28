/* 架构：围绕整图组织演进——区域与精选决策来自 content/narrative.json 的「架构区域」章节 */
(function () {
  'use strict';
  var CN = api.static['序数'];
  window.DSH_ARCH.pages.register('map', {
    render: function (root, api) {
      var S = api.static, C = api.site;
      var bySlug = {};
      api.data.notes.forEach(function (x) { bySlug[x.n] = x; });
      var html =
        '<p class="lede">' + api.esc(api.fill(C['架构-导语'])) + '</p>' +
        '<figure class="map-embed">' +
        '<figcaption>' + api.esc(S['架构-图注']) + ' · <a href="dsh-architecture.html" target="_blank" rel="noopener">' + api.esc(S['架构-打开整图']) + '</a></figcaption>' +
        '<iframe id="arch-frame" title="' + api.esc(S['架构-iframe标题']) + '" loading="lazy"></iframe>' +
        '</figure>';
      html += api.regions.map(function (r, idx) {
        return '<section class="region"><h2><span class="vol">' + CN[idx] + '</span> ' + r.name + '</h2>' +
          '<p class="small muted">' + r.desc + '</p>' +
          '<ul class="keys">' + r.items.map(function (it) {
            var note = bySlug[it.slug];
            var s = note ? note.s : 'i';
            var d = note ? note.d.slice(5) : '';
            return '<li class="' + s + '"><span class="mark" aria-hidden="true">' + api.MARK[s] +
              '</span><a href="#/ledger?q=' + encodeURIComponent(it.slug) + '"><code class="d">' + d +
              '</code> ' + it.gloss + ' <code class="slug">' + it.slug + '</code></a></li>';
          }).join('') + '</ul></section>';
      }).join('');
      root.innerHTML = html;
      root.querySelector('#arch-frame').src = 'dsh-architecture.html';
    }
  });
})();
