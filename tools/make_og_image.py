"""Genera las imágenes de redes sociales e iconos del sitio.

Uso (desde la raíz del repositorio):
    python tools/make_og_image.py

Crea:
    assets/img/og-image.jpg          1200x630, tarjeta Open Graph / Twitter (<200 KB; avisa si se supera)
    assets/img/apple-touch-icon.png  180x180, icono para iOS (equivalente a favicon.svg)

Requiere Pillow. Usa fuentes del sistema (Segoe UI / Consolas en Windows,
DejaVu en Linux) y, si no encuentra ninguna, la fuente por defecto de Pillow.
Los textos largos se reducen hasta caber, así que el nombre nunca pisa la foto.
"""

import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
MAX_OG_KB = 200  # límite recomendado para que las redes sociales muestren la vista previa

# Paleta: debe coincidir con los tokens de assets/css/base.css (:root). Si cambian allí,
# actualízalos aquí y vuelve a ejecutar el script.
BG = (8, 7, 10)                 # --bg-base       #08070a
ACCENT = (245, 158, 11)         # --accent        #f59e0b
ACCENT_BRIGHT = (251, 191, 36)  # --accent-bright #fbbf24
COPPER = (194, 65, 12)          # --accent-deep   #c2410c
TEXT = (246, 239, 228)          # --text-main     #f6efe4
MUTED = (169, 159, 144)         # --text-muted    #a99f90

FONT_DIRS = [Path("C:/Windows/Fonts"), Path("/usr/share/fonts/truetype/dejavu"), Path("/Library/Fonts")]
FONTS = {
    "bold": ["segoeuib.ttf", "Inter-Bold.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"],
    "semibold": ["seguisb.ttf", "segoeuib.ttf", "Inter-SemiBold.ttf", "DejaVuSans-Bold.ttf", "arialbd.ttf"],
    "regular": ["segoeui.ttf", "Inter-Regular.ttf", "DejaVuSans.ttf", "Arial.ttf", "arial.ttf"],
    "mono": ["JetBrainsMono-Regular.ttf", "CascadiaCode.ttf", "consola.ttf", "DejaVuSansMono.ttf", "Menlo.ttc"],
    "mono_bold": ["JetBrainsMono-Bold.ttf", "consolab.ttf", "CascadiaCode.ttf", "DejaVuSansMono-Bold.ttf"],
}


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    """Devuelve la primera fuente disponible del tipo pedido."""
    for name in FONTS[kind]:
        for folder in FONT_DIRS:
            path = folder / name
            if path.exists():
                return ImageFont.truetype(str(path), size)
    return ImageFont.load_default(size)


def fit_font(d: ImageDraw.ImageDraw, kind: str, size: int, texts: list[str], max_width: float,
             min_size: int = 20) -> ImageFont.FreeTypeFont:
    """Fuente del tipo pedido al mayor tamaño (<= size) con el que todos los textos caben en max_width."""
    while True:
        f = font(kind, size)
        if size <= min_size or max(d.textlength(t, font=f) for t in texts) <= max_width:
            return f
        size -= 1


def radial_glow(size, center, radius, color, alpha):
    """Capa RGBA con un halo radial difuminado."""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color + (alpha,))
    return layer.filter(ImageFilter.GaussianBlur(radius * 0.55))


def draw_chip(d: ImageDraw.ImageDraw, x: int, y: int, s: float, text_font=None):
    """Dibuja el icono de chip (mismo diseño que favicon.svg, viewBox 64) en (x, y) con escala s."""
    def r(a, b, w, h, rad, fill):
        d.rounded_rectangle((x + a * s, y + b * s, x + (a + w) * s, y + (b + h) * s), radius=rad * s, fill=fill)

    for p in (20, 29.5, 39):
        r(p, 5, 5, 9, 1.5, COPPER)
        r(p, 50, 5, 9, 1.5, COPPER)
        r(5, p, 9, 5, 1.5, COPPER)
        r(50, p, 9, 5, 1.5, COPPER)
    r(12, 12, 40, 40, 6, ACCENT)
    if text_font is not None:
        d.text((x + 32 * s, y + 32.5 * s), "JSB", font=text_font, fill=BG, anchor="mm")


def make_apple_touch_icon(path: Path) -> None:
    size = 180
    scale = 4  # se dibuja a 4x y se reduce para suavizar bordes
    big = size * scale
    im = Image.new("RGB", (big, big), BG)
    d = ImageDraw.Draw(im)
    s = big / 64
    draw_chip(d, 0, 0, s, text_font=font("bold", int(17 * s)))
    im = im.resize((size, size), Image.LANCZOS)
    im.save(path, "PNG", optimize=True)


def make_og_image(path: Path) -> None:
    W, H = 1200, 630
    im = Image.new("RGBA", (W, H), BG + (255,))

    # Rejilla sutil ámbar que se desvanece hacia los bordes
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(grid)
    step = 40
    for gx in range(0, W + 1, step):
        g.line((gx, 0, gx, H), fill=ACCENT + (22,), width=1)
    for gy in range(0, H + 1, step):
        g.line((0, gy, W, gy), fill=ACCENT + (22,), width=1)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).ellipse((-200, -260, W + 200, H + 260), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(140))
    grid.putalpha(ImageChops.multiply(grid.getchannel("A"), mask))
    im.alpha_composite(grid)

    # Halos de luz
    im.alpha_composite(radial_glow((W, H), (260, 120), 300, ACCENT, 34))
    im.alpha_composite(radial_glow((W, H), (930, 520), 280, COPPER, 40))

    d = ImageDraw.Draw(im)
    left = 80

    # Geometría de la foto (a la derecha); el texto debe acabar antes de sus esquinas decorativas
    pw, ph = 310, 380
    px, py = W - pw - 84, (H - ph) // 2
    off = 16  # separación de las esquinas de "pad" respecto a la foto
    text_max_w = px - off - 28 - left

    # Cabecera: icono + etiqueta
    draw_chip(d, left, 66, 0.9, text_font=font("bold", 15))
    d.text((left + 74, 95), "// portafolio · portfolio", font=font("mono", 22), fill=ACCENT, anchor="lm")

    # Nombre (se reduce si no cabe antes de la foto)
    name_lines = ["Joan San Bartolomé", "Ferri"]
    name_font = fit_font(d, "bold", 66, name_lines, text_max_w + 3, min_size=40)
    name_step = round(name_font.size * 76 / 66)  # interlineado original: 76 px a 66 px
    d.text((left - 3, 178), name_lines[0], font=name_font, fill=TEXT)
    d.text((left - 3, 178 + name_step), name_lines[1], font=name_font, fill=ACCENT_BRIGHT)

    # Barra de acento y cargo
    d.rounded_rectangle((left, 368, left + 64, 373), radius=3, fill=ACCENT)
    role_lines = ["Ingeniero de Diseño y", "Verificación Digital"]
    role_font = fit_font(d, "semibold", 36, role_lines, text_max_w)
    d.text((left, 392), role_lines[0], font=role_font, fill=TEXT)
    d.text((left, 436), role_lines[1], font=role_font, fill=TEXT)

    # Línea técnica en monoespaciada
    tech = "SystemVerilog · Verificación · FPGA · PCB"
    d.text((left, 506), tech, font=fit_font(d, "mono", 24, [tech], text_max_w, min_size=16), fill=MUTED)

    # Dominio
    dom_font = font("mono_bold", 22)
    d.text((left, 566), "joansanbartolome.es", font=dom_font, fill=ACCENT)

    # Foto a la derecha con borde ámbar
    with Image.open(IMG / "profile.jpg") as src:
        src = ImageOps.exif_transpose(src).convert("RGB")
        # Recorte con la proporción exacta pw:ph (sin estirar), centrado en la cara y pegado arriba
        sw, sh = src.size
        crop_w = min(sw * 0.86, sh * pw / ph)
        crop_h = crop_w * ph / pw
        cx = sw * 0.45
        left_x = min(max(0.0, cx - crop_w / 2), sw - crop_w)
        top = 0.0
        box = (round(left_x), round(top), round(left_x + crop_w), round(top + crop_h))
        photo = src.crop(box).resize((pw, ph), Image.LANCZOS)
    # Halo detrás de la foto
    im.alpha_composite(radial_glow((W, H), (px + pw // 2, py + ph // 2), 230, ACCENT, 50))
    d = ImageDraw.Draw(im)
    radius = 22
    border = 4
    d.rounded_rectangle((px - border, py - border, px + pw + border, py + ph + border),
                        radius=radius + border, fill=ACCENT)
    photo_mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(photo_mask).rounded_rectangle((0, 0, pw - 1, ph - 1), radius=radius, fill=255)
    im.paste(photo, (px, py), photo_mask)

    # Esquinas de "pad" decorativas alrededor de la foto
    c = 18
    for (ax, ay, sx, sy) in ((px - off, py - off, 1, 1), (px + pw + off, py - off, -1, 1),
                             (px - off, py + ph + off, 1, -1), (px + pw + off, py + ph + off, -1, -1)):
        d.line((ax, ay, ax + c * sx, ay), fill=ACCENT_BRIGHT, width=2)
        d.line((ax, ay, ax, ay + c * sy), fill=ACCENT_BRIGHT, width=2)

    out = im.convert("RGB")
    out.save(path, "JPEG", quality=86, optimize=True, progressive=True)


def main() -> None:
    og = IMG / "og-image.jpg"
    icon = IMG / "apple-touch-icon.png"
    make_og_image(og)
    make_apple_touch_icon(icon)
    og_kb = og.stat().st_size / 1024
    print(f"{og.relative_to(ROOT)}: {og_kb:.0f} KB")
    if og_kb > MAX_OG_KB:
        print(f"AVISO: {og.name} supera {MAX_OG_KB} KB; algunas redes pueden no mostrar la vista previa. "
              "Baja la calidad JPEG en make_og_image().", file=sys.stderr)
    print(f"{icon.relative_to(ROOT)}: {icon.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
