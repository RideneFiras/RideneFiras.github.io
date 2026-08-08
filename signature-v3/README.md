# Email signature v3 — "matrix"

Built from scratch. Nothing here comes from the portfolio's design system —
no Archivo, no Sidi Bou blue, no brass, no dot grid, no `FR·` mark.

`signature/` (v1) and `signature-v2/` are untouched.

## Files

| file | what it is |
|---|---|
| `signature.html` | the signature block to paste into a mail client |
| `preview.html` | open locally to see the block and the panel |
| `fr-matrix.gif` | the animation, 260×260, displayed at 130 — **40.4 KB** |
| `fr-matrix-rest.png` | the resting frame, static — 1.4 KB |
| `signature-preview.png` | the whole card rendered, static |
| `source/` | animation source + capture/encode scripts |

## The idea

An LED dot-matrix panel. The resting glyph is a terminal prompt — a chevron
and a block cursor — drawn in dots, and the cursor blinks the way a real one
does. Periodically a scanline of light sweeps the panel, bowing slightly as
it travels so it reads as a wave rather than a ruler sliding across. Cells
brighten from unlit through lime to white at the leading edge, then trail off
behind it.

It's hardware, not a logo. No letterforms, no initials, no claims — so there
is nothing to redesign if the rest of your brand ever moves.

## Palette

Built for this, not imported.

| | |
|---|---|
| panel | `#08080b` |
| unlit cell | `#16171c` |
| accent | `#ccff2e` |
| name | `#f5f6f8` |
| role | `#7a7d87` |
| rule | `#23252c` |

Type is a modern grotesk for the name (tight tracking, weight 600) against a
monospace for everything else — uppercase and widely tracked for the role,
plain for the links, with `/` separators.

## Two things worth knowing

**The card background is the same `#08080b` as the GIF's own background**, so
the image has no visible edge — the panel reads as part of the card rather
than a picture sitting on it. If you change the card colour, change the GIF's
`--bg` in `source/matrix.html` and re-render, or the seam will appear.

**Outlook for Windows never animates GIFs** — it renders frame 1 and stops. The
loop is rotated to begin on the resting prompt, so Outlook shows the glyph
with the cursor lit. `encode.py` does the rotation.

**Dark-mode clients** may try to invert the card. A GIF cannot be inverted, so
a client that recolours the surrounding table will break the seam. If that
matters more than the look, v1 in `signature/` is the light-background option.

## Rebuilding

```
cd source
npm install puppeteer-core
node capture.js              # frame-exact PNGs via headless Chromium
python encode.py 48 1800     # 48 colours, rotate to rest at t=1800ms
```

`matrix.html` exposes `seek(ms)` and `framePlan()`. Nothing uses CSS animation,
so every frame is captured deterministically. The glyph is written as ASCII art
in the source (`#` lit, `C` cursor) so the shape is legible and easy to redraw.
Set `CHROME_PATH` if your Chromium lives elsewhere.

40.4 KB for 39 frames is possible because the sweep is a narrow vertical band —
Pillow stores one changed bounding box per frame, and a radial ripple would
have made that box the whole canvas on every frame.
