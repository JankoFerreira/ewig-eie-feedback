"""Generates src/styles/theme-dark.css from the main site's stylesheets.

Rules (applied only under html[data-theme=dark]):
  backgrounds  light -> deep charcoal-green, keeping order (white cards stay lighter than the page)
  text         dark  -> ivory, muted greys stay muted
  borders      light -> dark hairlines, translucent dark lines -> translucent light lines
Photos, translucent overlays on photos, paper invitations and the design demos are left alone.
Run:  python3 tools/dark-theme.py   (needs: pip install tinycss2)
"""
import colorsys, re, pathlib, tinycss2

ROOT = pathlib.Path(__file__).resolve().parents[1] / 'src' / 'styles'
FILES = ['global', 'hero-refresh', 'footer-brand', 'site-polish', 'editorial-refresh', 'interactions', 'story-motion', 'quote-builder',
         'minimal-home', 'hero-finale', 'personalize-preview', 'story-portal', 'mobile-impact', 'refinements', 'page-flow', 'plans']
# Things that are printed paper or photographs in real life keep their light look.
EXCLUDE = re.compile(r'home-cover|minimal-|showcase|preview-personalize|preview-palette|preview-open|preview-browser|lx-|hero-invitation|preview-screen|preview-rsvp|preview-details|envelope|wax|seal|ribbon|story-portal-card|portal-card|paper-card|whatsapp|status-|\.ee-|swatch')
NAMED = {'white': (255, 255, 255, 1.0), 'black': (0, 0, 0, 1.0)}

def parse_color(tok):
    if tok.type == 'hash':
        h = tok.value
        if len(h) in (3, 4): h = ''.join(c * 2 for c in h)
        if len(h) not in (6, 8) or not re.fullmatch(r'[0-9a-fA-F]+', h): return None
        r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4)); a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return (r, g, b, a)
    if tok.type == 'ident' and tok.lower_value in NAMED: return NAMED[tok.lower_value]
    if tok.type == 'function' and tok.lower_name in ('rgb', 'rgba'):
        nums = [t for t in tok.arguments if t.type in ('number', 'percentage')]
        if len(nums) < 3: return None
        vals = [n.value * 2.55 if n.type == 'percentage' else n.value for n in nums[:3]]
        a = 1.0
        if len(nums) > 3: a = nums[3].value / 100 if nums[3].type == 'percentage' else nums[3].value
        return (*[int(round(v)) for v in vals], float(a))
    return None

def hls(c): r, g, b, a = c; h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255); return h, l, s, a
def out(h, l, s, a):
    r, g, b = colorsys.hls_to_rgb(h, max(0, min(1, l)), max(0, min(1, s)))
    hx = '#%02x%02x%02x' % (round(r * 255), round(g * 255), round(b * 255))
    return hx if a >= .999 else hx + '%02x' % round(a * 255)

BRAND_H = colorsys.rgb_to_hls(0x12 / 255, 0x15 / 255, 0x13 / 255)[0]

def map_color(c, role):
    h, l, s, a = hls(c)
    if s > .25 and l < .8 and role != 'fg': return None   # gold, sage and other accents keep their colour
    if role == 'bg':
        if a < .5: return None                      # overlays and tints on photos
        if l >= .55: return out(BRAND_H, max(.045, min(.14, .08 + (l - .95) * .8)), .08, a)
        return None                                 # mid and dark backgrounds already work
    if role == 'fg':
        if l < .5: return out(h, .93 - l * .55, s * .6, a)
        return None
    if role == 'border':
        if l > .6 and a < .5: return None
        if l >= .55: return out(BRAND_H, .22, .06, a)
        if l < .45: return out(h, .88, s * .4, a)
        return None

def role_of(prop):
    if prop.startswith('background'): return 'bg'
    if prop in ('color', 'fill', 'stroke', 'caret-color', 'text-decoration-color', 'accent-color', 'column-rule-color'): return 'fg'
    if prop.startswith('border') or prop.startswith('outline'): return 'border'
    return None

VAR_ROLES = {'--cream': 'bg', '--paper': 'bg', '--ink': 'fg', '--sage': None, '--dark': None}

def convert_value(tokens, role):
    changed = False; parts = []
    for tok in tokens:
        c = parse_color(tok)
        if c is not None:
            m = map_color(c, role)
            if m: parts.append(m); changed = True; continue
        if tok.type == 'function' and tok.lower_name not in ('rgb', 'rgba', 'url', 'var'):
            inner, ch = convert_value(tok.arguments, role)
            if ch: parts.append(f'{tok.name}({inner})'); changed = True; continue
        parts.append(tok.serialize())
    return ''.join(parts), changed

def prefix(sel):
    sel = sel.strip()
    if sel.startswith(':root'): return 'html[data-theme=dark]' + sel[5:]
    if sel == 'html' or sel.startswith('html '): return 'html[data-theme=dark]' + sel[4:]
    return 'html[data-theme=dark] ' + sel

def rules(nodes, indent=''):
    lines = []
    for node in nodes:
        if node.type == 'qualified-rule':
            sel = tinycss2.serialize(node.prelude).strip()
            sels = [s for s in split_top(sel) if not EXCLUDE.search(s)]
            if not sels: continue
            decls = []
            for d in tinycss2.parse_declaration_list(node.content, skip_whitespace=True, skip_comments=True):
                if d.type != 'declaration': continue
                role = VAR_ROLES.get(d.lower_name) if d.lower_name.startswith('--') else role_of(d.lower_name)
                if not role: continue
                v, ch = convert_value(d.value, role)
                if ch: decls.append(f'{d.lower_name}:{v.strip()}{"!important" if d.important else ""}')
            if decls: lines.append(f"{indent}{','.join(prefix(s) for s in sels)}{{{';'.join(decls)}}}")
        elif node.type == 'at-rule' and node.lower_at_keyword in ('media', 'supports') and node.content:
            inner = rules(tinycss2.parse_rule_list(node.content, skip_whitespace=True, skip_comments=True), indent + '  ')
            if inner: lines.append(f"@{node.at_keyword}{tinycss2.serialize(node.prelude)}{{"); lines += inner; lines.append('}')
    return lines

def split_top(sel):
    out_, depth, cur = [], 0, ''
    for ch in sel:
        if ch in '([': depth += 1
        if ch in ')]': depth -= 1
        if ch == ',' and depth == 0: out_.append(cur); cur = ''
        else: cur += ch
    out_.append(cur); return [s.strip() for s in out_ if s.strip()]

body = []
for name in FILES:
    sheet = tinycss2.parse_stylesheet((ROOT / f'{name}.css').read_text(encoding='utf-8'), skip_whitespace=True, skip_comments=True)
    r = rules(sheet)
    if r: body.append(f'/* from {name}.css */'); body += r
head = '/* GENERATED by tools/dark-theme.py from the light stylesheets. Do not edit by hand: change the generator or theme-dark-tuning.css. */\n'
head += 'html[data-theme=dark]{color-scheme:dark;background:#121513}\n'
(ROOT / 'theme-dark.css').write_text(head + '\n'.join(body) + '\n', encoding='utf-8')
print('rules', sum(1 for l in body if '{' in l))
