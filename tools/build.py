#!/usr/bin/env python3
"""把 data/arch-notes.json 与 content/narrative.json 组装为站点数据。

产物：
  site/js/data.js      英文全文（window.DSH_ARCH）
  site/js/data.zh.js   中文全文（window.DSH_ARCH_ZH，按 slug 索引）
  site/js/content.js   编辑性内容（window.DSH_ARCH_CONTENT）——透传自 content/narrative.json
同时刷新 index.html 里静态资源的 ?v= 版本参数，避免浏览器缓存旧数据。
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
SRC = HERE / 'data' / 'arch-notes.json'
NARRATIVE = HERE / 'content' / 'narrative.json'
SITE = HERE / 'site'


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

    content = json.loads(NARRATIVE.read_text()) if NARRATIVE.is_file() else {
        'site': {}, 'glossary': [], 'phases': [], 'regions': []}
    for section in ('site', 'glossary', 'phases', 'regions'):
        if section not in content:
            sys.exit(f'content/narrative.json 缺少 {section} 章节')

    payload = {'notes': en, 'weeks': weeks, 'meta': meta}
    (SITE / 'js' / 'data.js').write_text(
        '/* 由 tools/build.py 生成；英文全文，源：.agents/notes/{archived,implemented}/architecture */\n'
        'window.DSH_ARCH = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    (SITE / 'js' / 'data.zh.js').write_text(
        '/* 由 tools/build.py 生成；中文全文，源：各笔记的 .zh.md 维护副本 */\n'
        'window.DSH_ARCH_ZH = ' + json.dumps(zh, ensure_ascii=False, separators=(',', ':')) + ';\n')
    (SITE / 'js' / 'content.js').write_text(
        '/* 由 tools/build.py 生成；编辑性内容，源：content/narrative.json */\n'
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
