#!/usr/bin/env python3
"""
SimRouteAI — Hero Background Video Generator

Generates a cinematic AI background video for the Offroad Semantic Scene Segmentation dashboard.
Output: 4K (or configurable) MP4, 10-12 seconds, seamless looping, with:
- Procedural desert terrain
- Semantic segmentation overlays (Trees, Bushes, Grass, Rocks, etc.)
- AI effects: scanning grid, glowing boundaries, data particles, detection pulses

Requirements: pip install numpy pillow imageio imageio-ffmpeg

Usage:
  python scripts/generate_hero_video.py
  python scripts/generate_hero_video.py --resolution 1920x1080  # Faster, 1080p
  python scripts/generate_hero_video.py --duration 12 --fps 30
"""

import argparse
import math
import os
import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter
    import imageio.v3 as iio
except ImportError as e:
    print("Missing dependencies. Install with:")
    print("  pip install numpy pillow imageio imageio-ffmpeg")
    sys.exit(1)


# Segment classes with colors (RGBA, 0-255)
SEGMENTS = [
    ("Trees", (34, 197, 94, 90)),
    ("Lush Bushes", (134, 239, 172, 90)),
    ("Dry Grass", (234, 179, 8, 90)),
    ("Dry Bushes", (146, 64, 14, 90)),
    ("Ground Clutter", (249, 115, 22, 90)),
    ("Flowers", (236, 72, 153, 90)),
    ("Logs", (92, 64, 51, 100)),
    ("Rocks", (100, 116, 139, 100)),
    ("Landscape", (217, 119, 6, 65)),
    ("Sky", (59, 130, 246, 50)),
]


def noise2d(x: float, y: float) -> float:
    """Simple deterministic noise."""
    n = math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return n - math.floor(n)


def smooth_noise(x: float, y: float) -> float:
    ix, iy = int(x), int(y)
    fx, fy = x - ix, y - iy
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    a = noise2d(ix, iy)
    b = noise2d(ix + 1, iy)
    c = noise2d(ix, iy + 1)
    d = noise2d(ix + 1, iy + 1)
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy


def render_frame(frame_idx: int, total_frames: int, w: int, h: int) -> np.ndarray:
    """Render a single frame. Returns uint8 array (h, w, 4) RGBA."""
    t = frame_idx / total_frames  # 0 to 1 over loop
    t_rad = t * 2 * math.pi

    # Camera drift
    cam_x = math.sin(t * 2 * math.pi) * w * 0.02
    cam_y = math.cos(t * 1.4 * math.pi) * h * 0.015

    # Create RGBA image
    img = np.zeros((h, w, 4), dtype=np.uint8)

    # Sky gradient
    for y in range(h):
        fy = y / h
        if fy < 0.6:
            # Sky
            r = int(30 + 15 * (1 - fy))
            g = int(58 + 20 * (1 - fy))
            b = int(95 + 30 * (1 - fy))
        elif fy < 0.85:
            # Horizon blend
            blend = (fy - 0.6) / 0.25
            r = int(45 + (196 - 45) * blend)
            g = int(78 + (165 - 78) * blend)
            b = int(127 + (150 - 127) * blend)
        else:
            # Sand
            r, g, b = 212, 184, 148
        img[y, :, 0] = r
        img[y, :, 1] = g
        img[y, :, 2] = b
        img[y, :, 3] = 255

    # Desert dunes (simplified - draw as overlay)
    for y in range(int(h * 0.5), h):
        for x in range(w):
            nx = (x + cam_x + t * 80) * 0.02
            ny = (y * 0.02 + t * 2)
            dune = smooth_noise(nx, ny) * 0.15 + smooth_noise(nx * 2, ny) * 0.08
            if (h - y) / h < 0.3 + dune:
                blend = min(1, ((h - y) / h - 0.2) * 2)
                img[y, x, 0] = int(212 * blend + img[y, x, 0] * (1 - blend))
                img[y, x, 1] = int(184 * blend + img[y, x, 1] * (1 - blend))
                img[y, x, 2] = int(148 * blend + img[y, x, 2] * (1 - blend))

    # Convert to PIL for drawing
    pil_img = Image.fromarray(img, mode="RGBA")
    draw = ImageDraw.Draw(pil_img, "RGBA")

    # Semantic segmentation circles (simplified blob representation)
    segment_positions = [
        (0.15, 0.72, 0.08, 0), (0.35, 0.68, 0.06, 0.2),
        (0.25, 0.78, 0.05, 0.1), (0.55, 0.75, 0.055, 0.3),
        (0.4, 0.82, 0.12, 0.05), (0.7, 0.8, 0.1, 0.25),
        (0.5, 0.78, 0.06, 0.15), (0.65, 0.76, 0.04, 0.35),
        (0.3, 0.8, 0.03, 0.2), (0.45, 0.85, 0.04, 0.1),
        (0.75, 0.82, 0.035, 0.3), (0.2, 0.88, 0.05, 0),
        (0.6, 0.86, 0.06, 0.2), (0.5, 0.92, 0.5, 0), (0.5, 0.35, 0.6, 0),
    ]
    seg_indices = [0, 0, 1, 1, 2, 2, 3, 4, 5, 6, 6, 7, 7, 8, 9]

    for (cx_n, cy_n, rad_n, phase), seg_i in zip(segment_positions, seg_indices):
        pulse = 0.9 + math.sin(t_rad + phase * 2 * math.pi) * 0.1
        cx = int((cx_n + cam_x / w) * w)
        cy = int((cy_n + cam_y / h) * h)
        r = int(rad_n * max(w, h) * pulse)

        name, (r_c, g_c, b_c, a) = SEGMENTS[seg_i]
        a = int(a * (0.9 + math.sin(t_rad * 2 + seg_i) * 0.1))

        # Glow ring
        for rr in range(r + 5, r, -1):
            draw.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(r_c, g_c, b_c, 60))

        # Fill
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(r_c, g_c, b_c, a))

    # Rover
    rover_x = int((0.2 + t * 0.65) * w) + int(cam_x)
    rover_y = h - 120 - int(math.sin(t * 4 * math.pi) * 8) + int(cam_y)

    # Rover body
    draw.rounded_rectangle(
        [rover_x - 28, rover_y - 12, rover_x + 28, rover_y + 12],
        radius=4,
        fill=(30, 41, 59),
        outline=(6, 182, 212, 128),
    )
    draw.rectangle([rover_x - 12, rover_y - 20, rover_x + 12, rover_y - 8], fill=(15, 23, 42))
    draw.ellipse([rover_x - 4, rover_y - 16, rover_x + 4, rover_y - 8], fill=(6, 182, 212, 200))

    # Scanning line
    scan_y = int((t * 1.2 % 1) * (h + 50)) - 25
    for dy in range(-15, 16):
        alpha = int(100 * (1 - abs(dy) / 15))
        draw.line([(0, scan_y + dy), (w, scan_y + dy)], fill=(6, 182, 212, alpha))

    # Detection pulse circles
    for i in range(3):
        pulse_t = (t + i * 0.33) % 1
        pulse_r = int(pulse_t * 150)
        alpha = int((1 - pulse_t) * 40)
        draw.ellipse(
            [rover_x - pulse_r, rover_y - pulse_r, rover_x + pulse_r, rover_y + pulse_r],
            outline=(6, 182, 212, alpha),
        )

    # Grid overlay
    grid_spacing = 45
    grid_offset = int((t * grid_spacing * 2) % grid_spacing)
    for x in range(-grid_offset, w + grid_spacing, grid_spacing):
        draw.line([(x, 0), (x, h)], fill=(6, 182, 212, 15))
    for y in range(-grid_offset, h + grid_spacing, grid_spacing):
        draw.line([(0, y), (w, y)], fill=(6, 182, 212, 15))

    # Dark overlay
    overlay = Image.new("RGBA", (w, h))
    odraw = ImageDraw.Draw(overlay, "RGBA")
    for y in range(h):
        fy = y / h
        if fy < 0.3:
            a = int(128 * (1 - fy / 0.3))
        elif fy < 0.6:
            a = 64
        else:
            a = int(64 + 80 * (fy - 0.6) / 0.4)
        odraw.line([(0, y), (w, y)], fill=(15, 23, 42, min(140, a)))
    pil_img = Image.alpha_composite(pil_img, overlay)

    return np.array(pil_img)


def main():
    parser = argparse.ArgumentParser(description="Generate SimRouteAI hero background video")
    parser.add_argument("--resolution", default="3840x2160", help="Output resolution (default: 3840x2160)")
    parser.add_argument("--duration", type=float, default=11, help="Duration in seconds")
    parser.add_argument("--fps", type=int, default=30, help="Frames per second")
    parser.add_argument("--output", "-o", default=None, help="Output file path")
    parser.add_argument("--preview", action="store_true", help="Render single frame for preview")
    args = parser.parse_args()

    w, h = map(int, args.resolution.split("x"))
    total_frames = int(args.duration * args.fps)

    # Output path
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    frontend_public = project_root / "frontend" / "public"
    frontend_public.mkdir(parents=True, exist_ok=True)

    out_path = args.output or str(frontend_public / "hero-bg.mp4")

    if args.preview:
        print("Rendering preview frame...")
        frame = render_frame(0, total_frames, w, h)
        preview_path = Path(out_path).with_suffix(".preview.png")
        iio.imwrite(preview_path, frame)
        print(f"Saved preview to {preview_path}")
        return

    print(f"Generating video: {w}x{h}, {args.duration}s @ {args.fps}fps = {total_frames} frames")
    print(f"Output: {out_path}")
    print("This may take several minutes for 4K...")

    # Stream frames to avoid memory issues; video needs RGB (no alpha)
    def frame_generator():
        for i in range(total_frames):
            if (i + 1) % 30 == 0:
                print(f"  Frame {i + 1}/{total_frames} ({100 * (i + 1) / total_frames:.1f}%)")
            frame = render_frame(i, total_frames, w, h)
            # Composite onto dark background and drop alpha for video
            bg = np.full((h, w, 3), (15, 23, 42), dtype=np.uint8)
            alpha = frame[:, :, 3:4] / 255.0
            rgb = frame[:, :, :3]
            out = (rgb * alpha + bg * (1 - alpha)).astype(np.uint8)
            yield out

    print("Writing video...")
    try:
        with iio.imopen(out_path, "w", plugin="pyav") as f:
            f.init_video_stream("libx264", fps=args.fps)
            for frame in frame_generator():
                f.write_frame(frame)
    except Exception as e:
        print(f"Video write failed: {e}")
        print("Install pyav for best results: pip install av")
        sys.exit(1)
    print(f"Done! Saved to {out_path}")


if __name__ == "__main__":
    main()
