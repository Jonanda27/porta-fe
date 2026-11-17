import os

BRAND_DIR = r"c:\Users\Geocitra1\Documents\Github\PORTA\apps\web\public\brand"
os.makedirs(BRAND_DIR, exist_ok=True)

# Official Brand Palette
COLOR_EMERALD = "#0B241E"   # Deep Maritime Emerald / Authority Green
COLOR_AMBER   = "#D97706"   # Sovereign Gold / Amber Maritime Beacon
COLOR_WHITE   = "#FFFFFF"   # Pure Crisp White
COLOR_BLACK   = "#000000"   # Deep Monochrome Black
COLOR_SLATE   = "#64748B"   # Cool Grey

# -------------------------------------------------------------------------
# BESPOKE OUTLINED WORDMARK FOR 'PORTA'
# Pure vector curves, zero live <text> tags
# Height = 64px, Width = 336px
# -------------------------------------------------------------------------
def get_porta_wordmark_paths(offset_x, offset_y):
    """
    Returns outlined SVG path data for 'PORTA'.
    Starts at (offset_x, offset_y). Total width = 336, height = 64.
    """
    paths = []
    
    # 1. P (width 52)
    px, py = offset_x, offset_y
    paths.append(f"""
      <path fill-rule="evenodd" d="
        M {px},{py}
        L {px+36},{py}
        A 21,21 0 0,1 {px+52},{py+21}
        A 21,21 0 0,1 {px+36},{py+42}
        L {px+14},{py+42}
        L {px+14},{py+64}
        L {px},{py+64}
        Z
        M {px+14},{py+14}
        L {px+34},{py+14}
        A 7,7 0 0,1 {px+38},{py+21}
        A 7,7 0 0,1 {px+34},{py+28}
        L {px+14},{py+28}
        Z" />""")
        
    # 2. O (width 64)
    ox = offset_x + 66
    paths.append(f"""
      <path fill-rule="evenodd" d="
        M {ox+32},{py}
        A 32,32 0 0,1 {ox+64},{py+32}
        A 32,32 0 0,1 {ox+32},{py+64}
        A 32,32 0 0,1 {ox},{py+32}
        A 32,32 0 0,1 {ox+32},{py}
        Z
        M {ox+32},{py+14}
        A 18,18 0 0,1 {ox+50},{py+32}
        A 18,18 0 0,1 {ox+32},{py+50}
        A 18,18 0 0,1 {ox+14},{py+32}
        A 18,18 0 0,1 {ox+32},{py+14}
        Z" />""")
        
    # 3. R (width 54)
    rx = offset_x + 144
    paths.append(f"""
      <path fill-rule="evenodd" d="
        M {rx},{py}
        L {rx+36},{py}
        A 20,20 0 0,1 {rx+52},{py+20}
        A 20,20 0 0,1 {rx+36},{py+40}
        L {rx+26},{py+40}
        L {rx+50},{py+64}
        L {rx+32},{py+64}
        L {rx+14},{py+44}
        L {rx+14},{py+64}
        L {rx},{py+64}
        Z
        M {rx+14},{py+14}
        L {rx+34},{py+14}
        A 6,6 0 0,1 {rx+38},{py+20}
        A 6,6 0 0,1 {rx+34},{py+26}
        L {rx+14},{py+26}
        Z" />""")
        
    # 4. T (width 52)
    tx = offset_x + 212
    paths.append(f"""
      <path d="
        M {tx},{py}
        L {tx+52},{py}
        L {tx+52},{py+14}
        L {tx+33},{py+14}
        L {tx+33},{py+64}
        L {tx+19},{py+64}
        L {tx+19},{py+14}
        L {tx},{py+14}
        Z" />""")
        
    # 5. A (width 58)
    ax = offset_x + 278
    paths.append(f"""
      <path fill-rule="evenodd" d="
        M {ax+29},{py}
        L {ax+58},{py+64}
        L {ax+42},{py+64}
        L {ax+35},{py+48}
        L {ax+23},{py+48}
        L {ax+16},{py+64}
        L {ax},{py+64}
        Z
        M {ax+29},{py+16}
        L {ax+32},{py+36}
        L {ax+26},{py+36}
        Z" />""")
        
    return "".join(paths)


# -------------------------------------------------------------------------
# CONCEPT B SYMBOL GEOMETRY
# -------------------------------------------------------------------------
def get_anchor_symbol_inner(color_primary, color_accent):
    """
    Returns inner SVG nodes for Concept B symbol (256x256 viewBox).
    """
    return f"""
  <!-- Shank & Crown Ring -->
  <path fill-rule="evenodd" fill="{color_primary}" d="
    M 116,84
    L 116,168
    L 140,168
    L 140,84
    Z
    M 128,36
    A 24,24 0 0,1 152,60
    A 24,24 0 0,1 128,84
    A 24,24 0 0,1 104,60
    A 24,24 0 0,1 128,36
    Z
    M 128,48
    A 12,12 0 0,1 140,60
    A 12,12 0 0,1 128,72
    A 12,12 0 0,1 116,60
    A 12,12 0 0,1 128,48
    Z" />
  <!-- Anchor Base Arc & Flukes -->
  <path fill="{color_primary}" d="
    M 44,140
    L 68,140
    L 68,160
    A 60,60 0 0,0 116,212
    L 116,220
    L 140,220
    L 140,212
    A 60,60 0 0,0 188,160
    L 188,140
    L 212,140
    L 212,164
    A 84,84 0 0,1 140,224
    L 116,224
    A 84,84 0 0,1 44,164
    Z" />
  <!-- Fluke Arrowheads -->
  <polygon fill="{color_primary}" points="44,144 68,120 68,144" />
  <polygon fill="{color_primary}" points="212,144 188,120 188,144" />
  <!-- Stock / Beacon Crossbar -->
  <polygon fill="{color_accent}" points="68,96 188,96 198,106 188,116 68,116 58,106" />
  <!-- Center Star / SOLAS Diamond -->
  <polygon fill="#0B241E" points="128,96 138,106 128,116 118,106" />"""


# -------------------------------------------------------------------------
# GENERATE PRODUCTION SUITE
# -------------------------------------------------------------------------

# 1. symbol.svg (Official primary)
svg_symbol = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>PORTA Official Symbol</title>
  {get_anchor_symbol_inner(COLOR_EMERALD, COLOR_AMBER)}
</svg>"""

# 2. symbol-white.svg (Inverted on dark)
svg_symbol_white = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>PORTA Symbol - White Variant</title>
  {get_anchor_symbol_inner(COLOR_WHITE, COLOR_AMBER)}
</svg>"""

# 3. symbol-monochrome-black.svg
svg_symbol_mono_black = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>PORTA Symbol - Monochrome Black</title>
  {get_anchor_symbol_inner(COLOR_BLACK, COLOR_BLACK)}
</svg>"""

# 4. symbol-monochrome-white.svg
svg_symbol_mono_white = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>PORTA Symbol - Monochrome White</title>
  {get_anchor_symbol_inner(COLOR_WHITE, COLOR_WHITE)}
</svg>"""

# 5. lockup-horizontal.svg (Official primary horizontal lockup)
svg_lockup_horizontal = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 256" width="768" height="256">
  <title>PORTA Official Horizontal Lockup</title>
  <!-- Symbol scaled to 160x160 at x=112, y=48 -->
  <g transform="translate(112, 48) scale(0.625)">
    {get_anchor_symbol_inner(COLOR_EMERALD, COLOR_AMBER)}
  </g>
  <!-- Outlined Wordmark (Emerald) -->
  <g fill="{COLOR_EMERALD}">
    {get_porta_wordmark_paths(320, 96)}
  </g>
</svg>"""

# 6. lockup-horizontal-white.svg (For dark headers / dark mode)
svg_lockup_horizontal_white = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 256" width="768" height="256">
  <title>PORTA Horizontal Lockup - White</title>
  <g transform="translate(112, 48) scale(0.625)">
    {get_anchor_symbol_inner(COLOR_WHITE, COLOR_AMBER)}
  </g>
  <g fill="{COLOR_WHITE}">
    {get_porta_wordmark_paths(320, 96)}
  </g>
</svg>"""

# 7. lockup-horizontal-monochrome-black.svg
svg_lockup_horizontal_mono_black = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 256" width="768" height="256">
  <title>PORTA Horizontal Lockup - Monochrome Black</title>
  <g transform="translate(112, 48) scale(0.625)">
    {get_anchor_symbol_inner(COLOR_BLACK, COLOR_BLACK)}
  </g>
  <g fill="{COLOR_BLACK}">
    {get_porta_wordmark_paths(320, 96)}
  </g>
</svg>"""

# 8. lockup-horizontal-monochrome-white.svg
svg_lockup_horizontal_mono_white = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 256" width="768" height="256">
  <title>PORTA Horizontal Lockup - Monochrome White</title>
  <g transform="translate(112, 48) scale(0.625)">
    {get_anchor_symbol_inner(COLOR_WHITE, COLOR_WHITE)}
  </g>
  <g fill="{COLOR_WHITE}">
    {get_porta_wordmark_paths(320, 96)}
  </g>
</svg>"""

# 9. lockup-stacked.svg (512x512 square centered lockup)
# Symbol: width 180 (scale 0.703125), x=(512-180)/2=166, y=118
# Wordmark: width 336, height 64, x=(512-336)/2=88, y=330
svg_lockup_stacked = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <title>PORTA Official Stacked Lockup</title>
  <g transform="translate(166, 118) scale(0.703125)">
    {get_anchor_symbol_inner(COLOR_EMERALD, COLOR_AMBER)}
  </g>
  <g fill="{COLOR_EMERALD}">
    {get_porta_wordmark_paths(88, 330)}
  </g>
</svg>"""

# 10. lockup-stacked-white.svg
svg_lockup_stacked_white = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <title>PORTA Stacked Lockup - White</title>
  <g transform="translate(166, 118) scale(0.703125)">
    {get_anchor_symbol_inner(COLOR_WHITE, COLOR_AMBER)}
  </g>
  <g fill="{COLOR_WHITE}">
    {get_porta_wordmark_paths(88, 330)}
  </g>
</svg>"""

# 11. favicon.svg (Tight square SVG for browser tabs)
svg_favicon = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>PORTA Favicon</title>
  {get_anchor_symbol_inner(COLOR_EMERALD, COLOR_AMBER)}
</svg>"""

# 12. app-icon-tile.svg (App Icon tile with brand green background)
svg_app_icon = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <title>PORTA App Icon</title>
  <rect width="512" height="512" rx="114" fill="{COLOR_EMERALD}" />
  <g transform="translate(102, 102) scale(1.203125)">
    {get_anchor_symbol_inner(COLOR_WHITE, COLOR_AMBER)}
  </g>
</svg>"""

# Write all SVGs
files = {
    "symbol.svg": svg_symbol,
    "symbol-white.svg": svg_symbol_white,
    "symbol-monochrome-black.svg": svg_symbol_mono_black,
    "symbol-monochrome-white.svg": svg_symbol_mono_white,
    "lockup-horizontal.svg": svg_lockup_horizontal,
    "lockup-horizontal-white.svg": svg_lockup_horizontal_white,
    "lockup-horizontal-monochrome-black.svg": svg_lockup_horizontal_mono_black,
    "lockup-horizontal-monochrome-white.svg": svg_lockup_horizontal_mono_white,
    "lockup-stacked.svg": svg_lockup_stacked,
    "lockup-stacked-white.svg": svg_lockup_stacked_white,
    "favicon.svg": svg_favicon,
    "app-icon-tile.svg": svg_app_icon,
}

for filename, content in files.items():
    filepath = os.path.join(BRAND_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Generated brand asset: {filename}")

print("Brand kit SVGs generated successfully!")
