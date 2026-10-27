#!/usr/bin/env python3
"""提取 DeepSeek Harness architecture 类 Agent Notes 的双语全文。

数据源：
  - 本地 .agents/notes/{archived,implemented}/architecture/（英文原件 + .zh.md 中文副本）
  - 远端 origin/master 上存在而本地缺失的 implemented 笔记（经 git show 读取）

输出 data/arch-notes.json：{notes: [...], weeks: [...], meta: {...}}
重复运行安全；远端不可达时自动退化为仅本地口径。
"""
import json
import re
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], cwd=Path(__file__).parent,
                      capture_output=True, text=True, check=True).stdout.strip()
NOTES = Path(ROOT) / '.agents' / 'notes'
OUT = Path(__file__).resolve().parents[1] / 'data' / 'arch-notes.json'
REMOTE = 'origin/master'

ZH_HEADS = {
    'problem': ['问题', 'Problem'],
    'decision': ['决策', 'Decision'],
    'alts': ['考虑过的替代方案', '曾考虑的替代方案', '备选方案', 'Alternatives considered'],
    'conseq': ['后果', '影响', 'Consequences'],
}


def git(args, check=True):
    return subprocess.run(['git'] + args, cwd=ROOT, capture_output=True, text=True, check=check).stdout


def get_section(text, names):
    m = re.search(r'^## (?:' + '|'.join(names) + r')\s*$(.*?)(?=^## |\Z)', text, re.M | re.S)
    return m.group(1) if m else ''


def clean_line(ln):
    return re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', ln)


def paragraphs(sec):
    """章节正文 -> 段落数组；表格行并为一行（┃ 分隔），列表项保留 · 前缀。"""
    paras, cur = [], []
    for ln in sec.split('\n'):
        s = ln.strip()
        if s.startswith('|'):
            cells = [c.strip() for c in s.strip('|').split('|')]
            if all(re.fullmatch(r':?-{2,}:?', c or '--') for c in cells):
                continue
            if cur:
                paras.append(re.sub(r'\s+', ' ', ' '.join(cur)).strip()); cur = []
            paras.append(' ┃ '.join(clean_line(c) for c in cells))
            continue
        if cur:
            paras.append(re.sub(r'\s+', ' ', ' '.join(cur)).strip()); cur = []
        if not s or s.startswith(('#', '```', '<!--')):
            continue
        paras.append(clean_line(re.sub(r'^[-*]\s+', '· ', s)))
    return [p for p in paras if p]


def parse_alts(sec):
    items, cur = [], None
    for raw in sec.split('\n'):
        s = raw.strip()
        if not s or s.startswith(('<!--', '|', '```')):
            continue
        mh = re.match(r'^###\s+(?:Why not\s+|为什么不选?|为何不选?|为什么不用|为何不用)(.+?)[?？]?\s*$', s)
        mb = re.match(r'^\*\*(.+?)\*\*[.:：—-]?\s*(.*)$', s)
        if re.match(r'^###\s+', s):
            cur = {'n': clean_line(mh.group(1) if mh else re.sub(r'^###\s+', '', s)).strip(), 'w': []}
            items.append(cur)
        elif mb and raw.lstrip().startswith('**'):
            cur = {'n': clean_line(mb.group(1)).strip(), 'w': [clean_line(mb.group(2))] if mb.group(2) else []}
            items.append(cur)
        elif cur is not None:
            t = clean_line(re.sub(r'^[-*]\s+', '', s))
            if t:
                cur['w'].append(t)
    return [{'n': it['n'], 'w': paragraphs('\n'.join(it['w']))} for it in items]


def parse(text):
    title = re.search(r'^# Agent Note: (.+)$', text, re.M)
    ar = re.search(r'^Archived:\s*(\d{4}-\d{2}-\d{2})', text, re.M)
    outs = []
    for mm in re.finditer(r'\]\(([^)]+\.md)\)', text):
        base = mm.group(1).split('/')[-1].replace('.zh.md', '').replace('.md', '')
        m = re.match(r'^\d{4}-\d{2}-\d{2}-(.+)$', base)
        if m and m.group(1) not in outs:
            outs.append(m.group(1))
    return {
        't': title.group(1).strip() if title else '',
        'ar': ar.group(1) if ar else '',
        'p': paragraphs(get_section(text, ZH_HEADS['problem'])),
        'dc': paragraphs(get_section(text, ZH_HEADS['decision'])),
        'alt': parse_alts(get_section(text, ZH_HEADS['alts'])),
        'cs': paragraphs(get_section(text, ZH_HEADS['conseq'])),
        'out': outs[:12],
    }


def list_dir(bucket):
    d = NOTES / bucket / 'architecture'
    if not d.is_dir():
        return []
    return sorted(p.name[:-3] for p in d.glob('*.md') if not p.name.endswith('.zh.md'))


def main():
    arch = list_dir('archived')
    impl_local = list_dir('implemented')

    remote_only = []
    try:
        remote_impl = [l.strip() for l in git(['ls-tree', '-r', REMOTE, '--name-only',
                                               '.agents/notes/implemented/architecture/']).splitlines()
                       if l.strip().endswith('.md') and not l.strip().endswith('.zh.md')]
        remote_names = {l.strip().rsplit('/', 1)[-1][:-3] for l in remote_impl}
        remote_only = sorted(remote_names - set(impl_local))
    except subprocess.CalledProcessError:
        print('warn: 远端 origin/master 不可达，仅使用本地数据', file=sys.stderr)

    def zh_read(path_en):
        p = Path(str(path_en)[:-3] + '.zh.md')
        if p.is_file():
            return parse(p.read_text())
        return None

    def remote_read(rel):
        return git(['show', f'{REMOTE}:{rel}'])

    notes = []
    for slug, status, bucket in ([(s, 'a', 'archived') for s in arch] +
                                 [(s, 'i', 'implemented') for s in impl_local]):
        en_rel = f'.agents/notes/{bucket}/architecture/{slug}.md'
        en = parse((Path(ROOT) / en_rel).read_text())
        notes.append({'d': slug[:10], 'n': slug[11:], 's': status, 'path': en_rel,
                      'en': en, 'zh': zh_read(Path(ROOT) / en_rel)})
    for slug in remote_only:
        base = f'.agents/notes/implemented/architecture/{slug}'
        en = parse(remote_read(base + '.md'))
        try:
            zh = parse(remote_read(base + '.zh.md'))
        except subprocess.CalledProcessError:
            zh = None
        notes.append({'d': slug[:10], 'n': slug[11:], 's': 'r', 'path': base + '.md',
                      'en': en, 'zh': zh if zh and (zh['p'] or zh['dc']) else None})
    notes.sort(key=lambda x: (x['d'], x['n']))
    known = {x['n'] for x in notes}
    for x in notes:
        x['en']['out'] = [s for s in x['en']['out'] if s in known]
        if x['zh']:
            x['zh']['out'] = x['en']['out']

    # 周桶（周一为界，从最早一条所在周的周一开始）
    dates = sorted(x['d'] for x in notes)
    first = date.fromisoformat(dates[0])
    week0 = first - timedelta(days=first.weekday())
    weeks = []
    for x in notes:
        wk = (date.fromisoformat(x['d']) - week0).days // 7
        while len(weeks) <= wk:
            weeks.append({'p': 0, 's': 0})
        weeks[wk]['p'] += 1
    seals = {}
    for x in notes:
        if x['en']['ar']:
            seals[x['en']['ar']] = seals.get(x['en']['ar'], 0) + 1
    for d, c in seals.items():
        wk = (date.fromisoformat(d) - week0).days // 7
        while len(weeks) <= wk:
            weeks.append({'p': 0, 's': 0})
        weeks[wk]['s'] += c

    all_archived = sum(len(list((NOTES / 'archived' / b).glob('*.md'))) - len(list((NOTES / 'archived' / b).glob('*.zh.md')))
                       for b in [p.name for p in (NOTES / 'archived').iterdir() if p.is_dir()])
    all_active = sum(len(list((NOTES / 'implemented' / b).glob('*.md'))) - len(list((NOTES / 'implemented' / b).glob('*.zh.md')))
                     for b in [p.name for p in (NOTES / 'implemented').iterdir() if p.is_dir()])
    local_impl_dates = [x['d'] for x in notes if x['s'] == 'i']
    try:
        remote_head = git(['log', '-1', '--format=%as', REMOTE]).strip()
    except subprocess.CalledProcessError:
        remote_head = max(dates)
    meta = {
        'first': dates[0],
        'last': dates[-1],
        'weekStart': week0.isoformat(),
        'remoteHead': remote_head,
        'localImplLatest': max(local_impl_dates) if local_impl_dates else dates[0],
        'total': len(notes),
        'archived': sum(1 for x in notes if x['s'] == 'a'),
        'active': sum(1 for x in notes if x['s'] != 'a'),
        'remoteOnly': sum(1 for x in notes if x['s'] == 'r'),
        'zhCount': sum(1 for x in notes if x['zh']),
        'sweeps': [{'date': d, 'count': c} for d, c in sorted(seals.items()) if c >= 10],
        'allClasses': {'archived': all_archived, 'active': all_active},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({'notes': notes, 'weeks': weeks, 'meta': meta}, ensure_ascii=False))
    print(f'notes={len(notes)} zh={meta["zhCount"]} archived={meta["archived"]} active={meta["active"]} '
          f'remoteOnly={meta["remoteOnly"]} weeks={len(weeks)} -> {OUT}')


if __name__ == '__main__':
    main()
