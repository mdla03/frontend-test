"""Draw the plain-language Spaces architecture diagram.

Icon-led rather than box-led: each stop is a drawn glyph with a label under it,
so the eye reads the journey rather than a stack of rectangles. Tiers are named
with the vocabulary a non-technical audience already has - frontend, API,
backend - with a footnote on where that naming is loose.

Everything is laid out in design units and rendered at SS times that size, then
downsampled, because PIL draws aliased edges at 1x.
"""

from PIL import Image, ImageDraw, ImageFont

W, H, SS = 1800, 1180, 3

BG = "#fbf8ff"
INK = "#171a2d"
SOFT = "#3d4a3f"
FAINT = "#7c8a84"
GREEN = "#006d37"
MID = "#00a758"
LINE = "#c9d6c9"
AMBER = "#9a7b12"

F = "/System/Library/Fonts/Supplemental/Arial.ttf"
FB = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FM = "/System/Library/Fonts/Menlo.ttc"

img = Image.new("RGB", (W * SS, H * SS), BG)
d = ImageDraw.Draw(img)


def font(path, size):
    return ImageFont.truetype(path, size * SS)


f_title = font(FB, 44)
f_sub = font(F, 23)
f_tier = font(FB, 31)
f_tier_sub = font(F, 20)
f_tech = font(FM, 15)
f_icon_lbl = font(FB, 21)
f_icon_cap = font(F, 17)
f_edge = font(F, 19)
f_note = font(F, 18)
f_foot = font(F, 16)


# ---- SS-aware primitives (all callers work in design units) --------------

def _s(seq):
    return [v * SS for v in seq]


def text(xy, s, fnt, fill):
    d.text((xy[0] * SS, xy[1] * SS), s, font=fnt, fill=fill)


def ctext(cx, y, s, fnt, fill):
    d.text((cx * SS - d.textlength(s, font=fnt) / 2, y * SS), s, font=fnt, fill=fill)


def line(pts, fill, w=2):
    d.line(_s(pts), fill=fill, width=w * SS)


def arc(box, a0, a1, fill, w=2):
    d.arc(_s(box), a0, a1, fill=fill, width=w * SS)


def ellipse(box, fill=None, outline=None, w=2):
    d.ellipse(_s(box), fill=fill, outline=outline, width=w * SS)


def rrect(box, r, fill=None, outline=None, w=2):
    d.rounded_rectangle(_s(box), radius=r * SS, fill=fill, outline=outline, width=w * SS)


def poly(pts, fill=None, outline=None, w=2):
    flat = []
    for p in pts:
        flat += [p[0] * SS, p[1] * SS]
    d.polygon(flat, fill=fill, outline=outline, width=w * SS)


# ---- icons: drawn, not boxed --------------------------------------------

def ic_screens(cx, cy, c=GREEN):
    rrect([cx - 34, cy - 26, cx + 34, cy + 16], 5, outline=c, w=3)
    line([cx - 24, cy - 14, cx + 16, cy - 14], c, 2)
    line([cx - 24, cy - 4, cx + 6, cy - 4], c, 2)
    line([cx - 24, cy + 6, cx + 16, cy + 6], c, 2)
    line([cx, cy + 16, cx, cy + 26], c, 3)
    line([cx - 16, cy + 27, cx + 16, cy + 27], c, 4)


def ic_doorman(cx, cy, c=GREEN):
    poly([(cx, cy - 30), (cx + 26, cy - 18), (cx + 26, cy + 4),
          (cx, cy + 30), (cx - 26, cy + 4), (cx - 26, cy - 18)], outline=c, w=3)
    line([cx - 11, cy - 1, cx - 3, cy + 9], c, 4)
    line([cx - 3, cy + 9, cx + 13, cy - 11], c, 4)


def ic_pass(cx, cy, c=GREEN):
    rrect([cx - 34, cy - 23, cx + 34, cy + 23], 5, outline=c, w=3)
    ellipse([cx - 24, cy - 13, cx - 6, cy + 5], outline=c, w=3)
    arc([cx - 29, cy - 1, cx - 1, cy + 25], 200, 340, c, 3)
    line([cx + 6, cy - 8, cx + 25, cy - 8], c, 3)
    line([cx + 6, cy + 2, cx + 25, cy + 2], c, 3)
    line([cx + 6, cy + 12, cx + 17, cy + 12], c, 3)


def ic_key(cx, cy, c=GREEN):
    ellipse([cx - 32, cy - 14, cx - 4, cy + 14], outline=c, w=3)
    ellipse([cx - 22, cy - 4, cx - 14, cy + 4], fill=c)
    line([cx - 5, cy, cx + 32, cy], c, 3)
    line([cx + 16, cy, cx + 16, cy + 13], c, 3)
    line([cx + 28, cy, cx + 28, cy + 10], c, 3)


def ic_person(cx, cy, c=GREEN):
    ellipse([cx - 13, cy - 28, cx + 13, cy - 2], outline=c, w=3)
    arc([cx - 27, cy + 2, cx + 27, cy + 50], 180, 360, c, 3)
    line([cx - 27, cy + 26, cx - 27, cy + 30], c, 3)
    line([cx + 27, cy + 26, cx + 27, cy + 30], c, 3)


def ic_lock(cx, cy, c=GREEN):
    arc([cx - 17, cy - 30, cx + 17, cy + 2], 180, 360, c, 3)
    rrect([cx - 25, cy - 8, cx + 25, cy + 28], 5, outline=c, w=3)
    ellipse([cx - 5, cy + 4, cx + 5, cy + 14], fill=c)
    line([cx, cy + 12, cx, cy + 20], c, 3)


def ic_owner(cx, cy, c=GREEN):
    poly([(cx - 24, cy - 28), (cx + 10, cy - 28), (cx + 24, cy - 14),
          (cx + 24, cy + 28), (cx - 24, cy + 28)], outline=c, w=3)
    line([cx + 10, cy - 28, cx + 10, cy - 14], c, 3)
    line([cx + 10, cy - 14, cx + 24, cy - 14], c, 3)
    line([cx - 13, cy + 6, cx - 5, cy + 15], c, 4)
    line([cx - 5, cy + 15, cx + 14, cy - 5], c, 4)


def ic_database(cx, cy, c=GREEN):
    ellipse([cx - 28, cy - 30, cx + 28, cy - 12], outline=c, w=3)
    line([cx - 28, cy - 21, cx - 28, cy + 21], c, 3)
    line([cx + 28, cy - 21, cx + 28, cy + 21], c, 3)
    arc([cx - 28, cy - 12, cx + 28, cy + 6], 0, 180, c, 3)
    arc([cx - 28, cy + 6, cx + 28, cy + 24], 0, 180, c, 3)
    arc([cx - 28, cy + 12, cx + 28, cy + 30], 0, 180, c, 3)


def ic_pin(cx, cy, c=GREEN):
    arc([cx - 24, cy - 32, cx + 24, cy + 16], 160, 20, c, 3)
    line([cx - 22, cy - 1, cx, cy + 30], c, 3)
    line([cx + 22, cy - 1, cx, cy + 30], c, 3)
    ellipse([cx - 9, cy - 17, cx + 9, cy + 1], outline=c, w=3)


def ic_chart(cx, cy, c=GREEN):
    line([cx - 28, cy + 26, cx + 30, cy + 26], c, 3)
    rrect([cx - 22, cy + 2, cx - 8, cy + 26], 2, outline=c, w=3)
    rrect([cx - 3, cy - 16, cx + 11, cy + 26], 2, outline=c, w=3)
    rrect([cx + 16, cy - 30, cx + 30, cy + 26], 2, outline=c, w=3)


def chevron(x, cy, c=MID):
    line([x, cy - 9, x + 9, cy], c, 3)
    line([x + 9, cy, x, cy + 9], c, 3)


def arrow_down(x, y0, y1, c=GREEN, w=3):
    line([x, y0, x, y1 - 11], c, w)
    poly([(x - 8, y1 - 13), (x + 8, y1 - 13), (x, y1)], fill=c)


def stop(cx, cy, icon, label, caption):
    icon(cx, cy)
    ctext(cx, cy + 46, label, f_icon_lbl, INK)
    ctext(cx, cy + 74, caption, f_icon_cap, SOFT)


def tier(y, name, what, tech):
    text((70, y), name, f_tier, GREEN)
    text((70, y + 40), what, f_tier_sub, SOFT)
    text((70, y + 70), tech, f_tech, FAINT)


# ---- header -------------------------------------------------------------
text((70, 46), "How Spaces Works", f_title, INK)
text((72, 102), "Every action travels through the same three stops, in the same order.", f_sub, SOFT)
line([70, 152, W - 70, 152], LINE, 2)

COLS3 = (700, 1080, 1460)
COLS4 = (640, 900, 1160, 1420)
ARROW_X = 1080

# ---- 1. frontend --------------------------------------------------------
tier(206, "1.  FRONTEND", "The app people use", "React  ·  Vite  ·  Leaflet maps")
stop(COLS3[0], 250, ic_screens, "The screens", "Browse, join, run, approve")
stop(COLS3[1], 250, ic_doorman, "The doorman", "Shows only your pages")
stop(COLS3[2], 250, ic_pass, "Your sign-in pass", "Sent with every request")
chevron(COLS3[0] + 150, 250)
chevron(COLS3[1] + 150, 250)

arrow_down(ARROW_X, 372, 436)
text((ARROW_X + 24, 386), "The app asks for something, and shows the pass", f_edge, GREEN)

line([70, 462, W - 70, 462], LINE, 1)

# ---- 2. api -------------------------------------------------------------
tier(496, "2.  API", "The rules - our own server", "Express  ·  Node  ·  sign-in passes")
stop(COLS4[0], 556, ic_key, "Is the pass real?", "Forged or expired: no entry")
stop(COLS4[1], 556, ic_person, "Who are you today?", "Role looked up fresh")
stop(COLS4[2], 556, ic_lock, "Are you allowed?", "Each role can do different things")
stop(COLS4[3], 556, ic_owner, "Is it yours?", "Only your own event")
for c in COLS4[:-1]:
    chevron(c + 112, 556)

line([70, 688, 78, 688 + 52], AMBER, 3)
text((100, 688), "All four checks happen here, on our server - never on the person's device, where they could be edited.", f_note, INK)
text((100, 714), "This is what makes an approval or an attendance record trustworthy.", f_note, SOFT)

arrow_down(ARROW_X, 776, 840)
text((ARROW_X + 24, 790), "Only once every check passes does it reach the records", f_edge, GREEN)

line([70, 866, W - 70, 866], LINE, 1)

# ---- 3. backend ---------------------------------------------------------
tier(900, "3.  BACKEND", "The records - one copy of what is true", "Supabase Postgres  ·  PostGIS")
stop(COLS3[0], 960, ic_database, "What we store", "People, events, sign-ups, rewards")
stop(COLS3[1], 960, ic_pin, "Events near you", "Works out what is close by")
stop(COLS3[2], 960, ic_chart, "Totals", "Rewards, sign-ups, leaderboard")

# ---- footnote -----------------------------------------------------------
line([70, 1096, W - 70, 1096], LINE, 1)
text((70, 1114), "Developers call stops 2 and 3 together \"the backend\" - they are split here so each part's job is visible. "
                 "The app never reaches the records directly.", f_foot, FAINT)

img.resize((W, H), Image.LANCZOS).save(
    "/Users/mark03/Developer/personal-projects/frontend/docs/architecture-diagram-simple.png")
print("saved")
