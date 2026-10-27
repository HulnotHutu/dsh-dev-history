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
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
DATA = HERE / 'data' / 'arch-notes.json'
CURRENT = HERE / 'content' / 'narrative.json'
DRAFT = HERE / 'content' / 'narrative.draft.json'
AI = Path.home() / 'scripts' / 'aihelpme.sh'

PHASE_TASK = ('你是「架构决策编年」站的编辑。根据当月决策清单（日期/slug/中文标题/状态/被引用数）'
              '与该月现状文案，重写这个阶段的 narrative 条目。只输出一个 JSON 对象，不要多余文字。')
REGION_TASK = ('你是「架构决策编年」站的编辑。根据架构区域的现状描述、精选条目与全量决策清单，'
               '重写该区域的 narrative 条目。只输出一个 JSON 对象，不要多余文字。')
RULES = """硬约束：
1. name：4-6 字阶段名；desc/para：80-160 字中文，只用清单与现状里存在的事实，不得出现任何篇数/百分比数字（页面另行显示）。
2. items：6-12 条；slug 必须逐字来自候选清单；gloss 为不超过 24 字的中文一句话；除明显错误外保留现有条目，可少量增删。
3. note：仅当给定"大扫除提示"时保留并润色，否则为空字符串。
4. desc/para 中不要出现 markdown 标记。"""


def call_ai(task, payload):
    """调 aihelpme.sh：任务指令作 argv，数据走 stdin。"""
    prompt = RULES + '\n\n' + payload
    r = subprocess.run(
        ['bash', '-c', 'source ~/.zshrc >/dev/null 2>&1; exec "$HOME/scripts/aihelpme.sh" "$1"', 'bash', task],
        input=prompt, text=True, capture_output=True, timeout=240)
    if r.returncode != 0:
        raise RuntimeError(f'AI 调用失败: {r.stderr.strip()[:200]}')
    text = r.stdout.strip()
    fence = re.search(r'```(?:json)?\s*(\{[\s\S]*\})\s*```', text)
    if fence:
        text = fence.group(1)
    start = text.find('{')
    end = text.rfind('}')
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


def main():
    apply = '--apply' in sys.argv
    if apply and DRAFT.is_file():
        draft = json.loads(DRAFT.read_text())
        backup = CURRENT.with_suffix('.json.bak')
        if CURRENT.is_file():
            backup.write_text(CURRENT.read_text())
        CURRENT.write_text(json.dumps(draft, ensure_ascii=False, indent=1))
        print('已套用已评审的草稿（原文件备份为 narrative.json.bak）；记得重跑 tools/build.py')
        return
    data = json.loads(DATA.read_text())
    notes, meta = data['notes'], data['meta']
    current = json.loads(CURRENT.read_text()) if CURRENT.is_file() else {'site': {}, 'glossary': [], 'phases': [], 'regions': []}

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

    for cur in current.get('phases', []):
        key = cur['key']
        pool = by_month.get(key, [])
        payload = (f"阶段：{key}（现状名：{cur['name']}）\n"
                   f"当月决策 {len(pool)} 条：\n{corpus(pool, counts)}\n\n"
                   f"现状条目：\n{json.dumps(cur, ensure_ascii=False, indent=1)}")
        try:
            out = call_ai(PHASE_TASK, payload)
        except (RuntimeError, json.JSONDecodeError) as e:
            print(f'warn: 阶段 {key} AI 失败，保留现状 —— {e}', file=sys.stderr)
            draft['phases'].append(cur)
            report.append((key, '保留现状'))
            continue
        bad = [i['slug'] for i in out.get('items', []) if i['slug'] not in known]
        out['items'] = [i for i in out.get('items', []) if i['slug'] in known]
        draft['phases'].append({'key': key, 'name': out.get('name', cur['name']),
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
        draft['regions'].append({'name': out.get('name', cur['name']),
                                 'desc': out.get('desc', ''), 'items': out['items']})
        report.append((cur['name'], f"条目 {len(cur['items'])}->{len(out['items'])}" + (f'，剔除未知 slug {bad}' if bad else '')))

    DRAFT.write_text(json.dumps(draft, ensure_ascii=False, indent=1))
    print('== AI 草稿生成完毕 ->', DRAFT)
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
