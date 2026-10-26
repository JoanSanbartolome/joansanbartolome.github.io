"""Convierte una imagen a WebP optimizado para la web.

Uso:
    python tools/optimize_image.py ORIGEN DESTINO.webp [--max-width 1400] [--quality 82] [--lossless]

Mantiene la proporción, nunca amplía, respeta la orientación EXIF (gira la imagen y
después descarta el EXIF) y conserva el perfil de color ICC. Solo guarda canal alfa si
la imagen tiene transparencia real. Usa --lossless para esquemas, diagramas y capturas
con texto, donde la compresión con pérdidas emborrona los bordes.
Imprime el tamaño final (ancho x alto) para usarlo en los atributos width/height del <img>.
"""

import argparse
from pathlib import Path

from PIL import Image, ImageOps


def has_transparency(im: Image.Image) -> bool:
    """True si la imagen tiene canal alfa o color transparente en la paleta."""
    return im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info)


def optimize(src: Path, dst: Path, max_width: int, quality: int, lossless: bool = False) -> tuple[int, int]:
    with Image.open(src) as im:
        icc_profile = im.info.get("icc_profile")
        im = ImageOps.exif_transpose(im)
        im = im.convert("RGBA" if has_transparency(im) else "RGB")
        if im.width > max_width:
            height = round(im.height * max_width / im.width)
            im = im.resize((max_width, height), Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        options = {"quality": quality, "method": 6, "lossless": lossless}
        if icc_profile:
            options["icc_profile"] = icc_profile
        im.save(dst, "WEBP", **options)
        return im.size


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("src", type=Path)
    parser.add_argument("dst", type=Path)
    parser.add_argument("--max-width", type=int, default=1400)
    parser.add_argument("--quality", type=int, default=82,
                        help="0-100; con --lossless indica el esfuerzo de compresión, no la calidad")
    parser.add_argument("--lossless", action="store_true", help="WebP sin pérdidas (esquemas y capturas con texto)")
    args = parser.parse_args()

    if not 0 <= args.quality <= 100:
        parser.error("--quality debe estar entre 0 y 100")
    if args.max_width <= 0:
        parser.error("--max-width debe ser mayor que 0")
    if args.src.resolve() == args.dst.resolve():
        parser.error("ORIGEN y DESTINO deben ser archivos distintos")

    width, height = optimize(args.src, args.dst, args.max_width, args.quality, args.lossless)
    size_kb = args.dst.stat().st_size / 1024
    print(f"{args.dst} {width}x{height} {size_kb:.0f} KB")


if __name__ == "__main__":
    main()
