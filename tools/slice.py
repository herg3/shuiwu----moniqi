# -*- coding: utf-8 -*-
"""从官方截图切出素材：入口图标(彩alpha)、banner、新闻插图、tabbar 图标(黑alpha)。
坐标全部为 1179x2556 @3x 原始像素。"""
import os
from collections import deque
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), '..', 'ref', '个税',
                   '00d22c76989edf6e1eff659545e049ed.png')
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(OUT, exist_ok=True)
im = Image.open(SRC).convert('RGB')


def color_alpha(box, name, tol=14, pad=0):
    """彩色图标抠图：从四边 flood fill 去掉连通的背景，保留内部图形。"""
    x0, y0, x1, y1 = box
    c = im.crop((x0, y0, x1, y1)).convert('RGBA')
    w, h = c.size
    px = c.load()
    refs = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1],
            px[w // 2, 0], px[w // 2, h - 1], px[0, h // 2], px[w - 1, h // 2]]

    def isbg(p):
        return any(max(abs(p[i] - r[i]) for i in range(3)) <= tol for r in refs)

    seen = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if seen[y][x]:
            continue
        seen[y][x] = True
        if isbg(px[x, y]):
            px[x, y] = (0, 0, 0, 0)
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx]:
                    q.append((nx, ny))
    c.save(os.path.join(OUT, name))
    return c.size


def luma_alpha(box, name, pad=5):
    """单色图标：保留原色 + 由亮度差生成 alpha（背景透掉）。
    不用 CSS mask —— headless Chromium 下 mask 合成不可靠。"""
    x0, y0, x1, y1 = box
    c = im.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    rgb = c.load()
    g = c.convert('L')
    w, h = g.size
    p = g.load()
    border = []
    for x in range(w):
        border += [p[x, 0], p[x, h - 1]]
    for y in range(h):
        border += [p[0, y], p[w - 1, y]]
    border.sort()
    bg = border[len(border) // 2]
    mn = min(p[x, y] for x in range(w) for y in range(h))
    if bg - mn < 8:
        bg = 255
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    op = out.load()
    span = max(1, bg - mn)
    for y in range(h):
        for x in range(w):
            a = int(max(0, min(255, (bg - p[x, y]) / span * 255)))
            if a:
                r, gg, b = rgb[x, y]
                op[x, y] = (r, gg, b, a)
    out.save(os.path.join(OUT, name))
    return out.size


def find_bbox(xlo, xhi, ylo, yhi, tol=22):
    """在区域内找「非背景」包围盒，背景取该窗口四角中位色。"""
    win = im.crop((xlo, ylo, xhi, yhi))
    w, h = win.size
    p = win.load()
    corners = [p[2, 2], p[w - 3, 2], p[2, h - 3], p[w - 3, h - 3]]
    refs = [tuple(sorted(c[i] for c in corners)[1] for i in range(3))]

    def isbg(c):
        return max(abs(c[i] - refs[0][i]) for i in range(3)) <= tol

    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if not isbg(p[x, y]):
                xs.append(x); ys.append(y)
    if not xs:
        return None
    return (xlo + min(xs), ylo + min(ys), xlo + max(xs) + 1, ylo + max(ys) + 1)


log = []
# --- 入口卡片图标：先找 bbox，再外扩 8px 做 alpha 抠图 ---
for i, (xlo, xhi) in enumerate([(45, 200), (385, 540), (725, 880), (1065, 1179)], 1):
    bb = find_bbox(xlo, xhi, 348, 472)
    log.append('icon%d bbox=%s' % (i, bb))
    if bb:
        x0, y0, x1, y1 = bb
        log.append('  icon%d size=%s' % (i, color_alpha((x0 - 8, y0 - 8, x1 + 8, y1 + 8),
                                                         'icon%d.png' % i)))

# --- banner ---
bx = (38, 873, 1141, 1153)
im.crop(bx).save(os.path.join(OUT, 'banner.png'))
log.append('banner %dx%d' % im.crop(bx).size)

# --- 新闻插图（右侧区域，上下各超 12px，由卡片 overflow 裁掉）---
# 卡1/卡2 是左文右图；卡3 是左图右文，插图贴卡片左边
for i, (bx0, by0, bx1, by1) in enumerate(
        [(610, 1298, 1141, 1664), (610, 1688, 1141, 2062), (38, 2088, 490, 2320)], 1):
    c = im.crop((bx0, by0, bx1, by1))
    c.save(os.path.join(OUT, 'news%d.png' % i))
    log.append('news%d %dx%d' % (i, c.size[0], c.size[1]))

# --- tabbar 图标 ---
tabs = [('home', 178, 243), ('todo', 367, 432), ('office', 556, 621),
        ('msg', 746, 811), ('me', 935, 1000)]
for name, x0, x1 in tabs:
    log.append('tab-%s %s' % (name, luma_alpha((x0, 2342, x1, 2406), 'tab-%s.png' % name)))

print('\n'.join(str(x) for x in log))
