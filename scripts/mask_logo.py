"""Mask the logo in multi-scale.png image."""

from PIL import Image, ImageDraw

def mask_logo(image_path: str = "assets/images/multi-scale.png") -> None:
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)

    # Sample background color from clean area
    bg_color = img.getpixel((2400, 1450))

    # Cover star logo (center-right of bottom area)
    draw.rectangle([2480, 1350, 2720, 1520], fill=bg_color)

    # Cover arrow/triangle on far right
    draw.rectangle([2650, 1380, 2816, 1500], fill=bg_color)

    img.save(image_path)
    print(f"Logo masked in {image_path}")

if __name__ == "__main__":
    mask_logo()
