import os
import math

CONCEPTS_DIR = r"c:\Users\Geocitra1\Documents\Github\PORTA\apps\web\public\brand\concepts"
os.makedirs(CONCEPTS_DIR, exist_ok=True)

COLOR_EMERALD = "#0B241E"  # Deep Maritime Emerald / Authority Green
COLOR_AMBER   = "#D97706"  # Sovereign Gold / Amber Maritime Beacon
COLOR_BLUE    = "#0284C7"  # Pelabuhan Bahari / Ocean Blue

# -------------------------------------------------------------------------
# BESPOKE PURE VECTOR WORDMARK FOR 'PORTA'
# Letter Height = 64px, Baseline y = 64
# -------------------------------------------------------------------------
def get_porta_wordmark_paths(offset_x, offset_y):
    """
    Returns pure vector paths for 'PORTA' starting at (offset_x, offset_y).
    Height = 64px. Total width = 336px.
    Zero text tags, 100% outlined pure geometric vector paths.
    """
    paths = []
    
    # 1. Letter P: x from offset_x to offset_x + 52
    px = offset_x
    py = offset_y
    paths.append(f"""
      <!-- P -->
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
        Z" />
    """)
    
    # 2. Letter O: x from offset_x + 66 to offset_x + 130 (width 64)
    ox = offset_x + 66
    paths.append(f"""
      <!-- O -->
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
        Z" />
    """)
    
    # 3. Letter R: x from offset_x + 144 to offset_x + 198 (width 54)
    rx = offset_x + 144
    paths.append(f"""
      <!-- R -->
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
        Z" />
    """)
    
    # 4. Letter T: x from offset_x + 212 to offset_x + 264 (width 52)
    tx = offset_x + 212
    paths.append(f"""
      <!-- T -->
      <path d="
        M {tx},{py}
        L {tx+52},{py}
        L {tx+52},{py+14}
        L {tx+33},{py+14}
        L {tx+33},{py+64}
        L {tx+19},{py+64}
        L {tx+19},{py+14}
        L {tx},{py+14}
        Z" />
    """)
    
    # 5. Letter A: x from offset_x + 278 to offset_x + 336 (width 58)
    ax = offset_x + 278
    paths.append(f"""
      <!-- A -->
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
        Z" />
    """)
    
    return "\n".join(paths)


# -------------------------------------------------------------------------
# CONCEPT A: THE MARITIME GATEWAY P
# Monogram P: Architectural Quay Pier & Harbor Gateway + Golden Fairway Prow
# -------------------------------------------------------------------------
def build_concept_a_symbol():
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>PORTA - Concept A: The Maritime Gateway P</title>
  <!-- Architectural Gateway P (Emerald) -->
  <path fill-rule="evenodd" fill="{COLOR_EMERALD}" d="
    M 44,38
    L 156,38
    A 56,56 0 0,1 212,94
    A 56,56 0 0,1 156,150
    L 96,150
    L 96,218
    L 44,218
    Z
    M 96,76
    L 150,76
    A 18,18 0 0,1 168,94
    A 18,18 0 0,1 150,112
    L 96,112
    Z" />
  <!-- Golden Fairway Keel / Horizon Beam (Amber, 45° clean angle) -->
  <path fill="{COLOR_AMBER}" d="
    M 104,182
    L 184,182
    L 212,210
    L 104,210
    Z" />
</svg>"""

def build_concept_a_lockup():
    wordmark = get_porta_wordmark_paths(320, 96)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 256" width="768" height="256">
  <title>PORTA Lockup - Concept A</title>
  <!-- Symbol scaled to 160x160 at x=112, y=48 (balanced margins: L112, R112) -->
  <g transform="translate(112, 48) scale(0.625)">
    <path fill-rule="evenodd" fill="{COLOR_EMERALD}" d="
      M 44,38
      L 156,38
      A 56,56 0 0,1 212,94
      A 56,56 0 0,1 156,150
      L 96,150
      L 96,218
      L 44,218
      Z
      M 96,76
      L 150,76
      A 18,18 0 0,1 168,94
      A 18,18 0 0,1 150,112
      L 96,112
      Z" />
    <path fill="{COLOR_AMBER}" d="
      M 104,182
      L 184,182
      L 212,210
      L 104,210
      Z" />
  </g>
  <!-- Outlined Wordmark (Emerald) -->
  <g fill="{COLOR_EMERALD}">
    {wordmark}
  </g>
</svg>"""


# -------------------------------------------------------------------------
# CONCEPT B: THE SOVEREIGN ANCHOR & BEACON
# Authority Emblem: Anchor of Governance, SOLAS Beacon & PP 35/2023 Shield
# -------------------------------------------------------------------------
def build_concept_b_symbol():
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>PORTA - Concept B: The Sovereign Anchor &amp; Beacon</title>
  <!-- Shank & Crown Ring (Emerald) -->
  <path fill-rule="evenodd" fill="{COLOR_EMERALD}" d="
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
  <!-- Anchor Base Arc & Flukes (Emerald) -->
  <path fill="{COLOR_EMERALD}" d="
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
  <!-- Fluke Arrowheads (45° clean angles) -->
  <polygon fill="{COLOR_EMERALD}" points="44,144 68,120 68,144" />
  <polygon fill="{COLOR_EMERALD}" points="212,144 188,120 188,144" />
  <!-- Crossbar / Beacon (Amber, 45° chamfered ends) -->
  <polygon fill="{COLOR_AMBER}" points="68,96 188,96 198,106 188,116 68,116 58,106" />
  <!-- Compass Star / Solas Diamond (Center) -->
  <polygon fill="{COLOR_EMERALD}" points="128,96 138,106 128,116 118,106" />
</svg>"""

def build_concept_b_lockup():
    wordmark = get_porta_wordmark_paths(320, 96)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 256" width="768" height="256">
  <title>PORTA Lockup - Concept B</title>
  <!-- Symbol scaled to 160x160 at x=112, y=48 (balanced margins: L112, R112) -->
  <g transform="translate(112, 48) scale(0.625)">
    <!-- Shank & Ring -->
    <path fill-rule="evenodd" fill="{COLOR_EMERALD}" d="
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
    <!-- Base Arc -->
    <path fill="{COLOR_EMERALD}" d="
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
    <polygon fill="{COLOR_EMERALD}" points="44,144 68,120 68,144" />
    <polygon fill="{COLOR_EMERALD}" points="212,144 188,120 188,144" />
    <!-- Stock -->
    <polygon fill="{COLOR_AMBER}" points="68,96 188,96 198,106 188,116 68,116 58,106" />
    <polygon fill="{COLOR_EMERALD}" points="128,96 138,106 128,116 118,106" />
  </g>
  <!-- Outlined Wordmark (Emerald) -->
  <g fill="{COLOR_EMERALD}">
    {wordmark}
  </g>
</svg>"""


# -------------------------------------------------------------------------
# CONCEPT C: THE HARBOR CURRENT
# Modern Geometric Fluid Ribbon: Outer Sea Breakwater + Cargo Inward Loop
# -------------------------------------------------------------------------
def build_concept_c_symbol():
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>PORTA - Concept C: The Harbor Current</title>
  <!-- Upper Breakwater Arch (Emerald, P Loop) centered: x from 39 to 217 -->
  <path fill="{COLOR_EMERALD}" d="
    M 39,108
    L 39,74
    A 36,36 0 0,1 75,38
    L 163,38
    A 54,54 0 0,1 217,92
    A 54,54 0 0,1 163,146
    L 97,146
    L 97,118
    L 163,118
    A 26,26 0 0,0 189,92
    A 26,26 0 0,0 163,66
    L 75,66
    A 8,8 0 0,0 67,74
    L 67,108
    Z" />
  <!-- Approach Navigation Channel (Ocean Blue, Vertical Pillar) -->
  <rect x="39" y="122" width="28" height="96" rx="8" fill="{COLOR_BLUE}" />
  <!-- Inward Cargo Loop / Revenue Current (Amber, Turning Basin) -->
  <path fill="{COLOR_AMBER}" d="
    M 97,160
    L 167,160
    A 28,28 0 0,1 195,188
    A 28,28 0 0,1 167,216
    L 97,216
    A 8,8 0 0,1 89,208
    L 89,168
    A 8,8 0 0,1 97,160
    Z" />
</svg>"""

def build_concept_c_lockup():
    wordmark = get_porta_wordmark_paths(320, 96)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 256" width="768" height="256">
  <title>PORTA Lockup - Concept C</title>
  <!-- Symbol scaled to 160x160 at x=112, y=48 (balanced margins: L112, R112) -->
  <g transform="translate(112, 48) scale(0.625)">
    <!-- Upper Breakwater Arch -->
    <path fill="{COLOR_EMERALD}" d="
      M 39,108
      L 39,74
      A 36,36 0 0,1 75,38
      L 163,38
      A 54,54 0 0,1 217,92
      A 54,54 0 0,1 163,146
      L 97,146
      L 97,118
      L 163,118
      A 26,26 0 0,0 189,92
      A 26,26 0 0,0 163,66
      L 75,66
      A 8,8 0 0,0 67,74
      L 67,108
      Z" />
    <!-- Approach Channel -->
    <rect x="39" y="122" width="28" height="96" rx="8" fill="{COLOR_BLUE}" />
    <!-- Inward Cargo Loop -->
    <path fill="{COLOR_AMBER}" d="
      M 97,160
      L 167,160
      A 28,28 0 0,1 195,188
      A 28,28 0 0,1 167,216
      L 97,216
      A 8,8 0 0,1 89,208
      L 89,168
      A 8,8 0 0,1 97,160
      Z" />
  </g>
  <!-- Outlined Wordmark (Emerald) -->
  <g fill="{COLOR_EMERALD}">
    {wordmark}
  </g>
</svg>"""


# Write all files
files = {
    "concept-a-symbol.svg": build_concept_a_symbol(),
    "concept-a-lockup.svg": build_concept_a_lockup(),
    "concept-b-symbol.svg": build_concept_b_symbol(),
    "concept-b-lockup.svg": build_concept_b_lockup(),
    "concept-c-symbol.svg": build_concept_c_symbol(),
    "concept-c-lockup.svg": build_concept_c_lockup(),
}

for name, content in files.items():
    path = os.path.join(CONCEPTS_DIR, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Generated: {name}")

print("All concepts generated successfully!")
