"""Encode the captured matrix frames into an optimised looping GIF.

Two things do the heavy lifting on file size:

  * one shared palette across every frame — Pillow only delta-encodes a
    frame (storing just the changed bounding box) when consecutive frames
    carry the same palette, and quantising per frame would disable that
  * no dithering — this is flat brand colour, and dither noise would
    scatter changed pixels across the whole field, which is exactly what
    the delta pass is trying to avoid
"""
import json
import os
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
FRAMES = os.path.join(HERE, "frames")
COLORS = int(sys.argv[1]) if len(sys.argv) > 1 else 48
REST_T = int(sys.argv[2]) if len(sys.argv) > 2 else 1800

meta = json.load(open(os.path.join(HERE, "frames.json")))

# Outlook for Windows renders frame 1 of a GIF and never animates. Frame 1
# therefore has to be the fully assembled graph, not the empty grid the
# animation happens to open on. The loop is cyclic, so rotating it costs
# nothing for clients that do animate.
rest_i = next(i for i, m in enumerate(meta) if m["t"] >= REST_T)
meta = meta[rest_i:] + meta[:rest_i]

imgs = [Image.open(os.path.join(FRAMES, f"{m['i']:03d}.png")).convert("RGB") for m in meta]
w, h = imgs[0].size

strip = Image.new("RGB", (w, h * len(imgs)))
for i, im in enumerate(imgs):
    strip.paste(im, (0, i * h))
master = strip.quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT)

frames = [im.quantize(palette=master, dither=Image.Dither.NONE) for im in imgs]
durations = [m["d"] for m in meta]

out = os.path.join(HERE, os.pardir, "fr-matrix.gif")
frames[0].save(out, save_all=True, append_images=frames[1:], duration=durations,
               loop=0, optimize=True, disposal=1)

size = os.path.getsize(out)
print(f"{w}x{h}  {len(frames)} frames in  {COLORS} colors  {sum(durations)}ms  ->  {size/1024:.1f} KB")

rest_png = os.path.join(HERE, os.pardir, "fr-matrix-rest.png")
imgs[0].save(rest_png, optimize=True)
print(f"  frame 1 = assembled rest state (t={meta[0]['t']}ms), rotated from {rest_i}")
print(f"  rest png {os.path.getsize(rest_png)/1024:.1f} KB")
