# -*- coding: utf-8 -*-
"""对 ref 与 mine 做同样的文字 bbox 测量，输出并排对比。"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
A = np.asarray(Image.open(os.path.join(ROOT,'ref','个税','00d22c76989edf6e1eff659545e049ed.png')).convert('RGB'), dtype=np.int16)
B = np.asarray(Image.open(os.path.join(ROOT,'shots','mine.png')).convert('RGB'), dtype=np.int16)

def bbox(img, x0,x1,y0,y1, bg=(255,255,255), thr=45):
    """返回该区域内「与bg差异>thr」像素的 bbox（css 单位）"""
    sub = img[int(y0*3):int(y1*3), int(x0*3):int(x1*3)]
    d = np.abs(sub - np.array(bg, dtype=np.int16)).max(axis=2)
    m = d > thr
    if not m.any(): return None
    ys, xs = np.nonzero(m)
    return (x0+xs.min()/3, y0+ys.min()/3, x0+xs.max()/3, y0+ys.max()/3)

CASES = [
    ('卡片1标题行1', 20, 120, 158, 175),
    ('卡片1副标行1', 20, 120, 196, 210),
    ('tabs整行',     12, 300, 405, 424, (244,246,249)),
    ('资讯1标题行1', 25, 200, 455, 473),
    ('资讯1日期',    25, 130, 522, 538),
    ('资讯3标题行1',185, 360, 720, 738),
    ('tabbar文字',    40, 350, 806, 820),
]
print('%-14s %-26s %-26s %s' % ('区域','ref bbox(css)','mine bbox(css)','Δw/Δx'))
for name, x0,x1,y0,y1,*rest in CASES:
    bg = rest[0] if rest else (255,255,255)
    ra = bbox(A, x0,x1,y0,y1, bg)
    rb = bbox(B, x0,x1,y0,y1, bg)
    fmt = lambda t: 'x%.1f-%.1f y%.1f-%.1f' % (t[0], t[2], t[1], t[3]) if t else 'none'
    if ra and rb:
        dw = (rb[2]-rb[0]) - (ra[2]-ra[0])
        dx = rb[0]-ra[0]; dy = rb[1]-ra[1]
        extra = 'Δw=%+.1f Δx=%+.1f Δy=%+.1f' % (dw, dx, dy)
    else:
        extra = ''
    print('%-14s %-26s %-26s %s' % (name, fmt(ra), fmt(rb), extra))
