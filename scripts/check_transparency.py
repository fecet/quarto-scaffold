from PIL import Image
import sys

def check_transparency(image_path):
    try:
        img = Image.open(image_path)
        if img.mode == 'RGBA':
            alpha = img.getchannel('A')
            bbox = alpha.getbbox()
            extrema = alpha.getextrema()
            print(f"Image: {image_path}")
            print(f"  Mode: {img.mode}")
            print(f"  Alpha extrema: {extrema}")
            if extrema[0] < 255:
                print("  Status: HAS actual transparency.")
            else:
                print("  Status: mode is RGBA but all pixels are OPAQUE.")
        else:
            print(f"Image: {image_path}")
            print(f"  Mode: {img.mode}")
            print("  Status: NO alpha channel.")
    except Exception as e:
        print(f"Error checking {image_path}: {e}")

if __name__ == "__main__":
    check_transparency("/home/rok/fluid-slide/slides/moravecs-paradox/assets/robot-chess-v3.png")
    check_transparency("/home/rok/fluid-slide/slides/moravecs-paradox/assets/robot-sock-v3.png")
