# AI 叙事层

`tools/summarize.py` 用大模型把 `data/arch-notes.json` 的紧凑语料提炼成站点叙事，产出草稿供人工校订。它只负责 `content/narrative.json` 的 `phases` 与 `regions` 两节；`site` 与 `glossary` 不属于总结对象，原样透传。数据流水线与字段契约见 [pipeline.md](pipeline.md)。

## 生成单元与语料

一个 AI 调用 = 一个 narrative 条目，共两类任务：

- **阶段（按月）**：输入为当月决策的紧凑清单（日期、slug、中文标题、状态、被引用数）加该阶段现状文案，输出改写后的 `name`/`para`/`note`/`items`。
- **区域**：输入为该区域现状文案加全量决策清单（可补充更承重的条目），输出 `desc`/`items`。

按条目切分的动机：输出单元与数据结构一一对应；短输出才守得住「先观点后事实」的风格要求；一段失败只损失一段（回退现状并在报告标注）；风格统一靠前置注入（system prompt + 两段人写叙事作 few-shot），不靠调用间通信。

每条任务的硬约束写进提示词：slug 必须逐字来自清单、gloss 不超过 24 字、`para` 80-160 字、不出现篇数与百分比数字（页面另行显示）、已有阶段的名称原样沿用（名称是站点信息架构的一部分）。

## 模式与闸门

```sh
python3 tools/summarize.py              # 调 AI 重新生成 content/narrative.draft.json（已对账）
python3 tools/summarize.py --check      # 不调 AI：对现有草稿跑对账与格式化报告
python3 tools/summarize.py --apply      # 不调 AI：把已评审的草稿写入 narrative.json（保留 .bak）
python3 tools/summarize.py --merge-new  # 只合入数据中新增的阶段（CI 用）
```

人工闸门是分层的：**数据中出现全新月份**（尚无叙事的阶段）可自动合入——新月份没有会被覆盖的人写内容；**已有月份/区域的改写必须人工评审后 `--apply`**。草稿文件不入库（`.gitignore`），评审产物落盘在 `content/narrative.draft.json`。

`--check` 的对账在草稿层做两件事：slug 对账（剔除清单外 slug、迁移错月、去重）与格式化（剥 markdown 残留、零宽字符、规范破折号）。超限项（gloss 超 24 字等）以「需人工改写」的软警告报告，不静默修改。运行时账簿页还有一层二次降级：`items` 里的 slug 若在数据中不存在则渲染时跳过。

## 并发模型

阶段与区域任务彼此独立：读的都是只读输入（提取数据、该段现状、风格基准），写的目标互不相交。因此 13 个左右任务交给 `ThreadPoolExecutor` 扇出，墙钟时间从「各段之和」降为「约一波次之和」（默认 4 路）。

要点：

- **并发度是配额礼貌值**：`DASHSCOPE_PARALLEL`（默认 4）不是性能极限，而是避免对共享配额打出脉冲导致限流；配额充裕可调高。
- **顺序与完成顺序解耦**：任务返回值而非改共享状态，主线程按提交顺序收集、按 `ordered_keys` 与区域顺序重新拼装，草稿的段落顺序永远稳定，人工 diff 只见内容差异。
- **对账单点化**：`normalize_draft` 在全部结果汇聚后跑一次，并发只发生在调 AI 一步，保证收敛逻辑在一处。

## 接口与配置

DashScope 兼容模式 `chat/completions`，结构化输出用 `response_format: json_object`（messages 须含 "JSON" 字样；不设 max_tokens 防截断；模型不支持该参数时自动降级重试）。绕过 aihelpmed 守护进程直连，但读取同一份配置：

| 配置项 | 来源（按优先级） |
| --- | --- |
| 端点 | `DASHSCOPE_COMPATIBLE_URL` → `DASHSCOPE_WORKSPACE`（拼 MaaS 域名）→ `~/.config/aihelpme/config.yaml` 的 `workspace_id` |
| 模型 | `DASHSCOPE_MODEL` → 代码内默认值 |
| 超时 | `DASHSCOPE_TIMEOUT`（默认 600 秒；大参数推理模型出首 token 慢） |
| 并发 | `DASHSCOPE_PARALLEL`（默认 4） |
| 密钥 | `DASHSCOPE_API_KEY`（CI 走仓库 Secrets；本地也可由 shell 配置提供） |

工作区 ID 不入库：脚本从本地配置解析，仓库只认环境变量。模型会到期，过期时用 `DASHSCOPE_MODEL=<新模型>` 临时指定即可，不必改代码。
