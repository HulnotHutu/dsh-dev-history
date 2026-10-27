# 站点

副标题: 结构性决策的编目档案：每篇笔记记录动机、决策、被否掉的备选与代价；本站按时间编目，可检索、可上溯。

导语: DeepSeek Harness 仓库用「Agent Note」记录每个结构性设计决策：为什么要做、放弃了什么。本站把其中 architecture 类（关于所发布源码的结构决策）的 {total} 篇按时间排成一本可检索的账簿，覆盖 {first}（建仓次日）到 {last}。

指南-现行: 决策已实施，正在指导当前代码（{active} 篇）

指南-已封存: 决策完整落地后移入归档库，永久冻结，不再是现行行为的权威（{archived} 篇）

指南-仅远端: 提取时只存在于远端 master 的笔记（{remoteOnly} 篇）

推荐读法: 先在「架构」页看整体结构（嵌入整图，按图上四个区域铺开各自演进），再到「账簿」按标题或文件名搜索，每条都能展开看完整段落与仓库路径。

节奏图说明: 每个决策记两笔：提出（写成笔记）与封存（移入归档库）。按自然周统计。

逐月说明: 逐月的主题与篇数；点击进入「阶段」页看叙事与承重决策。

地基说明: 被后续决策正文引用最多的笔记——后来的取舍大多站在它们之上。计数来自这 {total} 篇笔记的交叉引用，点击查看该决策。

页脚-1: 数据：.agents/notes/{archived,implemented}/architecture（只计英文原件）

页脚-2: 数据截至 {remoteHead}（远端 master）· 口径与生成方式见「体例」页，更新方式见仓库 README

# 体例

- **Agent Notes 是什么**：DeepSeek Harness 用一套「Agent Note」制度记录设计决策：每篇笔记记录一个影响代码库的决策或提案——为什么要做、放弃了什么，即代码和文档承载不了的部分。规则由 `.agents/notes/README.md` 定义，格式与冻结状态由仓库内的脚本门禁强制执行。
- **路径即元数据**：`{生命周期}/{类别}/yyyy-mm-dd-主题.md`。日期是决策首次提出的时间；生命周期分 proposed（提案）、implemented（已实施）、rejected（已否决）三种。
- **类别是封闭集合**：feature / bug-fix / simplification / architecture / process / testing 六类，由 `scripts/agent-note-tree.ts` 硬编码。本站只收录 architecture 类：关于所发布源码的结构性决策。
- **Alternatives considered 强制**：每篇笔记必须记录每个真实备选方案及落选原因——只记决策不记它击败了什么，会招致反复重新争论。
- **归档即冻结**：实施完成且不再指导未来工作的笔记移入 `archived/`，插入 `Archived:` 日期后永久冻结：不得编辑、翻译、移动或删除，也不再是现行行为的权威。账簿里展开一条已封存的决策，能看到它的封存日期。
- **双语成对**：每篇有 `.zh.md` 中文副本与 `.i18n.yaml` 边车；本站只计英文原件，避免重复计数。

# 阶段

## 2026-06 立骨架

微内核事件分类、事件溯源会话、能力缝、agent 生命周期当月定型，这套词汇沿用至今。

重点：

- microkernel-event-taxonomy: 事件域定名：会话、agent、能力三类
- event-sourced-sessions: 会话即 append-only 事件日志，模型可见的内容必须能从日志重建
- capability-seams: Service Definition / Provider / Consumer 三角色构成可替换能力
- session-persistence: 会话持久化的存储与世代策略
- turn-enclosure-invariant: 所有会话事件必须落在某个 turn 之内
- agent-lifecycle-and-ownership-contracts: agent 的创建、就绪与所有权归属
- branded-ids: 跨边界 id 一律品牌化，不用裸 string
- package-hierarchy: packages/ 两级目录的原始决策（9 月曾按依赖聚类重构）

## 2026-07 铺开能力缝

能力缝复制到 LSP、subprocess、后台任务、目录选择器。模型侧完成按 provider 路由的适配器与协作式取消；GUI 分层与 RPC 协议、Web 客户端架构、TUI 都在这一月成型；会话日志落盘改为 zstd 压缩的 JSONL。

重点：

- provider-routed-llm-adapters: 按 provider 路由的模型适配器注册
- lsp-capability-seam: 语言服务器成为能力缝
- subprocess-seam: 子进程执行抽象为缝
- job-registry-seam: 后台任务注册表
- gui-layering-and-rpc-protocol: GUI 分层与 RPC 协议分层
- gui-web-client-architecture: Web 客户端的整体架构
- zstandard-jsonl-session-logs: 会话日志落盘为 zstd JSONL
- cooperative-tool-cancellation: 工具调用的协作式取消

## 2026-08 产品化

重心从代码转向交付物：profile 与 bundle 的组合机制、单一 dsh 启动器、Electron 桌面打包、Python SDK 复用 dsh profile 运行时、sdk-minimal 独立 profile。数据层同步硬化：会话日志引入版本机制，发布格式的相邻迁移链确立「已提交世代永不改名或删除」的规则。安全侧补上浏览器 token 认证；「code-mode」更名 PTC。

重点：

- profile-plugin-bundles: profile/bundle 组合机制
- single-dsh-application-launcher: 所有受支持的 Node 应用只经 dsh profile 启动
- electron-desktop-packaging-and-updates: Electron 桌面打包与更新
- python-sdk-dsh-profile-runtime: Python SDK 复用 dsh profile 运行时
- standalone-sdk-minimal-profile: sdk-minimal：一个 bundle 拥有完整显式树
- session-log-version-mechanism: 会话日志版本机制
- released-session-format-migrations: 发布格式的相邻迁移链
- browser-token-authentication: 浏览器 token 认证
- rename-code-mode-to-ptc: code-mode 更名 PTC

## 2026-09 发布冲刺

发布冲刺月：桌面应用连续加固（捆绑运行时、欢迎窗、Office 文档预览、Windows 安装器），插件生态成型（Web 侧栏管理、安装 registry、声明式 agent preset），会话信封演进到 v3，工具调用拆为三阶段，定时消息有了事件框架。

重点：

- v3-canonical-session-envelopes: v3 规范会话信封
- desktop-bundled-runtime-and-external-plugins: 桌面捆绑运行时与外部插件
- plugin-management-in-the-web-sidebar: Web 侧栏管理插件
- plugin-install-registries: 插件安装 registry
- declarative-agent-presets: 声明式 agent preset
- tool-call-three-phases: 工具调用拆为三阶段
- scheduled-message-framing: 定时消息的事件框架

大扫除：

本月两次封存大扫除：9-04 封存 99 篇，9-30 封存 59 篇——归档库的绝大部分在这两天入库冻结。

## 2026-10 活跃前沿

骨架稳定后，决策转向增量特性与收尾：计算机操作（CUA）的对象 API 与应用授权、PTC 沙箱持久化、会话分叉语义修正、DeepSeek 官方模型目录、WebSocket 压缩。当月笔记全部处于现行状态。

重点：

- persistent-ptc-sandbox: PTC 运行时的持久沙箱
- independent-session-forks: 普通分叉不再携带创建者关系，与子代理明确区分
- deepseek-official-model-listing: DeepSeek 官方模型目录
- when-access: 客户端插件的注册随对端访问变化自动开关
- websocket-permessage-deflate: WebSocket 连接启用 permessage-deflate 压缩

# 架构区域

## Cordis 插件框架

dsh 的底座：插件向共享上下文贡献服务、类型化事件与可撤销 effect，没有特权核心，agent 循环本身也是插件。图中的「工具管线」「驱动 turn」「ctx.tools 注册表」都立在这一层——它是 6 月 11 日第一批笔记的产物。

重点：

- microkernel-event-taxonomy: 事件域定名：会话、agent、能力三类
- structured-error-taxonomy: 结构化错误分类
- runtime-arg-validation: 运行时参数校验
- custom-schema-dsl: 自定义 Schema DSL
- tool-schemas-in-prompt-assembly: 工具 Schema 进提示词组装
- event-domain-semantics: 三类事件域语义定型
- agent-scope-contexts: 每个 agent 的作用域上下文
- scoped-layers-store: 作用域分层的存储
- dispose-ladder-to-consumer: 卸载阶梯交给消费方
- cordis-runtime-tree-inspection: Cordis 运行树可检视
- profile-plugin-host-runtime-instances: 插件宿主的运行时实例

## Profile 与 Bundle

一个运行中的 dsh 是启动时按有序分层组合出来的插件树：profile 列出叠放的 bundle，bundle 携带配置行与代码，patch 链可以替换任何一行；web、headless、sdk、sdk-minimal、acp 五个内置 profile 共享 dsh-base 底层。图中的「应用启动」「dsh-base」「profile 与 bundle」节点。

重点：

- package-hierarchy: packages/ 两级目录的原始决策
- single-harness-home-resolver: 唯一 Harness home 解析器
- configuration-source-ownership: 配置来源所有权
- profile-plugin-bundles: profile/bundle 组合机制
- single-dsh-application-launcher: 所有应用只经 dsh profile 启动
- python-sdk-dsh-profile-runtime: Python SDK 复用 dsh 运行时
- standalone-sdk-minimal-profile: sdk-minimal：一个 bundle 拥有完整显式树
- desktop-in-place-profile: 桌面就地 profile
- profile-resolution-generations: profile 解析代际
- profile-owned-live-configuration: profile 持有运行时配置
- profile-package-refresh-and-manifest-invalidation: 包刷新与清单失效
- official-on-demand-bundles: 官方按需 bundle

## Session 日志

append-only 事件流是唯一事实源：模型可见 ⟺ 已记录日志；派生消息、回放、fork、迁移全部从日志推导，已提交的世代永不改名或删除。图中的「append-only」「append/derive」「session log」——这块的演进几乎就是一部格式版本史。

重点：

- event-sourced-sessions: 会话即 append-only 事件日志
- session-persistence: 持久化策略
- shared-persistence-write-coordinator: 共享写协调器
- zstandard-jsonl-session-logs: zstd JSONL 落盘
- packed-chunk-rows-by-default: 默认打包 chunk 行
- session-log-version-mechanism: 日志版本机制
- handle-based-session-persistence: 句柄式持久化
- released-session-format-migrations: 相邻迁移链：vN → vN+1
- v2-embedded-assistant-streams: v2：完整流内嵌进消息
- v3-canonical-session-envelopes: v3 规范信封
- native-v4-read-validation: v4 读取校验
- lossless-projection-checkpoint-json: 无损投影检查点
- independent-session-forks: 普通分叉与子代理明确区分

## Capability Seam

一条缝 = Service Definition / Provider / Consumer 三角色；换一个 provider 就换掉整块能力——文件系统与子进程共享一个执行世界，指向远程沙箱即整体切换，模型侧同理。图中的「capability seam」「provider adapter」「唯一模型路径」「适配器流式」。

重点：

- capability-seams: 三角色能力缝总纲
- twin-llm-adapters: 双 LLM 适配器起步
- filesystem-capability-seam: 文件系统缝
- provider-routed-llm-adapters: 按 provider 路由适配器
- lsp-capability-seam: LSP 缝
- subprocess-seam: 子进程缝
- job-registry-seam: 后台任务缝
- directory-picker-capability-seam: 目录选择器缝
- tool-call-three-phases: 工具调用拆为三阶段
- sandboxed-node-ptc-runtime: 沙箱化 Node PTC 运行时
- computer-use-provider-registration: 计算机操作 provider
- browser-use-provider-registration: 浏览器操作 provider
- persistent-ptc-sandbox: PTC 沙箱持久化
