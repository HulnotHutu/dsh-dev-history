/* 体例：Agent Notes 体系说明（来自 content/narrative.json「体例」章节）与数据口径（来自提取元数据） */
(function () {
  'use strict';
  window.DSH_ARCH.pages.register('about', {
    render: function (root, api) {
      var M = api.data.meta;
      var dl = api.glossary.map(function (g) {
        return '<dt>' + g.term + '</dt><dd>' + g.body + '</dd>';
      }).join('');
      root.innerHTML =
        '<section class="about">' +
        '<h2>体例</h2>' +
        '<dl>' + dl + '</dl>' +
        '<h2>数据口径</h2>' +
        '<p>全库英文原件：已封存 ' + M.allClasses.archived + ' 篇，现行 ' + M.allClasses.active +
        ' 篇。本站收录其中 architecture 类（提取自 ' + M.remoteHead + ' 的仓库状态）：</p>' +
        '<table class="class-table">' +
        '<tr><th scope="col">状态</th><th scope="col">篇数</th><th scope="col">说明</th></tr>' +
        '<tr><td>已封存</td><td class="num">' + M.archived + '</td><td>两次大扫除入库：' +
        M.sweeps.map(function (s) { return s.date.slice(5) + ' 封 ' + s.count + ' 篇'; }).join('、') + '</td></tr>' +
        '<tr><td>现行（提取自本地工作区）</td><td class="num">' + (M.active - M.remoteOnly) + '</td><td>现行笔记提取至 ' + M.localImplLatest + '</td></tr>' +
        '<tr><td>现行（提取自远端）</td><td class="num">' + M.remoteOnly + '</td><td>提取时仅存在于远端 master 的笔记</td></tr>' +
        '<tr><td>合计</td><td class="num">' + M.total + '</td><td>其中 ' + M.zhCount + ' 篇有中文全文</td></tr>' +
        '</table>' +
        '<p class="small muted">中文全文来自各笔记的 <code>.zh.md</code> 维护副本；数据由仓库内的 <code>tools/extract.py</code> 与 <code>tools/build.py</code> 生成，更新方式见仓库 README。</p>' +
        '</section>';
    }
  });
})();
