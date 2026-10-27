/* 架构：围绕整图组织演进——区域与精选决策来自 content/narrative.md 的「架构区域」章节 */
(function () {
  'use strict';
  var CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  window.DSH_ARCH.pages.register('map', {
    render: function (root, api) {
      var bySlug = {};
      api.data.notes.forEach(function (x) { bySlug[x.n] = x; });
      var html =
        '<p class="lede">以整体架构图为底，看每一块是怎么长出来的：图上的区域，下面各铺开' +
        '自己的决策史。点击任意一条，跳到<a href="#/ledger">账簿</a>并自动过滤到该决策。</p>' +
        '<figure class="map-embed">' +
        '<figcaption>DeepSeek Harness(dsh) 整体架构 · 由 archify 生成的交互图，可缩放与查看节点关系' +
        ' · <a href="dsh-architecture.html" target="_blank" rel="noopener">新窗口打开整图</a></figcaption>' +
        '<iframe id="arch-frame" title="DeepSeek Harness 整体架构图" loading="lazy"></iframe>' +
        '</figure>';
      html += api.regions.map(function (r, idx) {
        return '<section class="region"><h2><span class="vol">' + CN[idx] + '</span> ' + r.name + '</h2>' +
          '<p class="small muted">' + r.desc.join('') + '</p>' +
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
