#!/usr/bin/env python3
"""
art.py - ASCII Art Animation Generator: Cute Teddy Bear Holding a Glowing Heart
================================================================================
Renders a 9:16 vertical video (1080x1920) at 30 fps (20 seconds, 600 frames).

Visual Elements:
- Black cosmic background with twinkling dot stars and 4-point sparkle stars.
- Cute teddy bear sculpted from mathematical shapes (circles, ellipses) and
  rendered in textured ASCII characters (" .:-=+*#%@" and "oaex$8&").
- Warm brown/tan fur palette with lighter muzzle/inner ears, shiny eyes, and bow.
- Glowing red/pink ASCII heart held in the bear's paws with a soft radial aura.
- 12-second bloom animation with smooth easing (heart -> paws -> body -> head -> ears -> face -> bow).
- 8-second idle loop with heartbeat pulse (1.0 -> 1.08), 2-degree sway, and floating mini hearts.
- Monospace HUD bar with live updating telemetry (bloom %, sway °, active letter count).
- Syntax-highlighted code editor panel with vertical auto-scroll and blinking cursor.

Requirements:
    pip install numpy pillow imageio imageio-ffmpeg
"""

import math
import os
import re
import sys
import time
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio.v2 as imageio


# =============================================================================
# CONSTANTS & CONFIGURATION
# =============================================================================
CANVAS_WIDTH = 1080
CANVAS_HEIGHT = 1920
FPS = 30
DURATION_SEC = 20
TOTAL_FRAMES = FPS * DURATION_SEC  # 600 frames
BLOOM_FRAMES = 360                 # 12 seconds @ 30 fps
OUTPUT_FILENAME = "art.mp4"

# Layout bounds
ASCII_TOP = 30
ASCII_BOTTOM = 1205
HUD_TOP = 1205
HUD_BOTTOM = 1290
EDITOR_TOP = 1290
EDITOR_BOTTOM = 1920

# ASCII grid configuration (Top 65% area)
COLS = 82
ROWS = 58
CELL_W = 12
CELL_H = 20
GRID_X0 = (CANVAS_WIDTH - COLS * CELL_W) // 2  # 48 px margin
GRID_Y0 = 36

# Coordinate space mapping for mathematical shapes
CENTER_X = CANVAS_WIDTH / 2.0                 # 540.0
CENTER_Y = GRID_Y0 + (ROWS * CELL_H) / 2.0 + 8.0  # ~624.0
SCENE_SCALE = 470.0                           # Radius scale factor

# Colors
BG_COLOR = (10, 11, 16)
EDITOR_BG = (17, 18, 26)
EDITOR_HEADER_BG = (23, 25, 36)
BORDER_COLOR = (36, 40, 56)
HUD_BG = (13, 14, 21)


# =============================================================================
# FONT INITIALIZATION
# =============================================================================
def load_monospace_font(size: int) -> ImageFont.ImageFont:
    """Load a crisp monospace font with multiple cross-platform fallbacks."""
    candidate_paths = [
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Supplemental/Courier New.ttf",
        "/Library/Fonts/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "DejaVuSansMono.ttf",
        "Courier New.ttf",
    ]
    for path in candidate_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    try:
        return ImageFont.truetype("Courier", size)
    except Exception:
        return ImageFont.load_default()


FONT_ASCII = load_monospace_font(15)
FONT_CODE = load_monospace_font(20)
FONT_HUD = load_monospace_font(18)
FONT_HUD_SM = load_monospace_font(15)


# =============================================================================
# BACKGROUND STARS & SPARKLES
# =============================================================================
class StarField:
    """Manages twinkling background stars and shimmering 4-point sparkle stars."""

    def __init__(self, count: int = 70, sparkle_count: int = 8, seed: int = 42):
        rng = np.random.RandomState(seed)
        self.dots = []
        for _ in range(count):
            x = rng.uniform(30, CANVAS_WIDTH - 30)
            y = rng.uniform(35, ASCII_BOTTOM - 30)
            # Avoid placing too many stars inside the center bear region
            nx = (x - CENTER_X) / SCENE_SCALE
            ny = (y - CENTER_Y) / SCENE_SCALE
            if (nx / 0.5)**2 + ((ny + 0.1) / 0.7)**2 < 0.6 and rng.rand() > 0.15:
                continue
            freq = rng.uniform(1.2, 4.0)
            phase = rng.uniform(0, 2 * math.pi)
            brightness = rng.uniform(0.5, 1.0)
            self.dots.append((x, y, freq, phase, brightness))

        # 4-point sparkle stars
        self.sparkles = []
        sparkle_coords = [
            (120, 150), (960, 180), (160, 480), (920, 520),
            (200, 880), (890, 850), (110, 1080), (950, 1060)
        ]
        for idx, (sx, sy) in enumerate(sparkle_coords):
            freq = 1.0 + (idx % 4) * 0.4
            phase = idx * 1.1
            self.sparkles.append((sx, sy, freq, phase))

    def render(self, draw: ImageDraw.ImageDraw, t: float):
        # Render twinkling dots
        for x, y, freq, phase, base_br in self.dots:
            val = 0.25 + 0.75 * (0.5 + 0.5 * math.sin(t * freq + phase))
            val *= base_br
            if val > 0.2:
                r = int(180 * val)
                g = int(205 * val)
                b = int(255 * val)
                draw.point((x, y), fill=(r, g, b))
                if val > 0.85:
                    draw.point((x + 1, y), fill=(r, g, b))
                    draw.point((x, y + 1), fill=(r, g, b))

        # Render 4-point diamond sparkle stars
        for sx, sy, freq, phase in self.sparkles:
            wave = math.sin(t * freq + phase)
            sparkle_val = max(0.0, wave)**3.0
            if sparkle_val > 0.08:
                arm_len = int(3 + 8 * sparkle_val)
                core_col = (int(240 * sparkle_val), int(245 * sparkle_val), 255)
                dim_col = (int(130 * sparkle_val), int(150 * sparkle_val), int(220 * sparkle_val))

                # Horizontal & vertical cross rays
                draw.line([(sx - arm_len, sy), (sx + arm_len, sy)], fill=dim_col, width=1)
                draw.line([(sx, sy - arm_len), (sx, sy + arm_len)], fill=dim_col, width=1)
                # Bright diamond center
                draw.point((sx, sy), fill=core_col)
                draw.point((sx - 1, sy), fill=core_col)
                draw.point((sx + 1, sy), fill=core_col)
                draw.point((sx, sy - 1), fill=core_col)
                draw.point((sx, sy + 1), fill=core_col)


# =============================================================================
# FLOATING MINI HEARTS (IDLE EFFECT)
# =============================================================================
class FloatingHearts:
    """Drifting ASCII mini hearts that ascend from the heart during idle."""

    def __init__(self, count: int = 9):
        rng = np.random.RandomState(1337)
        self.particles = []
        for i in range(count):
            self.particles.append({
                "x_rel": rng.uniform(-0.28, 0.28),
                "speed": rng.uniform(0.12, 0.22),
                "wobble_freq": rng.uniform(1.8, 3.2),
                "wobble_amp": rng.uniform(0.02, 0.05),
                "phase": rng.uniform(0, 2 * math.pi),
                "period": rng.uniform(3.5, 5.0),
                "time_offset": i * 0.45,
                "char": rng.choice(["♥", "*", "♡", "o"]),
                "col": (rng.randint(245, 256), rng.randint(80, 140), rng.randint(140, 190)),
            })

    def render(self, draw: ImageDraw.ImageDraw, t_idle: float, opacity: float):
        if opacity <= 0.01:
            return
        for p in self.particles:
            curr_t = (t_idle + p["time_offset"]) % p["period"]
            progress = curr_t / p["period"]  # 0.0 (bottom) to 1.0 (top)

            # Start near heart chest (ny ~ 0.15), float up to ny ~ -0.7
            ny = 0.15 - progress * 0.85
            nx = p["x_rel"] + p["wobble_amp"] * math.sin(curr_t * p["wobble_freq"] + p["phase"])

            # Fade in quickly at start, fade out at top
            alpha = math.sin(progress * math.pi) * opacity
            if alpha > 0.05:
                px = int(CENTER_X + nx * SCENE_SCALE)
                py = int(CENTER_Y + ny * SCENE_SCALE)
                if 40 <= px <= CANVAS_WIDTH - 40 and 40 <= py <= ASCII_BOTTOM - 20:
                    r = int(p["col"][0] * alpha)
                    g = int(p["col"][1] * alpha)
                    b = int(p["col"][2] * alpha)
                    draw.text((px, py), p["char"], fill=(r, g, b), font=FONT_ASCII)


# =============================================================================
# TEDDY BEAR & HEART MATHEMATICAL SHAPES
# =============================================================================
def eval_scene_shapes(nx: float, ny: float, heart_scale: float = 1.0):
    """
    Evaluates implicit mathematical equations for the teddy bear and heart.
    Returns:
        (part_name, intensity, base_color)
    """
    # 1. Glowing Heart (held in paws against chest)
    # Centered at (0.0, 0.17)
    hx = nx / (0.32 * heart_scale)
    hy = -(ny - 0.17) / (0.30 * heart_scale)
    h_eq = (hx**2 + hy**2 - 1.0)**3 - (hx**2) * (hy**3)
    is_heart = (h_eq <= 0.0)

    # 2. Bear paws (in front of heart, hugging sides)
    lpaw_d = ((nx + 0.22) / 0.11)**2 + ((ny - 0.18) / 0.085)**2
    rpaw_d = ((nx - 0.22) / 0.11)**2 + ((ny - 0.18) / 0.085)**2
    is_paw = (lpaw_d <= 1.0) or (rpaw_d <= 1.0)
    is_paw_pad = (lpaw_d <= 0.35) or (rpaw_d <= 0.35)

    # 3. Ribbon Bow (under chin at ny = -0.05)
    bow_knot = (nx / 0.038)**2 + ((ny + 0.05) / 0.035)**2 <= 1.0
    bow_left = ((nx + 0.08) / 0.07)**2 + ((ny + 0.05) / 0.05)**2 <= 1.0
    bow_right = ((nx - 0.08) / 0.07)**2 + ((ny + 0.05) / 0.05)**2 <= 1.0
    bow_tail_l = (abs(nx + 0.05) < 0.03) and (-0.02 < ny < 0.07)
    bow_tail_r = (abs(nx - 0.05) < 0.03) and (-0.02 < ny < 0.07)
    is_bow = bow_knot or bow_left or bow_right or bow_tail_l or bow_tail_r

    # 4. Shiny Eyes & Specular Highlights
    eye_hl_l = ((nx + 0.16) / 0.015)**2 + ((ny + 0.35) / 0.018)**2 <= 1.0
    eye_hl_r = ((nx - 0.125) / 0.015)**2 + ((ny + 0.35) / 0.018)**2 <= 1.0
    is_eye_hl = eye_hl_l or eye_hl_r

    eye_l = ((nx + 0.14) / 0.042)**2 + ((ny + 0.34) / 0.05)**2 <= 1.0
    eye_r = ((nx - 0.14) / 0.042)**2 + ((ny + 0.34) / 0.05)**2 <= 1.0
    is_eye = eye_l or eye_r

    # 5. Nose & Cute Mouth
    nose_d = (nx / 0.055)**2 + ((ny + 0.25) / 0.038)**2
    is_nose = (nose_d <= 1.0)
    is_mouth = (abs(nx) < 0.015 and -0.22 <= ny <= -0.17) or \
               ((nx**2 + (ny + 0.17)**2 <= 0.045**2) and ny >= -0.17 and abs(nx) < 0.06)

    # 6. Muzzle (snout) & Cheek Blush
    muzzle_d = (nx / 0.18)**2 + ((ny + 0.21) / 0.135)**2
    is_muzzle = (muzzle_d <= 1.0)
    blush_l = ((nx + 0.24) / 0.05)**2 + ((ny + 0.23) / 0.035)**2 <= 1.0
    blush_r = ((nx - 0.24) / 0.05)**2 + ((ny + 0.23) / 0.035)**2 <= 1.0
    is_blush = blush_l or blush_r

    # 7. Ears (outer round + lighter inner ears)
    lear_in = ((nx + 0.33) / 0.095)**2 + ((ny + 0.58) / 0.095)**2 <= 1.0
    rear_in = ((nx - 0.33) / 0.095)**2 + ((ny + 0.58) / 0.095)**2 <= 1.0
    is_ear_in = lear_in or rear_in
    lear_out = ((nx + 0.33) / 0.16)**2 + ((ny + 0.58) / 0.16)**2 <= 1.0
    rear_out = ((nx - 0.33) / 0.16)**2 + ((ny + 0.58) / 0.16)**2 <= 1.0
    is_ear_out = lear_out or rear_out

    # 8. Bear Head
    head_d = (nx / 0.38)**2 + ((ny + 0.30) / 0.32)**2
    is_head = (head_d <= 1.0)

    # 9. Feet / Lower Paws
    lfoot = ((nx + 0.27) / 0.13)**2 + ((ny - 0.56) / 0.10)**2 <= 1.0
    rfoot = ((nx - 0.27) / 0.13)**2 + ((ny - 0.56) / 0.10)**2 <= 1.0
    lfoot_pad = ((nx + 0.27) / 0.08)**2 + ((ny - 0.56) / 0.06)**2 <= 1.0
    rfoot_pad = ((nx - 0.27) / 0.08)**2 + ((ny - 0.56) / 0.06)**2 <= 1.0
    is_foot = lfoot or rfoot
    is_foot_pad = lfoot_pad or rfoot_pad

    # 10. Bear Body (pear-shaped torso)
    bw = 0.40 * (1.0 + 0.28 * (ny - 0.05))
    body_d = (nx / bw)**2 + ((ny - 0.25) / 0.40)**2
    is_body = (body_d <= 1.0)

    # Render priority layer order (front to back):
    if is_paw_pad:
        return "paw_pad", 0.90, (246, 218, 188)
    if is_paw:
        return "paw", 0.78, (178, 118, 70)
    if is_bow:
        return "bow", 0.88, (238, 55, 82)
    if is_eye_hl:
        return "eye_hl", 1.00, (255, 255, 255)
    if is_nose:
        return "nose", 0.95, (42, 28, 28)
    if is_eye:
        return "eye", 0.90, (32, 22, 22)
    if is_mouth:
        return "mouth", 0.85, (65, 42, 42)
    if is_blush:
        return "blush", 0.72, (238, 148, 158)
    if is_muzzle:
        return "muzzle", 0.82, (244, 214, 180)
    if is_heart:
        depth = min(1.0, max(0.2, -h_eq * 2.5 + 0.3))
        # Glossy pink highlight in upper lobes
        if hy > 0.3 and abs(hx) < 0.7:
            return "heart", depth, (255, 120, 160)
        return "heart", depth, (248, 42, 88)
    if is_head:
        shade = 1.0 - 0.35 * head_d
        return "head", shade, (182, 122, 74)
    if is_ear_in:
        return "ear_in", 0.80, (236, 198, 162)
    if is_ear_out:
        return "ear_out", 0.70, (172, 112, 66)
    if is_foot_pad:
        return "foot_pad", 0.85, (246, 218, 188)
    if is_foot:
        return "foot", 0.72, (172, 112, 66)
    if is_body:
        shade = 1.0 - 0.30 * body_d
        return "body", shade, (176, 116, 68)

    return "bg", 0.0, (0, 0, 0)


def compute_reveal_stage(part: str, nx: float, ny: float) -> float:
    """
    Computes normalized reveal-order timestamp [0.0, 1.0] for organic blooming:
    Heart first -> Paws -> Body -> Feet -> Head -> Ears -> Face -> Features & Bow.
    """
    # Deterministic organic jitter for petals/fur flutter
    seed = (int((nx + 2.0) * 800) ^ int((ny + 2.0) * 1200)) % 100
    jitter = (seed / 100.0 - 0.5) * 0.024

    if part == "heart":
        hx = nx / 0.32
        hy = -(ny - 0.17) / 0.30
        d = math.sqrt(hx**2 + hy**2)
        return min(0.25, max(0.0, 0.22 * d)) + jitter
    elif part in ("paw", "paw_pad"):
        return 0.24 + 0.10 * min(1.0, abs(nx) / 0.30) + jitter
    elif part == "body":
        d = math.sqrt((nx / 0.40)**2 + ((ny - 0.25) / 0.40)**2)
        return 0.30 + 0.20 * min(1.0, d) + jitter
    elif part in ("foot", "foot_pad"):
        return 0.49 + 0.10 * min(1.0, abs(nx) / 0.35) + jitter
    elif part == "head":
        p = (-0.02 - ny) / 0.55
        return 0.52 + 0.19 * min(1.0, max(0.0, p)) + jitter
    elif part in ("ear_out", "ear_in"):
        p = (-0.42 - ny) / 0.30
        return 0.69 + 0.13 * min(1.0, max(0.0, p)) + jitter
    elif part in ("muzzle", "blush"):
        return 0.80 + 0.07 * min(1.0, abs(nx) / 0.25) + jitter
    elif part in ("nose", "mouth", "eye"):
        return 0.86 + 0.06 * min(1.0, max(0.0, (ny + 0.35) / 0.20)) + jitter
    elif part in ("eye_hl", "bow"):
        return 0.93 + 0.06 * min(1.0, abs(nx) / 0.15) + jitter
    return 1.0


# Precompute canonical base grid cells
CANONICAL_GRID = []
for row in range(ROWS):
    row_cells = []
    for col in range(COLS):
        px = GRID_X0 + col * CELL_W + CELL_W // 2
        py = GRID_Y0 + row * CELL_H + CELL_H // 2
        nx = (px - CENTER_X) / SCENE_SCALE
        ny = (py - CENTER_Y) / SCENE_SCALE
        part, intensity, colr = eval_scene_shapes(nx, ny, heart_scale=1.0)
        rv = compute_reveal_stage(part, nx, ny) if part != "bg" else 999.0
        row_cells.append({
            "nx": nx, "ny": ny,
            "part": part, "intensity": intensity,
            "color": colr, "reveal_stage": rv,
            "hash": (col * 37 + row * 17) % 7
        })
    CANONICAL_GRID.append(row_cells)


# =============================================================================
# ASCII CHARACTER SELECTOR
# =============================================================================
def choose_ascii_char(part: str, intensity: float, h: int, row: int) -> str:
    """Selects character based on part density ramp and fur/heart texture letters."""
    if part == "eye_hl":
        return "*"
    elif part in ("nose", "eye"):
        return "@"
    elif part == "mouth":
        return "w" if row % 2 == 0 else "v"
    elif part == "heart":
        # ASCII density ramp for glowing heart
        heart_ramp = ["#", "%", "@", "&", "$"]
        idx = min(4, int(intensity * 4.5))
        return heart_ramp[idx]
    elif part in ("paw_pad", "foot_pad", "blush"):
        return "o"
    elif part == "bow":
        return "&" if intensity > 0.8 else "*"
    else:
        # Bear fur texture using ramp + letters (o, a, e, x, $, 8, &)
        if intensity > 0.85:
            return ["@", "$", "&", "%"][h % 4]
        elif intensity > 0.65:
            return ["8", "#", "x", "e"][h % 4]
        elif intensity > 0.45:
            return ["a", "o", "*", "+"][h % 4]
        else:
            return ["=", "-", ":", "."][h % 4]


# =============================================================================
# CODE EDITOR SNIPPET & SYNTAX HIGHLIGHTING
# =============================================================================
SOURCE_CODE_LINES = [
    "# art.py - Teddy Bear ASCII Bloom Animation",
    "import numpy as np",
    "from PIL import Image, ImageDraw, ImageFont",
    "import imageio.v2 as imageio",
    "",
    "def eval_heart(x: float, y: float, scale: float = 1.0):",
    '    """Evaluate 2D algebraic heart implicit function."""',
    "    hx = x / (0.32 * scale)",
    "    hy = -y / (0.30 * scale)",
    "    f = (hx**2 + hy**2 - 1.0)**3 - (hx**2) * (hy**3)",
    "    return f <= 0.0, max(0.0, -f)",
    "",
    "def bloom_easing(u: float) -> float:",
    '    """Smoothstep cubic S-curve for organic blooming."""',
    "    u_clamped = max(0.0, min(1.0, u))",
    "    return u_clamped * u_clamped * (3.0 - 2.0 * u_clamped)",
    "",
    "def render_teddy_frame(frame_idx: int, total_frames: int = 600):",
    "    bloom_progress = min(1.0, frame_idx / 360.0)",
    "    sway_angle = 2.0 * math.sin((frame_idx - 330) * 0.08) if frame_idx > 330 else 0.0",
    "    heart_scale = 1.0 + 0.08 * math.sin(frame_idx * 0.22)**4",
    "",
    "    # Generate frame canvas and ASCII raster",
    "    canvas = Image.new('RGB', (1080, 1920), (10, 11, 16))",
    "    draw = ImageDraw.Draw(canvas)",
    "    draw_radial_heart_glow(draw, center=(540, 680), scale=heart_scale)",
    "    draw_ascii_bear(draw, bloom=bloom_progress, sway=sway_angle)",
    "    draw_hud(draw, frame=frame_idx, bloom=bloom_progress, sway=sway_angle)",
    "    draw_editor_panel(draw, scroll_offset=frame_idx * 0.75)",
    "    return np.array(canvas)",
    "",
    "if __name__ == '__main__':",
    '    print("Rendering 9:16 ASCII reel: art.mp4")',
    '    export_mp4("art.mp4", fps=30, duration=20.0)',
]

# Syntax highlighting tokens
RE_KEYWORD = re.compile(r'\b(def|class|import|from|return|for|in|if|else|elif|while|and|or|not|as|True|False|None)\b')
RE_NUM = re.compile(r'\b(\d+\.?\d*)\b')
RE_STR = re.compile(r'("[^"]*"|\'[^\']*\')')
RE_COMMENT = re.compile(r'(#.*$)')


def draw_code_editor(draw: ImageDraw.ImageDraw, frame_idx: int):
    """Renders the dark code editor panel with syntax highlighting and blinking cursor."""
    panel_y0 = EDITOR_TOP
    draw.rectangle([0, panel_y0, CANVAS_WIDTH, CANVAS_HEIGHT], fill=EDITOR_BG)

    # Window title bar / tab header
    header_h = 38
    draw.rectangle([0, panel_y0, CANVAS_WIDTH, panel_y0 + header_h], fill=EDITOR_HEADER_BG)
    draw.line([0, panel_y0 + header_h, CANVAS_WIDTH, panel_y0 + header_h], fill=BORDER_COLOR, width=1)

    # macOS window traffic light dots
    draw.ellipse([45, panel_y0 + 13, 57, panel_y0 + 25], fill=(255, 95, 86))    # Red
    draw.ellipse([67, panel_y0 + 13, 79, panel_y0 + 25], fill=(255, 189, 46))   # Yellow
    draw.ellipse([89, panel_y0 + 13, 101, panel_y0 + 25], fill=(39, 201, 63))   # Green

    # Active file tab: art.py
    tab_x0, tab_x1 = 130, 270
    draw.rectangle([tab_x0, panel_y0 + 6, tab_x1, panel_y0 + header_h], fill=EDITOR_BG)
    draw.line([tab_x0, panel_y0 + 6, tab_x1, panel_y0 + 6], fill=(90, 160, 255), width=2)
    draw.text((tab_x0 + 22, panel_y0 + 11), "● art.py", fill=(215, 220, 235), font=FONT_HUD_SM)

    # Line numbers gutter & separator
    gutter_width = 85
    gutter_divider_x = gutter_width + 25
    draw.line([gutter_divider_x, panel_y0 + header_h, gutter_divider_x, CANVAS_HEIGHT], fill=BORDER_COLOR, width=1)

    # Scrolling dynamics
    line_h = 28
    code_start_y = panel_y0 + 55
    total_lines = len(SOURCE_CODE_LINES)
    # Smooth continuous scrolling that loops or sweeps down the script
    scroll_y = int((frame_idx * 0.70) % (max(1, total_lines * line_h - 400)))

    # Active cursor line (follows execution or cycles)
    active_cursor_line = 18 + int((frame_idx // 18) % 10)
    cursor_blink = (frame_idx // 15) % 2 == 0

    for idx, line_text in enumerate(SOURCE_CODE_LINES):
        line_num = idx + 1
        y = code_start_y + idx * line_h - scroll_y
        if y < panel_y0 + header_h - 5 or y > CANVAS_HEIGHT - 10:
            continue

        # Cursor line active background highlight
        if line_num == active_cursor_line:
            draw.rectangle([gutter_divider_x + 1, y - 2, CANVAS_WIDTH, y + line_h - 4], fill=(30, 33, 49))
            draw.text((gutter_width - 25, y), f"{line_num:2d}", fill=(255, 255, 255), font=FONT_CODE)
        else:
            draw.text((gutter_width - 25, y), f"{line_num:2d}", fill=(88, 92, 114), font=FONT_CODE)

        # Draw syntax highlighted tokens
        x = gutter_divider_x + 25
        cm = RE_COMMENT.search(line_text)
        comment_start = cm.start() if cm else len(line_text)
        code_part = line_text[:comment_start]

        tokens = re.split(r'(\s+|[(),.:=\[\]{}<>+\-*\/])', code_part)
        for tok in tokens:
            if not tok:
                continue
            if RE_KEYWORD.match(tok):
                tok_col = (255, 121, 198)   # Pink (keywords)
            elif RE_NUM.match(tok):
                tok_col = (255, 184, 108)   # Orange (numbers)
            elif RE_STR.match(tok):
                tok_col = (241, 250, 140)   # Yellow (strings)
            elif tok in ("math", "np", "PIL", "Image", "ImageDraw", "ImageFont", "imageio") or tok.endswith("_frame") or "(" in line_text[line_text.find(tok):line_text.find(tok)+len(tok)+2]:
                tok_col = (139, 233, 253)   # Blue/Cyan (functions & modules)
            elif tok in ("(", ")", "[", "]", "{", "}", ":", ",", "=", "+", "-", "*", "/", "<", ">"):
                tok_col = (255, 121, 198)   # Pink/Magenta (operators)
            else:
                tok_col = (248, 248, 242)   # Light white (identifiers)

            draw.text((x, y), tok, fill=tok_col, font=FONT_CODE)
            bbox = font_code_bbox(tok)
            x += bbox

        # Draw comment if present
        if cm:
            draw.text((x, y), cm.group(1), fill=(98, 114, 164), font=FONT_CODE)
            bbox = font_code_bbox(cm.group(1))
            x += bbox

        # Blinking cursor block on active line
        if line_num == active_cursor_line and cursor_blink:
            draw.rectangle([x + 3, y + 2, x + 13, y + line_h - 6], fill=(255, 121, 198))


_bbox_cache = {}
def font_code_bbox(text: str) -> int:
    """Fast cache for token text measurements."""
    if text in _bbox_cache:
        return _bbox_cache[text]
    bb = FONT_CODE.getbbox(text)
    w = bb[2] - bb[0]
    _bbox_cache[text] = w
    return w


# =============================================================================
# HUD BAR RENDERING
# =============================================================================
def draw_hud_bar(draw: ImageDraw.ImageDraw, frame_idx: int, bloom_pct: float, sway_deg: float, letter_count: int):
    """
    Renders the HUD bar with live telemetry metrics matching the requested format:
    Line 1: "$ py art.py" on left, "● running · 30 fps" on right.
    Line 2: "@yourname · 2026", "bloom 74.1%", "sway 012.15°", "letters 1,037"
    """
    # Background panel
    draw.rectangle([0, HUD_TOP, CANVAS_WIDTH, HUD_BOTTOM], fill=HUD_BG)
    draw.line([0, HUD_TOP, CANVAS_WIDTH, HUD_TOP], fill=BORDER_COLOR, width=2)
    draw.line([0, HUD_BOTTOM, CANVAS_WIDTH, HUD_BOTTOM], fill=BORDER_COLOR, width=2)

    # Top line of HUD
    draw.text((45, HUD_TOP + 14), "$ ", fill=(80, 240, 140), font=FONT_HUD)
    draw.text((68, HUD_TOP + 14), "py art.py", fill=(235, 240, 250), font=FONT_HUD)

    # Pulsing green status dot
    pulse = 0.6 + 0.4 * math.sin(frame_idx * 0.25)
    g_col = (int(40 * pulse), int(230 * pulse), int(130 * pulse))
    draw.text((CANVAS_WIDTH - 245, HUD_TOP + 14), "●", fill=g_col, font=FONT_HUD)
    draw.text((CANVAS_WIDTH - 225, HUD_TOP + 14), " running · 30 fps", fill=(145, 150, 170), font=FONT_HUD)

    # Bottom line: Telemetry metrics spaced out cleanly
    # Format: @yourname · 2026    bloom 74.1%    sway 002.15°    letters 1,037
    metrics_str = f"@yourname · 2026    bloom {bloom_pct:04.1f}%    sway {abs(sway_deg):05.2f}°    letters {letter_count:,}"
    draw.text((45, HUD_TOP + 48), metrics_str, fill=(160, 165, 185), font=FONT_HUD_SM)


# =============================================================================
# RADIAL HEART GLOW
# =============================================================================
def draw_radial_heart_glow(draw: ImageDraw.ImageDraw, cx: int, cy: int, glow_radius: float, intensity: float):
    """Paints a soft atmospheric red glow in the background behind the heart."""
    if intensity <= 0.01:
        return
    # Draw concentric soft circles with decaying alpha/color
    steps = 14
    for s in range(steps, 0, -1):
        r = glow_radius * (s / steps)
        factor = (1.0 - (s / steps))**1.8 * intensity
        red = int(105 * factor)
        green = int(18 * factor)
        blue = int(38 * factor)
        if red > 2:
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue))


# =============================================================================
# MAIN ANIMATION GENERATOR
# =============================================================================
def generate_animation():
    """Generates the full 20-second 1080x1920 animation and exports to art.mp4."""
    print("=" * 70)
    print("🧸  Teddy Bear ASCII Bloom Reel Generator")
    print(f"🎬  Output: {OUTPUT_FILENAME} (1080x1920 @ {FPS} fps, {DURATION_SEC}s, {TOTAL_FRAMES} frames)")
    print("=" * 70)

    star_field = StarField()
    floating_hearts = FloatingHearts()

    # Initialize MP4 video writer using imageio-ffmpeg
    writer = imageio.get_writer(
        OUTPUT_FILENAME,
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
        macro_block_size=None,
    )

    t_start = time.time()

    for frame in range(TOTAL_FRAMES):
        t_sec = frame / float(FPS)

        # ---------------------------------------------------------------------
        # 1. Animation Timeline Dynamics
        # ---------------------------------------------------------------------
        # Bloom Phase: frame 0 to BLOOM_FRAMES (12 seconds)
        if frame < BLOOM_FRAMES:
            u_linear = frame / float(BLOOM_FRAMES)
            # Smoothstep easing curve
            eased_bloom = u_linear * u_linear * (3.0 - 2.0 * u_linear)
            bloom_pct = u_linear * 100.0
            idle_active = False
            t_idle = 0.0
            sway_deg = 0.0
            heart_scale = 1.0
            floating_opacity = 0.0
        else:
            eased_bloom = 1.0
            bloom_pct = 100.0
            idle_active = True
            t_idle = (frame - BLOOM_FRAMES) / float(FPS)

            # Bear sway: ~2 degrees oscillation around pivot at bottom paws
            sway_deg = 2.0 * math.sin(t_idle * 2.1)

            # Heartbeat pulse: 1.0 to 1.08 with double-beat rhythm (lub-dub)
            heart_cycle = (t_idle * 1.1) % 1.0
            if heart_cycle < 0.14:
                beat = math.sin((heart_cycle / 0.14) * math.pi)
            elif 0.18 < heart_cycle < 0.32:
                beat = 0.65 * math.sin(((heart_cycle - 0.18) / 0.14) * math.pi)
            else:
                beat = 0.0
            heart_scale = 1.0 + 0.08 * beat

            # Floating hearts fade in smoothly after bloom finishes
            floating_opacity = min(1.0, t_idle * 1.5)

        # ---------------------------------------------------------------------
        # 2. Canvas Setup & Background
        # ---------------------------------------------------------------------
        canvas = Image.new("RGB", (CANVAS_WIDTH, CANVAS_HEIGHT), BG_COLOR)
        draw = ImageDraw.Draw(canvas)

        # Calculate swayed heart center for ambient glow
        sway_rad = math.radians(sway_deg)
        # Pivot point in scene coordinates (nx=0, ny=0.55)
        # Vector from pivot to heart center (0.0, 0.17) is dy = -0.38
        heart_glow_nx = -(-0.38) * math.sin(sway_rad)
        heart_glow_ny = 0.55 + (-0.38) * math.cos(sway_rad)
        heart_glow_px = int(CENTER_X + heart_glow_nx * SCENE_SCALE)
        heart_glow_py = int(CENTER_Y + heart_glow_ny * SCENE_SCALE)

        # Soft red atmospheric glow behind heart
        glow_radius = 160.0 * heart_scale * min(1.0, eased_bloom * 1.2)
        glow_intensity = 0.95 * (heart_scale - 0.8) * min(1.0, eased_bloom * 1.5)
        draw_radial_heart_glow(draw, heart_glow_px, heart_glow_py, glow_radius, glow_intensity)

        # Background twinkling stars & sparkles
        star_field.render(draw, t_sec)

        # Floating mini hearts (idle loop)
        if idle_active:
            floating_hearts.render(draw, t_idle, floating_opacity)

        # ---------------------------------------------------------------------
        # 3. ASCII Art Grid Rendering
        # ---------------------------------------------------------------------
        active_letters = 0
        cos_sway = math.cos(-sway_rad)
        sin_sway = math.sin(-sway_rad)

        for r in range(ROWS):
            row_data = CANONICAL_GRID[r]
            cell_py = GRID_Y0 + r * CELL_H
            for c in range(COLS):
                cell = row_data[c]
                part = cell["part"]
                if part == "bg":
                    continue

                rv = cell["reveal_stage"]
                # Check reveal order threshold
                if eased_bloom < rv:
                    continue

                active_letters += 1
                cell_px = GRID_X0 + c * CELL_W

                # If swaying, transform sample coordinates around base pivot (0.0, 0.55)
                if abs(sway_deg) > 0.001 or heart_scale != 1.0:
                    dx = cell["nx"] - 0.0
                    dy = cell["ny"] - 0.55
                    rx = dx * cos_sway - dy * sin_sway
                    ry = dx * sin_sway + dy * cos_sway + 0.55
                    # Re-evaluate part at swayed position
                    swayed_part, swayed_intensity, swayed_col = eval_scene_shapes(rx, ry, heart_scale)
                    if swayed_part == "bg":
                        continue
                    draw_part = swayed_part
                    draw_intensity = swayed_intensity
                    draw_color = swayed_col
                else:
                    draw_part = part
                    draw_intensity = cell["intensity"]
                    draw_color = cell["color"]

                # Bloom shimmer effect: freshly born characters sparkle briefly
                delta = eased_bloom - rv
                if delta < 0.035 and frame < BLOOM_FRAMES:
                    shimmer_mix = delta / 0.035
                    ch = "*"
                    # Blend to bright white/golden flash
                    draw_color = (
                        int(255 * (1.0 - shimmer_mix) + draw_color[0] * shimmer_mix),
                        int(240 * (1.0 - shimmer_mix) + draw_color[1] * shimmer_mix),
                        int(220 * (1.0 - shimmer_mix) + draw_color[2] * shimmer_mix),
                    )
                else:
                    ch = choose_ascii_char(draw_part, draw_intensity, cell["hash"], r)

                # Draw character
                draw.text((cell_px, cell_py), ch, fill=draw_color, font=FONT_ASCII)

        # ---------------------------------------------------------------------
        # 4. Monospace Telemetry HUD Bar
        # ---------------------------------------------------------------------
        draw_hud_bar(draw, frame, bloom_pct, sway_deg, active_letters)

        # ---------------------------------------------------------------------
        # 5. Code Editor Panel
        # ---------------------------------------------------------------------
        draw_code_editor(draw, frame)

        # ---------------------------------------------------------------------
        # 6. Append Frame to Video Stream
        # ---------------------------------------------------------------------
        frame_np = np.array(canvas)
        writer.append_data(frame_np)

        # Terminal Progress Bar
        completed = frame + 1
        pct = (completed / TOTAL_FRAMES) * 100.0
        elapsed = time.time() - t_start
        fps_render = completed / max(0.001, elapsed)
        eta_sec = (TOTAL_FRAMES - completed) / max(0.001, fps_render)
        bar_len = 32
        filled = int(bar_len * completed // TOTAL_FRAMES)
        bar = "█" * filled + "░" * (bar_len - filled)
        sys.stdout.write(
            f"\r[{bar}] {completed}/{TOTAL_FRAMES} frames ({pct:5.1f}%) | "
            f"{fps_render:4.1f} fps | ETA: {eta_sec:4.1f}s | letters: {active_letters:,} "
        )
        sys.stdout.flush()

    writer.close()
    total_time = time.time() - t_start
    print(f"\n\n✅ Export completed successfully in {total_time:.1f}s ({TOTAL_FRAMES / total_time:.1f} fps)")
    print(f"📁 Video saved to: {os.path.abspath(OUTPUT_FILENAME)}")


if __name__ == "__main__":
    generate_animation()

