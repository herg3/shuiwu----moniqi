# -*- coding: utf-8 -*-
"""像素比对：原图 vs 我的渲染。输出总差异率 + 分块热区 + 差异图。"""
import os
import sys
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
REF = os.path.join(ROOT, 'ref', '个税', sys.argv[1] if len(sys.argv)>1 else '00d22c76989edf6e1eff659545e049ed.png')
MINE = os.path.join(ROOT, 'shots', sys.argv[2] if len(sys.argv)>2 else 'mine.png')
OUTDIR = os.path.join(ROOT, 'shots')
os.makedirs(OUTDIR, exist_ok=True)

a = Image.open(REF).convert('RGB')
b = Image.open(MINE).convert('RGB')
if a.size != b.size:
    print('尺寸不一致 ref=%s mine=%s' % (a.size, b.size))
    b = b.resize(a.size)
A = np.asarray(a, dtype=np.int16)
B = np.asarray(b, dtype=np.int16)
D = np.abs(A - B).max(axis=2)
H, W = D.shape

Image.fromarray(D.astype(np.uint8)).save(os.path.join(OUTDIR, 'diff_' + os.path.basename(MINE)))

print('平均通道差 %.2f/255' % D.mean())
print('显著差异像素(>24) 占比 %.2f%%' % ((D > 24).mean() * 100))
print('完全一致像素(<=2) 占比 %.2f%%' % ((D <= 2).mean() * 100))

BS = 96  # 32x32 css
rows = []
for by in range(0, H, BS):
    for bx in range(0, W, BS):
        blk = D[by:by+BS, bx:bx+BS]
        m = blk.mean()
        if m > 5:
            rows.append((m, blk.max(), bx // 3, by // 3))
rows.sort(reverse=True)
print('\n差异热区（32x32css 块，按 mean 降序，最多 28 条）')
for m, mx, cx, cy in rows[:28]:
    print('  css(%4d,%4d) mean=%5.1f max=%3d' % (cx, cy, m, mx))
print('热点块合计 %d / %d' % (len(rows), len(range(0, H, BS)) * len(range(0, W, BS))))

# 分区统计（按视觉区块）
zones = [
    ('状态栏', 0, 54), ('搜索', 54, 103), ('入口卡片', 103, 285),
    ('banner', 285, 390), ('资讯tab', 395, 432), ('资讯卡1', 432, 555),
    ('资讯卡2', 555, 690), ('资讯卡3/空', 690, 770), ('tabbar', 770, 852),
]
print('\n分区平均差')
for name, y0, y1 in zones:
    seg = D[int(y0*3):int(y1*3), :]
    print('  %-10s mean=%5.2f  >24占比=%4.1f%%' % (name, seg.mean(), (seg > 24).mean()*100))
