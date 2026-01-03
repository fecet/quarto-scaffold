#!/usr/bin/env python3
"""Crop white borders and make background transparent."""

import argparse
from pathlib import Path

from PIL import Image


def crop_white_borders(img: Image.Image, threshold: int = 240) -> Image.Image:
    """Remove white borders from image."""
    img = img.convert("RGBA")

    # Find bounding box of non-white content
    pixels = img.load()
    width, height = img.size

    left, top, right, bottom = width, height, 0, 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if not (r > threshold and g > threshold and b > threshold):
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)

    if right <= left or bottom <= top:
        return img

    # Add small padding
    padding = 2
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(width, right + padding + 1)
    bottom = min(height, bottom + padding + 1)

    return img.crop((left, top, right, bottom))


def make_transparent(img: Image.Image, threshold: int = 240) -> Image.Image:
    """Replace white-ish pixels with transparent."""
    img = img.convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    return img


def process_image(input_path: str, output_path: str | None = None, threshold: int = 240):
    """Crop white borders and make background transparent."""
    input_p = Path(input_path)
    output_p = Path(output_path) if output_path else input_p.with_stem(input_p.stem + "_processed")

    img = Image.open(input_p)
    img = crop_white_borders(img, threshold)
    img = make_transparent(img, threshold)
    img.save(output_p, "PNG")
    print(f"Saved: {output_p}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crop white borders and make transparent")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("-o", "--output", help="Output path (default: input_processed.png)")
    parser.add_argument("-t", "--threshold", type=int, default=240, help="White threshold (0-255)")
    args = parser.parse_args()

    process_image(args.input, args.output, args.threshold)
