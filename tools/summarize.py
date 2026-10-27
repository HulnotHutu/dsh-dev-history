#!/usr/bin/env python3
"""AI 总结层：从 data/arch-notes.json 生成 content/narrative.json 的草稿。

流程：把每月/每区域的紧凑语料（日期、slug、中文标题、状态、被引用数）连同现状文案
交给 ~/scripts/aihelpme.sh（deepseek-v4-flash），逐段重写叙事与精选决策注释；
输出 content/narrative.draft.json 供人工校订——不直接覆盖正式文件。

约束：
  - items 的 slug 只能从数据清单中选择（草稿校验，运行时还有二次降级）；
  - 篇数等统计数字不进叙事（页面另行显示），避免快照数字漂移；
  - site 与 glossary 两节不属于总结对象，原样保留。
用法：python3 tools/summarize.py [--apply]
  无参数：调 AI 重新生成 content/narrative.draft.json；
  --apply：不再调 AI，把已评审的草稿写入 content/narrative.json（保留 .bak）。
"""
import json
import os
import urllib.error
import urllib.request
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
DATA = HERE / 'data' / 'arch-notes.json'
CURRENT = HERE / 'content' / 'narrative.json'
DRAFT = HERE / 'content' / 'narrative.draft.json'
AI = Path.home() / 'scripts' / 'aihelpme.sh'

PHASE_TASK = ('任务：根据当月决策清单（日期/slug/中文标题/状态/被引用数）与该月现状文案，'
              '重写这个阶段的 narrative 条目。')
REGION_TASK = ('任务：根据架构区域的现状描述、精选条目与全量决策清单，'
               '重写该区域的 narrative 条目。')
RULES = """硬约束：
1. desc/para：80-160 字中文，只用清单与现状里存在的事实，不得出现任何篇数/百分比数字（页面另行显示）。
2. items：6-12 条；slug 必须逐字来自候选清单；gloss 为不超过 24 字的中文一句话；除明显错误外保留现有条目，可少量增删。
3. note：仅当给定"大扫除提示"时保留并润色，否则为空字符串。
4. desc/para 中不要出现 markdown 标记。
5. 名称是站点信息架构的一部分，一律沿用现状名称原样输出，不要改写、翻译或另起名。"""

# 编辑人设与风格宪章：以仓库现有人写叙事为风格基准（few-shot 由 main() 注入）。
# 目标是把模型的默认清单腔校成"先观点后事实、每句承载一个判断"的人写密度。
SYSTEM_PROMPT = """你是「架构决策编年」的资深编辑，为 DeepSeek Harness 的决策账簿撰写阶段叙事、区域解说与精选条目注释。

风格宪章：
- 先观点，后事实：段落开头给出这个月/这块区域的判断，再用具体决策支撑；判断句要可反驳（"能力缝复制到 LSP、subprocess"），不是话题罗列（"涉及 LSP、subprocess 等方面"）。
- 每句承载一个判断；写完删掉不承载判断的句子。
- 禁止清单腔与公文腔：不用"同时""此外""值得一提的是"起句；不罗列名词串；不用"本文""该月"这类公文指代。
- 禁止空洞修饰与比喻：不要"稳健""强大""赋能""宛如"；平实、直接、句式简练。
- 术语与仓库一致：能力缝、封存、现行、生命周期、turn、session、profile、bundle。
- 破折号用——；不使用 markdown 标记；不出现任何篇数与百分比。

输出：只输出一个 JSON 对象（这是硬性格式要求），不要代码块围栏，不要解释。"""

# DashScope 兼容模式 + response_format: json_object（结构化输出）。
# 约束：messages 里须含 "JSON" 字样；不设 max_tokens（防 JSON 截断）；模型不支持时降级重试。
# 工作区 ID 不入库：优先环境变量，否则从用户本地 ~/scripts/aihelpme.sh 解析。
MODEL = 'deepseek-v4-flash-0731'


def endpoint():
    if os.environ.get('DASHSCOPE_COMPATIBLE_URL'):
        return os.environ['DASHSCOPE_COMPATIBLE_URL']
    if os.environ.get('DASHSCOPE_WORKSPACE'):
        return (f'https://{os.environ["DASHSCOPE_WORKSPACE"]}'
                '.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions')
    script = Path.home() / 'scripts' / 'aihelpme.sh'
    m = re.search(r'WorkspaceId=(\S+)', script.read_text()) if script.is_file() else None
    if not m:
        sys.exit('未找到 DashScope 工作区：设置 DASHSCOPE_WORKSPACE，或确认 ~/scripts/aihelpme.sh 存在')
    return (f'https://{m.group(1)}'
            '.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions')
_KEY_CACHE = {}


def api_key():
    if not _KEY_CACHE.get('k'):
        if os.environ.get('DASHSCOPE_API_KEY'):
            _KEY_CACHE['k'] = os.environ['DASHSCOPE_API_KEY']
        else:
            r = subprocess.run(['bash', '-c', 'source ~/.zshrc >/dev/null 2>&1; echo "$DASHSCOPE_API_KEY"'],
                               capture_output=True, text=True, check=True)
            _KEY_CACHE['k'] = r.stdout.strip()
    return _KEY_CACHE['k']


def chat(messages, structured):
    body = {'model': MODEL, 'messages': [{'role': 'system', 'content': SYSTEM_PROMPT}] + messages}
    if structured:
        body['response_format'] = {'type': 'json_object'}
    req = urllib.request.Request(endpoint(), data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + api_key(),
                                          'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=240) as r:
        resp = json.loads(r.read())
    return resp['choices'][0]['message']['content']


def call_ai(task, payload, style=''):
    """结构化输出调 DashScope（json_object 保证合法 JSON）；不支持 response_format 的模型自动降级为普通调用再剥壳。"""
    user = RULES + '\n\n' + task
    if style:
        user += '\n\n风格基准（模仿其密度与判断句式，不要复制内容）：\n' + style
    user += '\n\n' + payload
    messages = [{'role': 'user', 'content': user}]
    try:
        return json.loads(chat(messages, structured=True))
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors='replace')[:200]
        if 'response_format' not in detail and e.code != 400:
            raise
        print('warn: 端点不支持 response_format，降级为普通调用', file=sys.stderr)
    text = chat(messages, structured=False).strip()
    fence = re.search(r'```(?:json)?\s*(\{[\s\S]*\})\s*```', text)
    if fence:
        text = fence.group(1)
    start, end = text.find('{'), text.rfind('}')
    if start == -1 or end == -1:
        raise RuntimeError('AI 输出中没有 JSON：' + text[:200])
    return json.loads(text[start:end + 1])


def corpus(notes, counts):
    """紧凑语料：每篇一行（日期/slug/状态/中文标题/被引用数）。"""
    lines = []
    for x in notes:
        zt = (counts.get('_zt', {}).get(x['n']) or x['en'].get('t') or x['n'])
        s = {'a': '已封存', 'i': '现行', 'r': '仅远端'}[x['s']]
        lines.append(f"{x['d']} {x['n']} [{s}] 引用{counts.get(x['n'], 0)} —— {zt}")
    return '\n'.join(lines)


ZWSP = '\u200B'


def clean_text(s):
    """格式化一段 AI 文本：去零宽字符/markdown 残留，折叠空白，单个 em dash 规范为 ——。"""
    s = (s or '').replace(ZWSP, '')
    s = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', s)
    s = s.replace('**', '').replace('`', '').replace('#', '')
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'(?<!—)—(?!—)', '——', s)
    return s


def normalize_draft(draft, notes, current):
    """slug 对账 + 格式化。返回 (draft, 需人工关注列表)。"""
    issues = []
    d_month = {x['n']: x['d'][:7] for x in notes}
    known = set(d_month)
    cur_name = {p['key']: p['name'] for p in current.get('phases', [])}

    for p in draft['phases']:
        p['name'] = cur_name.get(p['key'], p['name'])
        p['para'] = clean_text(p.get('para'))
        p['note'] = clean_text(p.get('note'))
        seen, keep, misplaced = set(), [], []
        for it in p.get('items', []):
            slug = it.get('slug', '').strip()
            if slug not in known:
                issues.append(f"[{p['name']}] 未知 slug 已剔除：{slug}")
                continue
            if slug in seen:
                issues.append(f"[{p['name']}] 重复条目已去重：{slug}")
                continue
            seen.add(slug)
            it = {'slug': slug, 'gloss': clean_text(it.get('gloss'))}
            if len(it['gloss']) > 24:
                issues.append(f"[{p['name']}] gloss 超长({len(it['gloss'])}字)需人工改写：{slug}")
            month = d_month[slug]
            if month != p['key']:
                misplaced.append(it)
                continue
            keep.append(it)
        if misplaced:
            by_target = {}
            for it in misplaced:
                by_target.setdefault(d_month[it['slug']], []).append(it)
            for tm, items in by_target.items():
                tgt = next((q for q in draft['phases'] if q['key'] == tm), None)
                moved = [it['slug'] for it in items]
                if tgt is not None:
                    tgt['items'].extend(items)
                    issues.append(f"[{p['name']}] 月份错位已迁移 -> {tgt['name']}：{', '.join(moved)}")
                else:
                    issues.append(f"[{p['name']}] 月份错位且无目标阶段，已丢弃：{', '.join(moved)}")
        p['items'] = sorted(keep, key=lambda it: it['slug'])
        if not 80 <= len(p['para']) <= 160:
            issues.append(f"[{p['name']}] para 长度 {len(p['para'])} 字，超出 80-160，需人工调整")

    for r in draft['regions']:
        r['desc'] = clean_text(r.get('desc'))
        seen = set()
        keep = []
        for it in r.get('items', []):
            slug = it.get('slug', '').strip()
            if slug not in known:
                issues.append(f"[{r['name']}] 未知 slug 已剔除：{slug}")
                continue
            if slug in seen:
                continue
            seen.add(slug)
            keep.append({'slug': slug, 'gloss': clean_text(it.get('gloss'))})
        r['items'] = keep
    return draft, issues


def main():
    apply = '--apply' in sys.argv
    check = '--check' in sys.argv
    data = json.loads(DATA.read_text())
    notes, meta = data['notes'], data['meta']
    current = json.loads(CURRENT.read_text()) if CURRENT.is_file() else {'site': {}, 'glossary': [], 'phases': [], 'regions': []}

    if check or apply:
        if not DRAFT.is_file():
            sys.exit('缺少 content/narrative.draft.json')
        draft = json.loads(DRAFT.read_text())
        draft, issues = normalize_draft(draft, notes, current)
        DRAFT.write_text(json.dumps(draft, ensure_ascii=False, indent=1))
        print(f'== 对账完成：{len(issues)} 条需人工关注 ==')
        for i in issues:
            print('  !', i)
        if not check:
            backup = CURRENT.with_suffix('.json.bak')
            if CURRENT.is_file():
                backup.write_text(CURRENT.read_text())
            CURRENT.write_text(json.dumps(draft, ensure_ascii=False, indent=1))
            print('已套用已对账的草稿（原文件备份为 narrative.json.bak）；记得重跑 tools/build.py')
        return


    counts, zt = {}, {}
    for x in notes:
        for s in x['en']['out']:
            counts[s] = counts.get(s, 0) + 1
        if x['zh']:
            zt[x['n']] = x['zh']['t']
    counts['_zt'] = zt

    by_month = {}
    for x in notes:
        by_month.setdefault(x['d'][:7], []).append(x)

    draft = {'site': current.get('site', {}), 'glossary': current.get('glossary', []), 'phases': [], 'regions': []}
    known = {x['n'] for x in notes}
    report = []

    # 风格基准：取两段人写叙事作 few-shot，锚定"先观点后事实"的人写密度
    human_paras = [p['para'] for p in current.get('phases', []) if p.get('para')]
    style = '\n\n'.join(human_paras[:1] + human_paras[-1:])

    for cur in current.get('phases', []):
        key = cur['key']
        pool = by_month.get(key, [])
        payload = (f"阶段：{key}（现状名：{cur['name']}）\n"
                   f"当月决策 {len(pool)} 条：\n{corpus(pool, counts)}\n\n"
                   f"现状条目：\n{json.dumps(cur, ensure_ascii=False, indent=1)}")
        try:
            out = call_ai(PHASE_TASK, payload, style)
        except (RuntimeError, json.JSONDecodeError) as e:
            print(f'warn: 阶段 {key} AI 失败，保留现状 —— {e}', file=sys.stderr)
            draft['phases'].append(cur)
            report.append((key, '保留现状'))
            continue
        bad = [i['slug'] for i in out.get('items', []) if i['slug'] not in known]
        out['items'] = [i for i in out.get('items', []) if i['slug'] in known]
        draft['phases'].append({'key': key, 'name': cur['name'],
                                'para': out.get('para', ''), 'note': out.get('note', ''),
                                'items': out['items']})
        report.append((key, f"条目 {len(cur['items'])}->{len(out['items'])}" + (f'，剔除未知 slug {bad}' if bad else '')))

    all_arch = [x for x in notes if x['s'] in ('a', 'i', 'r')]
    for cur in current.get('regions', []):
        payload = (f"架构区域：{cur['name']}\n"
                   f"现状条目：\n{json.dumps(cur, ensure_ascii=False, indent=1)}\n\n"
                   f"全部决策清单（可从中补充更承重的条目）：\n{corpus(all_arch, counts)}")
        try:
            out = call_ai(REGION_TASK, payload)
        except (RuntimeError, json.JSONDecodeError) as e:
            print(f'warn: 区域 {cur["name"]} AI 失败，保留现状 —— {e}', file=sys.stderr)
            draft['regions'].append(cur)
            report.append((cur['name'], '保留现状'))
            continue
        bad = [i['slug'] for i in out.get('items', []) if i['slug'] not in known]
        out['items'] = [i for i in out.get('items', []) if i['slug'] in known]
        draft['regions'].append({'name': cur['name'],
                                 'desc': out.get('desc', ''), 'items': out['items']})
        report.append((cur['name'], f"条目 {len(cur['items'])}->{len(out['items'])}" + (f'，剔除未知 slug {bad}' if bad else '')))

    draft, issues = normalize_draft(draft, notes, current)
    DRAFT.write_text(json.dumps(draft, ensure_ascii=False, indent=1))
    print('== AI 草稿生成完毕（已对账）->', DRAFT)
    for i in issues:
        print('  !', i)
    for k, v in report:
        print(f'  {k}: {v}')
    if apply:
        backup = CURRENT.with_suffix('.json.bak')
        if CURRENT.is_file():
            backup.write_text(CURRENT.read_text())
        CURRENT.write_text(json.dumps(draft, ensure_ascii=False, indent=1))
        print('已应用（原文件备份为 narrative.json.bak）；记得重跑 tools/build.py')


if __name__ == '__main__':
    main()
