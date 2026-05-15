#!/usr/bin/env python3
"""
scrape_details.py
=================
Scrapes detail pages for all machines using Playwright (headless Chromium).

For each machine in public/data/machines.json that has a machine_slug:
  - Loads https://prod--tramar-prod.us-east5.hosted.app/machine/{slug}
  - Extracts specs, description, and images
  - Saves to public/data/machines/{stock}.json

Resume-safe: skips machines already scraped.
Run from project root:
  python3 scripts/scrape_details.py
  python3 scripts/scrape_details.py --force   # re-scrape all
  python3 scripts/scrape_details.py --limit 10  # only first N machines
"""

import argparse
import base64
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

MIN_IMAGE_SIZE = 10 * 1024  # 10 KB


def image_size(url: str) -> int:
    """Return Content-Length of a URL in bytes, or 0 on error."""
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=10) as resp:
            return int(resp.headers.get("Content-Length", 0))
    except Exception:
        return 0

BASE_URL = "https://prod--tramar-prod.us-east5.hosted.app/machine/"
DATA_DIR = Path(__file__).parent.parent / "public" / "data"
MACHINES_DIR = DATA_DIR / "machines"
MACHINES_JSON = DATA_DIR / "machines.json"


def cdn_to_s3(cdn_url: str) -> str:
    """Convert cdn.machinehub.com URL to direct S3 URL."""
    b64 = cdn_url.replace("https://cdn.machinehub.com/", "")
    padded = b64 + "=" * (4 - len(b64) % 4)
    try:
        decoded = base64.b64decode(padded).decode("utf-8", errors="replace")
        m = re.search(r'"key":"([^"]+)"', decoded)
        if m:
            key = m.group(1).replace("\\/", "/")
            return f"https://machine-hub-prod.s3.amazonaws.com/{key}"
    except Exception:
        pass
    return cdn_url


def scrape_machine(page, stock: str, slug: str) -> dict:
    """Scrape a single machine detail page. Returns dict with specs/images/desc."""
    url = BASE_URL + slug
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(3500)
    except Exception as e:
        print(f"    TIMEOUT/ERROR loading {url}: {e}")
        return {}

    # Specs
    specs = {}
    for row in page.query_selector_all(".specs-row"):
        k_el = row.query_selector(".spec-key")
        v_el = row.query_selector(".spec-value")
        if k_el and v_el:
            k = k_el.inner_text().strip()
            v = v_el.inner_text().strip()
            if k:
                specs[k] = v

    # Description
    desc_el = page.query_selector(".spec-description-text")
    description = desc_el.inner_text().strip() if desc_el else ""

    # Images — CDN URLs converted to S3
    # Scope to the main product gallery only (.swiper-product-main) to avoid
    # capturing images from related products or other page sections.
    images = []
    seen = set()
    gallery_imgs = page.query_selector_all('.swiper-product-main img[src*="cdn.machinehub"]')
    # Fallback to all cdn imgs if gallery container not found (edge case)
    if not gallery_imgs:
        gallery_imgs = page.query_selector_all('img[src*="cdn.machinehub"]')
    for img in gallery_imgs:
        src = img.get_attribute("src") or ""
        if not src:
            continue
        s3 = cdn_to_s3(src)
        if s3 not in seen:
            if image_size(s3) < MIN_IMAGE_SIZE:
                continue
            seen.add(s3)
            images.append(s3)

    return {
        "specs": specs,
        "description": description,
        "images": images,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Re-scrape already scraped machines")
    parser.add_argument("--limit", type=int, default=0, help="Only scrape first N machines")
    args = parser.parse_args()

    MACHINES_DIR.mkdir(parents=True, exist_ok=True)

    with open(MACHINES_JSON) as f:
        data = json.load(f)

    machines = [m for m in data["machines"] if m.get("machine_slug")]
    if args.limit:
        machines = machines[: args.limit]

    if not args.force:
        machines = [m for m in machines if not (MACHINES_DIR / f"{m['stock']}.json").exists()]

    total = len(machines)
    if total == 0:
        print("Nothing to scrape. Use --force to re-scrape.")
        return

    print(f"Machines to scrape: {total}")
    print("Starting Playwright...\n")

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()

        for i, machine in enumerate(machines, 1):
            stock = machine["stock"]
            slug = machine["machine_slug"]
            out_path = MACHINES_DIR / f"{stock}.json"

            print(f"[{i}/{total}] Stock #{stock} — {machine['title'][:50]}")

            detail = scrape_machine(page, stock, slug)

            if detail:
                # Merge base machine data with scraped detail
                result = {**machine, **detail}
                # If scraper found images and machine had no image_url, use first
                if not result.get("image_url") and detail.get("images"):
                    result["image_url"] = detail["images"][0]
                with open(out_path, "w") as f:
                    json.dump(result, f, ensure_ascii=False, indent=2)
                print(f"    ✓ {len(detail['specs'])} specs, {len(detail['images'])} images")
            else:
                # Save base machine data so it won't be retried unless --force
                with open(out_path, "w") as f:
                    json.dump({**machine, "specs": {}, "description": "", "images": []}, f, ensure_ascii=False, indent=2)
                print(f"    ✗ Failed — saved stub")

            # Small delay to avoid hammering the server
            if i < total:
                time.sleep(0.5)

        browser.close()

    print(f"\nDone. {total} machines scraped to {MACHINES_DIR}/")

    # Also update machines.json with any image_url improvements
    updated = 0
    with open(MACHINES_JSON) as f:
        all_data = json.load(f)

    for m in all_data["machines"]:
        detail_path = MACHINES_DIR / f"{m['stock']}.json"
        if detail_path.exists():
            with open(detail_path) as f:
                d = json.load(f)
            if not m.get("image_url") and d.get("image_url"):
                m["image_url"] = d["image_url"]
                updated += 1
            if not m.get("specs") and d.get("specs"):
                m["specs"] = d["specs"]
                updated += 1

    with open(MACHINES_JSON, "w") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    if updated:
        print(f"Updated machines.json with {updated} improvements.")


if __name__ == "__main__":
    main()
