#!/usr/bin/env python3
"""把 data/arch-notes.json 与 content/narrative.md 组装为站点数据。

产物：
  site/js/data.js      英文全文（window.DSH_ARCH）
  site/js/data.zh.js   中文全文（window.DSH_ARCH_ZH，按 slug 索引）
  site/js/content.js   编辑性内容（window.DSH_ARCH_CONTENT）——由 content/narrative.md 编译
同时刷新 index.html 里静态资源的 ?v= 版本参数，避免浏览器缓存旧数据。
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
SRC = HERE / 'data' / 'arch-notes.json'
NARRATIVE = HERE / 'content' / 'narrative.md'
SITE = HERE / 'site'

ITEM_RE = re.compile(r'^- ([a-z0-9-]+): (.*)$')
GLOSSARY_RE = re.compile(r'^- \*\*(.+?)\*\*：(.*)$')
PHASE_HEAD_RE = re.compile(r'^## (\d{4}-\d{2})\s+(.+)$')


def parse_narrative(text):
    """content/narrative.md -> {site, glossary, phases, regions}

    约定：`# 站点` 内为 `键: 值`；`# 体例` 内为 `- **术语**：解释`；
    `# 阶段`/`# 架构区域` 内 `## 条目标题` 引导一个条目，条目正文为叙事段落，
    `重点：` 之后的 `- slug: 注释` 列表为精选决策；`大扫除：` 之后为提示段。
    """
    site, glossary, phases, regions = {}, [], [], []
    section = None
    entry = None
    mode = 'para'
    for raw in text.split('\n'):
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.startswith('# ') and not line.startswith('## '):
            section = line[2:].strip()
            entry = None
            continue
        if section == '站点':
            m = re.match(r'^([^：:]+)：(.*)$|^(.+?): (.*)$', line)
            if m:
                k, v = (m.group(1) or m.group(3), (m.group(2) or m.group(4)))
                site[k.strip()] = v.strip()
            continue
        if section == '体例':
            m = GLOSSARY_RE.match(line)
            if m:
                glossary.append({'term': m.group(1), 'body': m.group(2)})
            continue
        if line.startswith('## '):
            if section == '阶段':
                m = PHASE_HEAD_RE.match(line)
                entry = {'key': m.group(1), 'name': m.group(2), 'para': [], 'note': [], 'items': []}
                phases.append(entry)
            else:
                entry = {'name': line[3:].strip(), 'desc': [], 'items': []}
                regions.append(entry)
            mode = 'para'
            continue
        if entry is None:
            continue
        if line.strip() in ('重点：', '大扫除：'):
            mode = 'items' if line.strip() == '重点：' else 'note'
            continue
        item = ITEM_RE.match(line)
        if item and mode in ('items', 'para') and entry is not None and 'items' in entry:
            if mode == 'note':
                entry['note'].append(line)
            else:
                entry['items'].append({'slug': item.group(1), 'gloss': item.group(2)})
                mode = 'items'
            continue
        if section == '阶段':
            (entry['note'] if mode == 'note' else entry['para']).append(line)
        else:
            entry['desc'].append(line)
    return {'site': site, 'glossary': glossary, 'phases': phases, 'regions': regions}


def main():
    if not SRC.is_file():
        sys.exit('缺少 data/arch-notes.json，请先运行 tools/extract.py')
    data = json.loads(SRC.read_text())
    notes, weeks, meta = data['notes'], data['weeks'], data['meta']

    en, zh = [], {}
    for x in notes:
        e = x['en']
        en.append({'d': x['d'], 'n': x['n'], 's': x['s'], 'ar': e['ar'], 'path': x['path'],
                   't': e['t'], 'p': e['p'], 'dc': e['dc'], 'alt': e['alt'], 'cs': e['cs'], 'out': e['out']})
        if x['zh']:
            z = x['zh']
            zh[x['n']] = {'t': z['t'], 'p': z['p'], 'dc': z['dc'], 'alt': z['alt'], 'cs': z['cs']}
    meta['zhCount'] = len(zh)

    content = parse_narrative(NARRATIVE.read_text()) if NARRATIVE.is_file() else {
        'site': {}, 'glossary': [], 'phases': [], 'regions': []}

    payload = {'notes': en, 'weeks': weeks, 'meta': meta}
    (SITE / 'js' / 'data.js').write_text(
        '/* 由 tools/build.py 生成；英文全文，源：.agents/notes/{archived,implemented}/architecture */\n'
        'window.DSH_ARCH = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    (SITE / 'js' / 'data.zh.js').write_text(
        '/* 由 tools/build.py 生成；中文全文，源：各笔记的 .zh.md 维护副本 */\n'
        'window.DSH_ARCH_ZH = ' + json.dumps(zh, ensure_ascii=False, separators=(',', ':')) + ';\n')
    (SITE / 'js' / 'content.js').write_text(
        '/* 由 tools/build.py 生成；编辑性内容，源：content/narrative.md */\n'
        'window.DSH_ARCH_CONTENT = ' + json.dumps(content, ensure_ascii=False, separators=(',', ':')) + ';\n')

    stamp = datetime.now().strftime('%Y%m%d%H%M')
    index = SITE / 'index.html'
    html = index.read_text()
    html = re.sub(r'(\.(?:css|js))\?v=\d+', r'\1?v=' + stamp, html)
    index.write_text(html)
    print(f'data.js {len(en)} 条 | data.zh.js {len(zh)} 条 | content: 阶段 {len(content["phases"])} '
          f'区域 {len(content["regions"])} | ?v={stamp}')


if __name__ == '__main__':
    main()
