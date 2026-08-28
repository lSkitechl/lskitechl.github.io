"""Generate a centered, animation-ready industrial gear SVG.

Run with Blender's Python interpreter or regular Python. The exporter uses
native SVG geometry rather than rasterizing the Blender mesh.
"""

from math import cos, pi, sin
from pathlib import Path


OUTPUT = Path(__file__).with_name("skitech-gear.svg")
TOOTH_COUNT = 30
SPOKE_COUNT = 6
RIVET_COUNT = 14


def point(radius, angle):
    return f"{radius * cos(angle):.2f},{radius * sin(angle):.2f}"


def polar_path(points):
    commands = [f"M {point(*points[0])}"]
    commands.extend(f"L {point(*item)}" for item in points[1:])
    return " ".join(commands) + " Z"


def gear_teeth():
    points = []
    step = 2 * pi / TOOTH_COUNT
    for index in range(TOOTH_COUNT):
        center = index * step
        for offset, radius in ((-0.50, 4.18), (-0.34, 4.72), (0.34, 4.72), (0.50, 4.18)):
            points.append((radius, center + offset * step))
    return polar_path(points)


def spoke_path(angle):
    half_width = 0.36
    inner = 1.05
    outer = 3.38
    return polar_path([
        (inner, angle - half_width),
        (outer, angle - half_width * 0.62),
        (outer, angle + half_width * 0.62),
        (inner, angle + half_width),
    ])


def rivets():
    parts = []
    for index in range(RIVET_COUNT):
        angle = 2 * pi * index / RIVET_COUNT + pi / RIVET_COUNT
        x, y = (float(value) for value in point(3.02, angle).split(","))
        parts.append(
            f'<circle class="rivet" cx="{x:.2f}" cy="{y:.2f}" r="0.17"/>'
            f'<path class="rivet-slot" d="M {x - 0.09:.2f},{y - 0.09:.2f} '
            f'L {x + 0.09:.2f},{y + 0.09:.2f}"/>'
        )
    return "\n      ".join(parts)


def spoke_bolts():
    parts = []
    for index in range(SPOKE_COUNT):
        angle = 2 * pi * index / SPOKE_COUNT + pi / 6
        x, y = (float(value) for value in point(2.18, angle).split(","))
        parts.append(
            f'<circle class="spoke-bolt-shadow" cx="{x + 0.05:.2f}" cy="{y + 0.06:.2f}" r="0.25"/>'
            f'<circle class="spoke-bolt" cx="{x:.2f}" cy="{y:.2f}" r="0.22"/>'
            f'<path class="bolt-slot" d="M {x - 0.10:.2f},{y - 0.10:.2f} L {x + 0.10:.2f},{y + 0.10:.2f}"/>'
        )
    return "\n      ".join(parts)


def wear_marks():
    parts = []
    for index in range(18):
        angle = 2 * pi * index / 18 + 0.13
        start = point(3.58, angle)
        end = point(4.12, angle + 0.035)
        parts.append(f'<path class="wear" d="M {start} L {end}"/>')
    return "\n      ".join(parts)


def build_svg():
    spokes = "\n      ".join(
      f'<path class="spoke-shadow" d="{spoke_path(2 * pi * i / SPOKE_COUNT + pi / 6)}" transform="translate(0.07 0.09)"/>\n'
      f'      <path class="spoke" d="{spoke_path(2 * pi * i / SPOKE_COUNT + pi / 6)}"/>'
        for i in range(SPOKE_COUNT)
    )
    teeth = gear_teeth()
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.35 -5.35 10.7 10.7" role="img" aria-labelledby="title desc">
  <title id="title">SKITECH industrial gear</title>
  <desc id="desc">A symmetrical weathered bronze gear centered at the origin for CSS rotation.</desc>
  <defs>
    <linearGradient id="bronze" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#D49A43"/><stop offset="0.3" stop-color="#8C6430"/>
      <stop offset="0.62" stop-color="#4C3218"/><stop offset="1" stop-color="#1A110B"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#D49A43"/><stop offset="0.46" stop-color="#8C6430"/><stop offset="1" stop-color="#302014"/>
    </linearGradient>
    <radialGradient id="hub" cx="34%" cy="28%" r="78%">
      <stop offset="0" stop-color="#D49A43"/><stop offset="0.32" stop-color="#8C6430"/>
      <stop offset="0.76" stop-color="#3B2715"/><stop offset="1" stop-color="#1A110B"/>
    </radialGradient>
    <filter id="patina" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.72 0.84" numOctaves="4" seed="37" stitchTiles="stitch" result="fine-grain"/>
      <feColorMatrix in="fine-grain" type="matrix" values="0.333 0.333 0.333 0 0 0.333 0.333 0.333 0 0 0.333 0.333 0.333 0 0 0 0 0 0.75 0" result="gray-grain"/>
      <feComponentTransfer in="gray-grain" result="soft-grain">
        <feFuncR type="gamma" amplitude="0.72" exponent="1.15" offset="0.08"/>
        <feFuncG type="gamma" amplitude="0.72" exponent="1.15" offset="0.08"/>
        <feFuncB type="gamma" amplitude="0.72" exponent="1.15" offset="0.08"/>
        <feFuncA type="table" tableValues="0 0.025 0.06 0.10"/>
      </feComponentTransfer>
      <feComposite in="soft-grain" in2="SourceGraphic" operator="in" result="masked-grain"/>
      <feBlend in="SourceGraphic" in2="masked-grain" mode="multiply" result="darkened-metal"/>
      <feBlend in="darkened-metal" in2="masked-grain" mode="screen"/>
    </filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.10"/></filter>
  </defs>
  <g id="gear" transform="rotate(0)" transform-origin="0 0" filter="url(#patina)">
    <path class="shadow" d="{teeth}" transform="translate(0.08 0.1)"/>
    <path class="teeth" d="{teeth}"/>
    <circle class="recess" cx="0" cy="0" r="3.86"/>
    <circle class="rim-face" cx="0" cy="0" r="3.70"/>
    <circle class="inner-rim" cx="0" cy="0" r="3.42"/>
    <circle class="inner-rim-dark" cx="0" cy="0" r="3.18"/>
    <circle class="inner-shadow" cx="0" cy="0" r="3.08"/>
    {spokes}
    {spoke_bolts()}
    <circle class="hub-shadow" cx="0.06" cy="0.08" r="1.38"/>
    <circle class="hub" cx="0" cy="0" r="1.30"/>
    <circle class="hub-face" cx="0" cy="0" r="0.76"/>
    <circle class="axle" cx="0" cy="0" r="0.35"/>
    {rivets()}
    {wear_marks()}
  </g>
  <style>
    .shadow {{ fill: #0B0704; opacity: .8; filter: url(#shadow); }}
    .teeth {{ fill: url(#bronze); stroke: #D49A43; stroke-width: .035; }}
    .recess {{ fill: #1A110B; stroke: #4C3218; stroke-width: .12; }}
    .rim-face {{ fill: none; stroke: url(#bronze); stroke-width: .32; }}
    .inner-rim {{ fill: none; stroke: url(#edge); stroke-width: .28; }}
    .inner-rim-dark {{ fill: none; stroke: #1A110B; stroke-width: .16; }}
    .inner-shadow {{ fill: none; stroke: #0B0704; stroke-width: .22; }}
    .spoke-shadow {{ fill: #0B0704; opacity: .9; }}
    .spoke {{ fill: url(#edge); stroke: #D49A43; stroke-opacity: .5; stroke-width: .04; }}
    .hub-shadow {{ fill: #0B0704; opacity: .85; }}
    .hub {{ fill: url(#hub); stroke: #D49A43; stroke-width: .06; }}
    .hub-face {{ fill: none; stroke: #1A110B; stroke-width: .22; }}
    .axle {{ fill: #1A110B; stroke: #D49A43; stroke-width: .06; }}
    .rivet {{ fill: #1A110B; stroke: #D49A43; stroke-width: .055; }}
    .rivet-slot {{ fill: none; stroke: #D49A43; stroke-width: .035; stroke-linecap: round; opacity: .75; }}
    .spoke-bolt-shadow {{ fill: #080503; opacity: .9; }}
    .spoke-bolt {{ fill: url(#hub); stroke: #8C6430; stroke-width: .045; }}
    .bolt-slot {{ fill: none; stroke: #1A110B; stroke-width: .045; stroke-linecap: round; }}
    .wear {{ fill: none; stroke: #D49A43; stroke-width: .025; stroke-linecap: round; opacity: .32; }}
  </style>
</svg>
'''


def main():
    OUTPUT.write_text(build_svg(), encoding="utf-8", newline="\n")
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
