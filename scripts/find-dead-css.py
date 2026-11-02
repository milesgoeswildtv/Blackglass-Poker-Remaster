#!/usr/bin/env python3
# Usage: python3 scripts/find-dead-css.py . [report|apply]
# Re-run after UI work; review the report before using "apply", then confirm with the browser suites.
"""Report (and optionally remove) CSS selectors that can never match because a class in them
never appears in the app source. Conservative: dynamic template prefixes count as used, and
selectors containing functional pseudo-classes are always kept."""
import re,glob,sys,os,json
ROOT=sys.argv[1]; MODE=sys.argv[2] if len(sys.argv)>2 else 'report'
src=''
for f in glob.glob(ROOT+'/src/**/*.js*',recursive=True)+glob.glob(ROOT+'/worker/*.js')+[ROOT+'/index.html']:
    src+=open(f,errors='ignore').read()+'\n'
words=set(re.findall(r'[A-Za-z_][\w-]*',src))
prefixes=set(re.findall(r'([A-Za-z_][\w-]{2,})\$\{',src))
def used(cls):
    if cls in words: return True
    return any(cls.startswith(p) for p in prefixes)
def sel_dead(sel):
    if re.search(r':(is|where|has|not|nth-child\(.*of)\(',sel): return False
    for c in re.findall(r'\.([A-Za-z_][\w-]*)',sel):
        if not used(c): return True
    return False
def process(css):
    out=[];i=0;dead_sel=0;dead_rules=0
    pat=re.compile(r'([^{}]+)\{([^{}]*)\}')
    def fix(block):
        nonlocal dead_sel,dead_rules
        def rep(m):
            nonlocal dead_sel,dead_rules
            head=m.group(1)
            lead=re.match(r'\s*',head).group(0); sels_raw=head.strip()
            if sels_raw.startswith('@') or re.match(r'^(from|to|\d+%)',sels_raw): return m.group(0)
            parts=[p for p in re.split(r',(?![^()]*\))',sels_raw)]
            keep=[p for p in parts if not sel_dead(p.strip())]
            dead_sel+=len(parts)-len(keep)
            if len(keep)==len(parts): return m.group(0)
            if not keep: dead_rules+=1; return lead
            return lead+','.join(keep)+'{'+m.group(2)+'}'
        return pat.sub(rep,block)
    # handle nested @media blocks one level deep
    res=re.sub(r'(@media[^{]+\{)((?:[^{}]*\{[^{}]*\})*\s*)\}',lambda m:(m.group(1)+fix(m.group(2))+'}') ,css)
    # top-level rules outside media: apply fix only to segments not inside @media
    pieces=re.split(r'(@media[^{]+\{(?:[^{}]*\{[^{}]*\})*\s*\})',res)
    res=''.join(p if p.startswith('@media') else fix(p) for p in pieces)
    res=re.sub(r'@media[^{]+\{\s*\}','',res)
    return res,dead_sel,dead_rules
report={}
for f in sorted(glob.glob(ROOT+'/src/*.css')):
    css=open(f).read()
    new,ds,dr=process(css)
    report[os.path.basename(f)]={'dead_selectors':ds,'dead_rules':dr,'bytes_before':len(css),'bytes_after':len(new)}
    if MODE=='apply' and new!=css: open(f,'w').write(new)
print(json.dumps({k:v for k,v in report.items() if v['dead_selectors']},indent=0))
