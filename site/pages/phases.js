/* 阶段：五个阶段的叙事与承重决策 */
(function () {
  'use strict';
  var STAGES = [
    {
      key: '2026-06',
      para: '6 月 11 日，建仓次日的第一批六篇笔记定下最底层的设计词汇：微内核事件分类、结构化错误分类、运行时参数校验、工具 Schema 进提示词组装。同期落地的「事件溯源会话」与「能力缝」是全项目的承重墙——前者规定会话即 append-only 事件日志，后者确立「加一种能力 = 注册一条缝」的扩展模式。此后两周补齐 agent 生命周期、持久化与包结构。这一个月定下的词汇至今没有变。',
      keys: [
        ['microkernel-event-taxonomy', '插件向共享上下文贡献服务与类型化事件，事件域就此定名'],
        ['event-sourced-sessions', '会话即事件日志，模型可见的内容必须能从日志重建'],
        ['capability-seams', 'Service Definition / Provider / Consumer 三角色构成可替换能力'],
        ['session-persistence', '会话持久化的存储与世代策略'],
        ['turn-enclosure-invariant', '所有会话事件必须落在某个 turn 之内'],
        ['agent-lifecycle-and-ownership-contracts', 'agent 的创建、就绪与所有权归属'],
        ['branded-ids', '跨边界 id 一律品牌化，不用裸 string'],
        ['package-hierarchy', 'packages/ 两级目录的原始决策（9 月曾按依赖聚类重构）']
      ]
    },
    {
      key: '2026-07',
      para: '能力缝模式被复制到各个领域：LSP、subprocess、后台任务、目录选择器先后成缝。模型侧完成按 provider 路由的适配器与协作式取消；GUI 分层与 RPC 协议、Web 客户端架构、TUI 都在这一月成型；会话日志落盘改为 zstd 压缩的 JSONL。「注册一条缝就能换掉一种能力」的开发节奏在这个月确立。',
      keys: [
        ['provider-routed-llm-adapters', '按 provider 路由的模型适配器注册'],
        ['lsp-capability-seam', '语言服务器成为能力缝'],
        ['subprocess-seam', '子进程执行抽象为缝'],
        ['job-registry-seam', '后台任务注册表'],
        ['gui-layering-and-rpc-protocol', 'GUI 分层与 RPC 协议分层'],
        ['gui-web-client-architecture', 'Web 客户端的整体架构'],
        ['zstandard-jsonl-session-logs', '会话日志落盘为 zstd JSONL'],
        ['cooperative-tool-cancellation', '工具调用的协作式取消']
      ]
    },
    {
      key: '2026-08',
      para: '重心从代码转向交付物：profile 与 bundle 的组合机制、单一 dsh 启动器、Electron 桌面打包、Python SDK 复用 dsh profile 运行时、sdk-minimal 独立 profile。数据层同步硬化：会话日志引入版本机制，发布格式的相邻迁移链确立「已提交世代永不改名或删除」的规则。安全侧补上浏览器 token 认证；「code-mode」更名 PTC。',
      keys: [
        ['profile-plugin-bundles', 'profile/bundle 组合机制'],
        ['single-dsh-application-launcher', '所有受支持的 Node 应用只经 dsh profile 启动'],
        ['electron-desktop-packaging-and-updates', 'Electron 桌面打包与更新'],
        ['python-sdk-dsh-profile-runtime', 'Python SDK 复用 dsh profile 运行时'],
        ['standalone-sdk-minimal-profile', 'sdk-minimal：一个 bundle 拥有完整显式 SDK 树'],
        ['session-log-version-mechanism', '会话日志版本机制'],
        ['released-session-format-migrations', '发布格式的相邻迁移链'],
        ['browser-token-authentication', '浏览器 token 认证'],
        ['rename-code-mode-to-ptc', 'code-mode 更名 PTC']
      ]
    },
    {
      key: '2026-09',
      para: '发布冲刺月：桌面应用连续加固（捆绑运行时、欢迎窗、Office 文档预览、Windows 安装器），插件生态成型（Web 侧栏管理、安装 registry、声明式 agent preset），会话信封演进到 v3，工具调用拆为三阶段，定时消息有了事件框架。',
      keys: [
        ['v3-canonical-session-envelopes', 'v3 规范会话信封'],
        ['desktop-bundled-runtime-and-external-plugins', '桌面捆绑运行时与外部插件'],
        ['plugin-management-in-the-web-sidebar', 'Web 侧栏管理插件'],
        ['plugin-install-registries', '插件安装 registry'],
        ['declarative-agent-presets', '声明式 agent preset'],
        ['tool-call-three-phases', '工具调用拆为三阶段'],
        ['scheduled-message-framing', '定时消息的事件框架']
      ]
    },
    {
      key: '2026-10',
      para: '骨架稳定后，决策转向增量特性与收尾：计算机操作（CUA）的对象 API 与应用授权、PTC 沙箱持久化、会话分叉语义修正、DeepSeek 官方模型目录、WebSocket 压缩。十月 42 篇全部处于现行状态，其中 34 篇尚未同步到本地克隆。',
      keys: [
        ['persistent-ptc-sandbox', 'PTC 运行时的持久沙箱'],
        ['independent-session-forks', '普通分叉不再携带创建者关系，与子代理明确区分'],
        ['deepseek-official-model-listing', 'DeepSeek 官方模型目录'],
        ['when-access', '客户端插件的注册随对端访问变化自动开关'],
        ['websocket-permessage-deflate', 'WebSocket 连接启用 permessage-deflate 压缩']
      ]
    }
  ];

  window.DSH_ARCH.pages.register('phases', {
    render: function (root, api) {
      var bm = api.byMonth();
      var status = {};
      api.data.notes.forEach(function (x) { status[x.n] = x.s; });
      var html = '<p class="small muted">每阶段的叙事与承重决策（带一句话注释）。标记含义见' +
        ' <a href="#/overview">总览</a>；每条的标题、摘要与路径见<a href="#/ledger">账簿</a>。</p>';
      var CN = ['一', '二', '三', '四', '五'];
      STAGES.forEach(function (st, idx) {
        var list = bm[st.key] || [];
        var a = list.filter(function (x) { return x.s === 'a'; }).length;
        var i = list.filter(function (x) { return x.s === 'i'; }).length;
        var r = list.filter(function (x) { return x.s === 'r'; }).length;
        var breakdown = '全月 ' + list.length + ' 篇：' + a + ' 已封存 · ' + (i + r) + ' 现行' +
          (r ? '（' + r + ' 篇仅远端）' : '');
        html += '<section class="phase-block"><header>' +
          '<span class="vol">' + CN[idx] + '</span>' +
          '<span class="m">' + api.monthKey(st.key) + ' · ' + api.PHASES[st.key][0] + '</span>' +
          '<span class="range">' + st.key.slice(0, 7) + '</span>' +
          '<span class="count">' + breakdown + '</span></header>' +
          '<p>' + st.para + '</p>' +
          (st.key === '2026-09'
            ? '<div class="sweep-callout"><p class="small">本月两次封存大扫除：9-04 封存 99 篇，9-30 封存 59 篇——归档库的绝大部分在这两天入库冻结。</p></div>'
            : '') +
          '<ul class="keys">' + st.keys.map(function (it) {
            var s = status[it[0]] || 'i';
            return '<li class="' + s + '"><span class="mark" aria-hidden="true">' + ({ a: '◦', i: '●', r: '◇' }[s]) +
              '</span><code>' + it[0] + '</code><span class="gloss">' + it[1] + '</span></li>';
          }).join('') + '</ul></section>';
      });
      root.innerHTML = html;
    }
  });
})();
