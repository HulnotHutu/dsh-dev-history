/* 体例：Agent Notes 体系与数据口径 */
(function () {
  'use strict';
  window.DSH_ARCH.pages.register('about', {
    render: function (root, api) {
      var M = api.data.meta;
      root.innerHTML =
        '<section class="about">' +
        '<h2>Agent Notes 是什么</h2>' +
        '<p>DeepSeek Harness 用一套「Agent Note」制度记录设计决策：每篇笔记记录一个影响代码库的决策或提案——' +
        '为什么要做、放弃了什么，即代码和文档承载不了的部分。规则由 <code>.agents/notes/README.md</code> 定义，' +
        '格式与冻结状态由仓库内的脚本门禁强制执行。</p>' +
        '<dl>' +
        '<dt>路径即元数据</dt><dd><code>{生命周期}/{类别}/yyyy-mm-dd-主题.md</code>。日期是决策首次提出的时间；' +
        '生命周期分 proposed（提案）、implemented（已实施）、rejected（已否决）三种。</dd>' +
        '<dt>类别是封闭集合</dt><dd>feature / bug-fix / simplification / architecture / process / testing 六类，' +
        '由 <code>scripts/agent-note-tree.ts</code> 硬编码。本站只收录 architecture 类：关于所发布源码的结构性决策。</dd>' +
        '<dt>Alternatives considered 强制</dt><dd>每篇笔记必须记录每个真实备选方案及落选原因——' +
        '只记决策不记它击败了什么，会招致反复重新争论。</dd>' +
        '<dt>归档即冻结</dt><dd>实施完成且不再指导未来工作的笔记移入 <code>archived/</code>，' +
        '插入 <code>Archived:</code> 日期后永久冻结：不得编辑、翻译、移动或删除，也不再是现行行为的权威。' +
        '账簿里展开一条已封存的决策，能看到它的封存日期。</dd>' +
        '<dt>双语成对</dt><dd>每篇有 <code>.zh.md</code> 中文副本与 <code>.i18n.yaml</code> 边车；' +
        '本站只计英文原件，避免重复计数。</dd>' +
        '</dl>' +
        '<h2>数据口径</h2>' +
        '<p>全库英文原件：已封存 ' + M.allClasses.archived + ' 篇，现行 ' + M.allClasses.active +
        ' 篇（本地口径）。本站收录其中 architecture 类：</p>' +
        '<table class="class-table">' +
        '<tr><th scope="col">状态</th><th scope="col">篇数</th><th scope="col">说明</th></tr>' +
        '<tr><td>已封存</td><td class="num">' + M.archived + '</td><td>两次大扫除入库：' +
        M.sweeps.map(function (s) { return s.date.slice(5) + ' 封 ' + s.count + ' 篇'; }).join('、') + '</td></tr>' +
        '<tr><td>现行（本地）</td><td class="num">' + (M.active - M.remoteOnly) + '</td><td>截至本地克隆的 ' + M.localImplLatest + '</td></tr>' +
        '<tr><td>现行（仅远端）</td><td class="num">' + M.remoteOnly + '</td><td>本地尚未 pull 的 41 篇</td></tr>' +
        '<tr><td>合计</td><td class="num">' + M.total + '</td><td>截至远端 master ' + M.remoteHead + '</td></tr>' +
        '</table>' +
        '<p class="small muted">本地克隆落后远端 2,529 个提交。执行 <code>git pull</code> 后，' +
        '「仅远端」的笔记会并入本地；届时重跑数据脚本即可更新本站。</p>' +
        '</section>';
    }
  });
})();
