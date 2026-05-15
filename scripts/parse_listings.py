#!/usr/bin/env python3
"""
parse_listings.py
=================
Parsea los HTMLs guardados de cada categoría (listados/1.html ... 7.html)
y el detalle de máquina (desc.html) para generar archivos JSON propios.

Salida:
  public/data/machines.json          → todas las máquinas combinadas
  public/data/category_1.json        → por categoría
  ...
  public/data/category_7.json

Para imágenes:
  • Si el src guardado empieza con "./N_files/eyJ..."  → el nombre del archivo
    ES la clave base64 del CDN → se reconstruye la URL CDN completa.
  • Si el src es "./N_files/md5hash.jpg" (imagen previamente procesada)
    → no se puede reconstruir la URL CDN desde el hash; la URL queda null.

Ejecutar desde la raíz del proyecto:
  python3 scripts/parse_listings.py
"""

import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------

LISTADOS_DIR = Path(__file__).parent.parent / "listados"
OUTPUT_DIR   = Path(__file__).parent.parent / "public" / "data"
CDN_BASE     = "https://cdn.machinehub.com/"
S3_BASE      = "https://machine-hub-prod.s3.amazonaws.com/"

CATEGORY_META = {
    1: {"slug": "1-lathe-turning-centers",           "name": "Centros de Torneado"},
    2: {"slug": "2-cnc-machining-centers",            "name": "Centros de Mecanizado CNC"},
    3: {"slug": "3-boring-milling-drilling",          "name": "Mandrinado y Fresado"},
    4: {"slug": "4-grinding-machines",                "name": "Rectificadoras"},
    5: {"slug": "5-edm-machines",                     "name": "EDM"},
    6: {"slug": "6-inspection-tooling-accessories",   "name": "Herramientas e Inspección"},
    7: {"slug": "7-fabrication-sheet-metal",          "name": "Fabricación y Lámina"},
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def reconstruct_image_url(src: str):
    """
    Convierte un src guardado localmente en la URL S3 directa, si es posible.

    Los nombres de archivo eyJ... son base64 truncados a 255 chars (límite macOS).
    Decodificamos el JSON parcial para extraer el S3 key real y construir la URL S3.

    Casos:
      ./1_files/eyJidWNrZXQi...   → https://machine-hub-prod.s3.amazonaws.com/machine-listing-images/...
      ./1_files/abc123def456.jpg  → None  (hash local, no reconstruible)
    """
    import base64
    if not src:
        return None
    # Eliminar el prefijo "./N_files/"
    match = re.match(r"^\./\d+_files/(.+)$", src)
    if not match:
        match = re.match(r"^\./desc_files/(.+)$", src)
    if not match:
        return None
    filename = match.group(1)
    # CDN keys siempre empiezan con "eyJ" (base64 de '{"')
    if not filename.startswith("eyJ"):
        return None
    # El filename está truncado a 255 chars por el sistema de archivos.
    # Decodificamos el JSON parcial para extraer el 'key' de la imagen.
    try:
        padded = filename + "=" * (4 - len(filename) % 4)
        decoded = base64.b64decode(padded).decode("utf-8", errors="replace")
        key_match = re.search(r'"key":"([^"]+)"', decoded)
        if not key_match:
            return None
        key = key_match.group(1).replace("\\/", "/")
        return S3_BASE + key
    except Exception:
        return None


def slugify_title(title: str) -> str:
    """Genera un slug URL-amigable desde el título de la máquina."""
    s = title.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s


def parse_title(full_title: str) -> tuple[str, str, str]:
    """
    Separa 'YYYY BRAND MODEL' en (year, brand, model).
    Ej: '2016 HAAS UMC-750' → ('2016', 'HAAS', 'UMC-750')
    """
    parts = full_title.strip().split()
    if not parts:
        return ("", "", full_title)
    year = parts[0] if re.match(r"^\d{4}$", parts[0]) else ""
    if year:
        brand = parts[1] if len(parts) > 1 else ""
        model = " ".join(parts[2:]) if len(parts) > 2 else ""
    else:
        brand = parts[0] if len(parts) > 0 else ""
        model = " ".join(parts[1:]) if len(parts) > 1 else ""
    return year, brand, model


# ---------------------------------------------------------------------------
# Parser de listado (N.html)
# ---------------------------------------------------------------------------

def parse_listing(html_path: Path, category_id: int) -> list[dict]:
    """
    Extrae las tarjetas de producto de un HTML de listado guardado.
    Devuelve lista de dicts con los datos de cada máquina.
    """
    content = html_path.read_text(encoding="utf-8", errors="ignore")
    cat = CATEGORY_META[category_id]
    machines = []
    seen_stocks = set()

    # Cada máquina está en un <div class="tt-product ...">
    # Buscamos el bloque completo de cada tarjeta de producto.
    # Usamos los patrones del HTML generado por Angular.
    #
    # Patrón: encontrar bloques que contienen tanto imagen como stock number.

    # 1) Extraer todos los pares (img_src, alt, stock, machine_url)
    #    El HTML tiene la estructura repetitiva:
    #    <span class="tt-img"><img ... src="..." alt="TITLE"></span>
    #    ...
    #    <div class="tt-price">Stock #XXXXX</div>
    #    ...
    #    href="...app/machine/STOCK/slug"

    # Dividir por tarjetas usando el marcador de tarjeta de producto
    card_split = re.split(r'class="tt-product[^"]*"', content)
    # card_split[0] es el encabezado; cada elemento siguiente es el contenido de una tarjeta
    for card_html in card_split[1:]:
        # Imagen (la primera img en la tarjeta)
        img_match = re.search(
            r'<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"',
            card_html
        )
        if not img_match:
            img_match = re.search(
                r'<img[^>]+alt="([^"]*)"[^>]+src="([^"]+)"',
                card_html
            )
            if img_match:
                alt_title = img_match.group(1)
                raw_src   = img_match.group(2)
            else:
                continue
        else:
            raw_src   = img_match.group(1)
            alt_title = img_match.group(2)

        # Filtrar imágenes que no sean de máquinas (logos, etc.)
        if not alt_title or len(alt_title) < 5:
            continue
        # Verificar que parece un año al inicio
        if not re.match(r"^\d{4}", alt_title.strip()):
            continue

        # Stock number
        stock_match = re.search(r"Stock #([A-Z0-9]+)", card_html)
        if not stock_match:
            continue
        stock = stock_match.group(1)

        if stock in seen_stocks:
            continue
        seen_stocks.add(stock)

        # URL de la máquina (desde el enlace de WhatsApp, URL-encoded)
        url_match = re.search(
            r"prod--tramar-prod\.us-east5\.hosted\.app(?:%2F|/)machine(?:%2F|/)([^\s\"&']+)",
            card_html
        )
        if url_match:
            raw_slug = unquote(url_match.group(1))
            machine_slug = raw_slug.rstrip("%")
        else:
            machine_slug = ""

        # Datos del título
        full_title = alt_title.strip()
        year, brand, model = parse_title(full_title)

        # Imagen CDN
        image_url = reconstruct_image_url(raw_src)

        machines.append({
            "id":           stock.lower(),
            "stock":        stock,
            "title":        full_title,
            "year":         year,
            "brand":        brand,
            "model":        model,
            "category_id":  category_id,
            "category_name": cat["name"],
            "category_slug": cat["slug"],
            "image_url":    image_url,
            "machine_slug": machine_slug,
            "specs":        {},       # se llena desde el detalle (desc.html)
        })

    return machines


# ---------------------------------------------------------------------------
# Parser de detalle (desc.html)  — extrae specs para UNA máquina de ejemplo
# ---------------------------------------------------------------------------

def parse_detail(html_path: Path) -> dict:
    """
    Parsea una página de detalle guardada (desc.html).
    Devuelve un dict con todos los datos disponibles.
    """
    content = html_path.read_text(encoding="utf-8", errors="ignore")

    # Título
    title_m = re.search(r"<title>([^<]+)</title>", content)
    page_title = title_m.group(1) if title_m else ""
    # El título de la máquina real está en <strong>YEAR BRAND MODEL</strong>
    machine_title_m = re.search(
        r'class="print-product-title"[^>]*><strong[^>]*>([^<]+)</strong>',
        content
    )
    if not machine_title_m:
        machine_title_m = re.search(r"<h1[^>]*><strong[^>]*>([^<]+)</strong>", content)
    machine_title = machine_title_m.group(1).strip() if machine_title_m else ""

    # Stock
    stock_m = re.search(r"Stock #([A-Z0-9]+)", content)
    stock = stock_m.group(1) if stock_m else ""

    # Año
    year_m = re.search(r'class="print-year"[^>]*>.*?</strong>\s*(\d{4})', content, re.DOTALL)
    year = year_m.group(1) if year_m else ""

    # Highlights
    highlights_m = re.search(
        r'class="print-highlights"[^>]*>(.*?)</div>',
        content, re.DOTALL
    )
    highlights_raw = highlights_m.group(1) if highlights_m else ""
    highlights = [
        re.sub(r"<[^>]+>", "", h).strip()
        for h in highlights_raw.split("<br>")
        if re.sub(r"<[^>]+>", "", h).strip()
    ]

    # Especificaciones (clave → valor)
    specs = {}
    spec_rows = re.findall(
        r'class="print-spec-key"[^>]*>([^<]+)</div>\s*'
        r'<div[^>]*class="print-spec-value"[^>]*>([^<]+)</div>',
        content
    )
    for key, val in spec_rows:
        specs[key.strip()] = val.strip()

    # Descripción
    desc_m = re.search(
        r'class="print-description"[^>]*>(.*?)</div>',
        content, re.DOTALL
    )
    description_html = desc_m.group(1).strip() if desc_m else ""
    description = re.sub(r"<[^>]+>", " ", description_html).strip()
    description = re.sub(r"\s+", " ", description)

    # Imágenes
    images: list[str] = []
    all_imgs = re.findall(r'<img[^>]+src="([^"]+)"', content)
    for src in all_imgs:
        url = reconstruct_image_url(src)
        if url:
            images.append(url)

    # Machine slug desde la URL guardada
    saved_url_m = re.search(r"saved from url\([^)]+\)([^\s]+)", content)
    machine_slug = ""
    if saved_url_m:
        full_url = saved_url_m.group(1)
        slug_m = re.search(r"/machine/(.+?)(?:\s|$)", full_url)
        machine_slug = slug_m.group(1) if slug_m else ""

    year_parsed, brand, model = parse_title(machine_title)

    return {
        "id":            stock.lower(),
        "stock":         stock,
        "title":         machine_title,
        "year":          year or year_parsed,
        "brand":         brand,
        "model":         model,
        "machine_slug":  machine_slug,
        "image_url":     images[0] if images else None,
        "images":        images,
        "highlights":    highlights,
        "specs":         specs,
        "description":   description,
        "page_title":    page_title,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    all_machines: list[dict] = []
    categories_index: list[dict] = []

    # ---- Parsear cada listado HTML ----
    for cat_id in range(1, 8):
        html_file = LISTADOS_DIR / f"{cat_id}.html"
        if not html_file.exists():
            print(f"  [SKIP] {html_file} no encontrado", file=sys.stderr)
            continue

        machines = parse_listing(html_file, cat_id)
        print(f"  Cat {cat_id} ({CATEGORY_META[cat_id]['name']}): {len(machines)} máquinas")

        # Guardar JSON por categoría
        cat_json_path = OUTPUT_DIR / f"category_{cat_id}.json"
        cat_data = {
            "category_id":   cat_id,
            "category_name": CATEGORY_META[cat_id]["name"],
            "category_slug": CATEGORY_META[cat_id]["slug"],
            "total":         len(machines),
            "machines":      machines,
        }
        cat_json_path.write_text(
            json.dumps(cat_data, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        print(f"    → {cat_json_path}")

        categories_index.append({
            "id":    cat_id,
            "name":  CATEGORY_META[cat_id]["name"],
            "slug":  CATEGORY_META[cat_id]["slug"],
            "total": len(machines),
        })
        all_machines.extend(machines)

    # ---- Parsear detalle de ejemplo (desc.html) ----
    desc_file = LISTADOS_DIR.parent / "desc.html"
    if desc_file.exists():
        detail = parse_detail(desc_file)
        detail_path = OUTPUT_DIR / "machine_example_detail.json"
        detail_path.write_text(
            json.dumps(detail, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        print(f"\nDetalle de ejemplo: {detail_path}")
        print(f"  Máquina: {detail['title']}  (Stock #{detail['stock']})")
        print(f"  Specs extraídas: {list(detail['specs'].keys())[:6]} ...")
        print(f"  Imágenes CDN: {len(detail['images'])}")

        # Enriquecer la máquina correspondiente en all_machines con sus specs
        for m in all_machines:
            if m["stock"] == detail["stock"]:
                m["specs"]       = detail["specs"]
                m["highlights"]  = detail["highlights"]
                m["description"] = detail["description"]
                m["images"]      = detail["images"]
                break

    # ---- JSON combinado ----
    combined = {
        "generated_at": "2026-05-14",
        "total":        len(all_machines),
        "categories":   categories_index,
        "machines":     all_machines,
    }
    combined_path = OUTPUT_DIR / "machines.json"
    combined_path.write_text(
        json.dumps(combined, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nCombinado: {combined_path}  ({len(all_machines)} máquinas en total)")


if __name__ == "__main__":
    main()
