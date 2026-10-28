/* 体例：Agent Notes 体系说明（来自 content/narrative.json「体例」章节）与数据口径（来自提取元数据） */
(function () {
  'use strict';
  window.DSH_ARCH.pages.register('about', {
    render: function (root, api) {
      var M = api.data.meta;
      var S = api.static, C = api.site;
      var dl = api.glossary.map(function (g) {
        return '<dt>' + g.term + '</dt><dd>' + g.body + '</dd>';
      }).join('');
      root.innerHTML =
        '<section class="about">' +
        '<h2>' + S['体例-标题'] + '</h2>' +
        '<dl>' + dl + '</dl>' +
        '<h2>' + S['体例-口径标题'] + '</h2>' +
        '<p>' + api.fill(S['体例-口径说明']) + '</p>' +
        '<table class="class-table">' +
        '<tr><th scope="col">' + S['体例-表头'][0] + '</th><th scope="col">' + S['体例-表头'][1] + '</th><th scope="col">' + S['体例-表头'][2] + '</th></tr>' +
        '<tr><td>' + S['状态名'].a + '</td><td class="num">' + M.archived + '</td><td>' + S['体例-大扫除'] + '：' +
        M.sweeps.map(function (s) { return api.fill(S['总览-扫除长'], { d: s.date.slice(5), count: s.count }) + S['篇']; }).join('、') + '</td></tr>' +
        '<tr><td>' + S['体例-行本地'] + '</td><td class="num">' + (M.active - M.remoteOnly) + '</td><td>' + api.fill(S['体例-本地说明']) + '</td></tr>' +
        '<tr><td>' + S['体例-行远端'] + '</td><td class="num">' + M.remoteOnly + '</td><td>' + S['体例-远端说明'] + '</td></tr>' +
        '<tr><td>' + S['体例-行合计'] + '</td><td class="num">' + M.total + '</td><td>' + api.fill(S['体例-合计说明']) + '</td></tr>' +
        '</table>' +
        '<p class="small muted">' + C['体例-尾注'] + '</p>' +
        '</section>';
    }
  });
})();
