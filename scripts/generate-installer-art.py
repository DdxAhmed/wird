"""Regenerate the 24-bit BMP art required by electron-builder's assisted NSIS UI."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / 'resources'
NAVY, SURFACE, PURPLE, GOLD = '#111827', '#1B2435', '#A99BF7', '#E3BD79'

def make(width: int, height: int, output: str) -> None:
    image = Image.new('RGB', (width, height), NAVY)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, width - 1, height - 1), outline='#303a50', width=2)
    draw.ellipse((width * .21, height * .14, width * .7, height * .14 + width * .49), fill=GOLD)
    draw.ellipse((width * .34, height * .07, width * .83, height * .07 + width * .49), fill=NAVY)
    draw.ellipse((width * .75, height * .13, width * .79, height * .13 + width * .04), fill=PURPLE)
    if height > 100:
        for y, length in [(205, 92), (230, 116), (255, 73)]:
            draw.rounded_rectangle((23, y, 23 + length, y + 3), radius=2, fill=PURPLE if y == 205 else '#66728b')
        draw.rounded_rectangle((22, 280, 142, 283), radius=2, fill=GOLD)
    else:
        draw.rounded_rectangle((92, 23, 133, 26), radius=2, fill=PURPLE)
        draw.rounded_rectangle((92, 33, 124, 36), radius=2, fill=GOLD)
    image.save(ROOT / output, format='BMP')

make(150, 57, 'installerHeader.bmp')
make(164, 314, 'installerSidebar.bmp')
