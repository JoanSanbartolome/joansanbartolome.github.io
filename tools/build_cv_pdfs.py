"""Genera los CV en PDF que enlaza la web a partir del HTML de tools/cv/.

Uso (desde la raíz del repositorio):
    python tools/build_cv_pdfs.py [--browser RUTA_A_CHROME_O_EDGE]

Crea:
    assets/docs/Joan_San_Bartolome_Ferri_CV_ES.pdf   desde tools/cv/cv_web_es.html
    assets/docs/Joan_San_Bartolome_Ferri_CV_EN.pdf   desde tools/cv/cv_web_en.html

tools/cv/*.html son copias de los CV v3 (empleabilidad_ia/ruta_al_silicio/datos/cv/
cv_v3_es_fuente.html y cv_v3_fuente.html) con un único cambio: sin ubicación personal
(cabecera «Valencia, España/Spain» y la línea del bar sin ciudad). Si cambia el CV
original, vuelve a copiarlo y repite solo esas dos ediciones.

Imprime con un Chromium instalado (Chrome o Edge) en modo headless, respetando el
@page del HTML (A4, sin márgenes) y sin cabecera ni pie del navegador. Se puede
indicar el ejecutable con --browser o con la variable de entorno CV_BROWSER.
El HTML pide «Liberation Sans»; si no está instalada, Chromium usa Arial, que tiene
las mismas métricas, así que la maquetación no cambia.
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "cv"
OUT = ROOT / "assets" / "docs"

JOBS = [
    (SRC / "cv_web_es.html", OUT / "Joan_San_Bartolome_Ferri_CV_ES.pdf"),
    (SRC / "cv_web_en.html", OUT / "Joan_San_Bartolome_Ferri_CV_EN.pdf"),
]

CANDIDATES = [
    Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
    Path("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
    Path(os.environ.get("LOCALAPPDATA", "~")) / "Google/Chrome/Application/chrome.exe",
    Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
    Path("C:/Program Files/Microsoft/Edge/Application/msedge.exe"),
    Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
    Path("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
]
PATH_NAMES = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome", "msedge"]


def find_browser(explicit: str | None) -> Path:
    """Devuelve la ruta del primer Chromium disponible."""
    if explicit:
        path = Path(explicit)
        if not path.exists():
            sys.exit(f"No existe el navegador indicado: {path}")
        return path
    for path in CANDIDATES:
        if path.exists():
            return path
    for name in PATH_NAMES:
        found = shutil.which(name)
        if found:
            return Path(found)
    sys.exit("No se encontró Chrome ni Edge. Indica la ruta con --browser o CV_BROWSER.")


def print_pdf(browser: Path, html: Path, pdf: Path) -> None:
    """Imprime html en pdf con Chromium headless (perfil temporal para no chocar con un navegador abierto)."""
    pdf.parent.mkdir(parents=True, exist_ok=True)
    tmp_pdf = pdf.with_suffix(".tmp.pdf")
    tmp_pdf.unlink(missing_ok=True)
    with tempfile.TemporaryDirectory(prefix="cv_pdf_") as profile:
        cmd = [
            str(browser),
            "--headless=new",
            "--disable-gpu",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-extensions",
            f"--user-data-dir={profile}",
            "--no-pdf-header-footer",
            f"--print-to-pdf={tmp_pdf}",
            html.resolve().as_uri(),
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
    if not tmp_pdf.exists() or tmp_pdf.stat().st_size == 0:
        sys.exit(f"El navegador no generó {pdf.name}")
    tmp_pdf.replace(pdf)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--browser", default=os.environ.get("CV_BROWSER"), help="ruta a chrome.exe o msedge.exe")
    args = parser.parse_args()

    browser = find_browser(args.browser)
    print(f"Navegador: {browser}")
    for html, pdf in JOBS:
        if not html.exists():
            sys.exit(f"Falta el HTML fuente: {html}")
        print_pdf(browser, html, pdf)
        print(f"{pdf.relative_to(ROOT)}: {pdf.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
