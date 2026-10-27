/* 架构：围绕整图组织演进——图上四个区域，各铺开自己的决策史 */
(function () {
  'use strict';
  var REGIONS = [
    {
      key: 'cordis',
      name: 'Cordis 插件框架',
      desc: 'dsh 的底座：插件向共享上下文贡献服务、类型化事件与可撤销 effect，没有特权核心，agent 循环本身也是插件。图中的「工具管线」「驱动 turn」「ctx.tools 注册表」都立在这一层——它是 6 月 11 日第一批笔记的产物。',
      items: [
        ['microkernel-event-taxonomy', '事件域定名：会话、agent、能力三类'],
        ['structured-error-taxonomy', '结构化错误分类'],
        ['runtime-arg-validation', '运行时参数校验'],
        ['custom-schema-dsl', '自定义 Schema DSL'],
        ['tool-schemas-in-prompt-assembly', '工具 Schema 进提示词组装'],
        ['event-domain-semantics', '三类事件域语义定型'],
        ['agent-scope-contexts', '每个 agent 的作用域上下文'],
        ['scoped-layers-store', '作用域分层的存储'],
        ['dispose-ladder-to-consumer', '卸载阶梯交给消费方'],
        ['cordis-runtime-tree-inspection', 'Cordis 运行树可检视'],
        ['profile-plugin-host-runtime-instances', '插件宿主的运行时实例']
      ]
    },
    {
      key: 'profile',
      name: 'Profile 与 Bundle',
      desc: '一个运行中的 dsh 是启动时按有序分层组合出来的插件树：profile 列出叠放的 bundle，bundle 携带配置行与代码，patch 链可以替换任何一行；web、headless、sdk、sdk-minimal、acp 五个内置 profile 共享 dsh-base 底层。图中的「应用启动」「dsh-base」「profile 与 bundle」节点。',
      items: [
        ['package-hierarchy', 'packages/ 两级目录的原始决策'],
        ['single-harness-home-resolver', '唯一 Harness home 解析器'],
        ['configuration-source-ownership', '配置来源所有权'],
        ['profile-plugin-bundles', 'profile/bundle 组合机制'],
        ['single-dsh-application-launcher', '所有应用只经 dsh profile 启动'],
        ['python-sdk-dsh-profile-runtime', 'Python SDK 复用 dsh 运行时'],
        ['standalone-sdk-minimal-profile', 'sdk-minimal：一个 bundle 拥有完整显式树'],
        ['desktop-in-place-profile', '桌面就地 profile'],
        ['profile-resolution-generations', 'profile 解析代际'],
        ['profile-owned-live-configuration', 'profile 持有运行时配置'],
        ['profile-package-refresh-and-manifest-invalidation', '包刷新与清单失效'],
        ['official-on-demand-bundles', '官方按需 bundle']
      ]
    },
    {
      key: 'session',
      name: 'Session 日志',
      desc: 'append-only 事件流是唯一事实源：模型可见 ⟺ 已记录日志；派生消息、回放、fork、迁移全部从日志推导，已提交的世代永不改名或删除。图中的「append-only」「append/derive」「session log」——这块的演进几乎就是一部格式版本史。',
      items: [
        ['event-sourced-sessions', '会话即 append-only 事件日志'],
        ['session-persistence', '持久化策略'],
        ['shared-persistence-write-coordinator', '共享写协调器'],
        ['zstandard-jsonl-session-logs', 'zstd JSONL 落盘'],
        ['packed-chunk-rows-by-default', '默认打包 chunk 行'],
        ['session-log-version-mechanism', '日志版本机制'],
        ['handle-based-session-persistence', '句柄式持久化'],
        ['released-session-format-migrations', '相邻迁移链：vN → vN+1'],
        ['v2-embedded-assistant-streams', 'v2：完整流内嵌进消息'],
        ['v3-canonical-session-envelopes', 'v3 规范信封'],
        ['native-v4-read-validation', 'v4 读取校验'],
        ['lossless-projection-checkpoint-json', '无损投影检查点'],
        ['independent-session-forks', '普通分叉与子代理明确区分']
      ]
    },
    {
      key: 'seam',
      name: 'Capability Seam',
      desc: '一条缝 = Service Definition / Provider / Consumer 三角色；换一个 provider 就换掉整块能力——文件系统与子进程共享一个执行世界，指向远程沙箱即整体切换，模型侧同理。图中的「capability seam」「provider adapter」「唯一模型路径」「适配器流式」。',
      items: [
        ['capability-seams', '三角色能力缝总纲'],
        ['twin-llm-adapters', '双 LLM 适配器起步'],
        ['filesystem-capability-seam', '文件系统缝'],
        ['provider-routed-llm-adapters', '按 provider 路由适配器'],
        ['lsp-capability-seam', 'LSP 缝'],
        ['subprocess-seam', '子进程缝'],
        ['job-registry-seam', '后台任务缝'],
        ['directory-picker-capability-seam', '目录选择器缝'],
        ['tool-call-three-phases', '工具调用拆为三阶段'],
        ['sandboxed-node-ptc-runtime', '沙箱化 Node PTC 运行时'],
        ['computer-use-provider-registration', '计算机操作 provider'],
        ['browser-use-provider-registration', '浏览器操作 provider'],
        ['persistent-ptc-sandbox', 'PTC 沙箱持久化']
      ]
    }
  ];

  window.DSH_ARCH.pages.register('map', {
    render: function (root, api) {
      var bySlug = {};
      api.data.notes.forEach(function (x) { bySlug[x.n] = x; });
      var html =
        '<p class="lede">以整体架构图为底，看每一块是怎么长出来的：图上四个区域，下面各铺开' +
        '自己的决策史。点击任意一条，跳到<a href="#/ledger">账簿</a>并自动过滤到该决策。</p>' +
        '<figure class="map-embed">' +
        '<figcaption>DeepSeek Harness(dsh) 整体架构 · 由 archify 生成的交互图，可缩放与查看节点关系' +
        ' · <a href="dsh-architecture.html" target="_blank" rel="noopener">新窗口打开整图</a></figcaption>' +
        '<iframe id="arch-frame" title="DeepSeek Harness 整体架构图" loading="lazy"></iframe>' +
        '</figure>';
      var CN = ['一', '二', '三', '四'];
      html += REGIONS.map(function (r, idx) {
        return '<section class="region"><h2><span class="vol">' + CN[idx] + '</span> ' + r.name + '</h2>' +
          '<p class="small muted">' + r.desc + '</p>' +
          '<ul class="keys">' + r.items.map(function (it) {
            var note = bySlug[it[0]];
            var s = note ? note.s : 'i';
            var d = note ? note.d.slice(5) : '';
            return '<li class="' + s + '"><span class="mark" aria-hidden="true">' + api.MARK[s] +
              '</span><a href="#/ledger?q=' + encodeURIComponent(it[0]) + '"><code class="d">' + d +
              '</code> ' + it[1] + ' <code class="slug">' + it[0] + '</code></a></li>';
          }).join('') + '</ul></section>';
      }).join('');
      root.innerHTML = html;
      root.querySelector('#arch-frame').src = 'dsh-architecture.html';
    }
  });
})();
