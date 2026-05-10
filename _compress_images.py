"""
Compresse toutes les images du camp pour le dépôt Git.
PNG photos → JPEG 82% max 1920px
JPG photos  → JPEG 80% max 1920px
Logos/SVG   → intacts
"""
from PIL import Image
import os, glob

IMG_DIR  = r"assets\images"
HTML_FILE = "index.html"
MAX_PX   = 1920
Q_PNG    = 82   # qualité pour les PNG convertis en JPG
Q_JPG    = 80   # qualité pour les JPG recompressés

# Fichiers à ne pas toucher
SKIP = {"logo-camp-mission-2026.png", "logo.svg", "favicon.svg", "placeholder.svg"}

renames = {}   # {ancien: nouveau}  pour les PNG→JPG

def compress(src, dst, quality, mode="JPEG"):
    img = Image.open(src)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    w, h = img.size
    if w > MAX_PX:
        img = img.resize((MAX_PX, int(h * MAX_PX / w)), Image.LANCZOS)
    img.save(dst, mode, quality=quality, optimize=True, progressive=True)
    before = os.path.getsize(src) / 1024
    after  = os.path.getsize(dst) / 1024
    print(f"  {os.path.basename(src):55s}  {before:6.0f} KB  →  {after:5.0f} KB")
    return after

total_before = total_after = 0

# ── 1. PNG photos numérotées (1.png … 28.png) → JPG ───────────────────────
print("\n=== PNG → JPEG ===")
for i in range(1, 29):
    src = os.path.join(IMG_DIR, f"{i}.png")
    if not os.path.exists(src): continue
    dst = os.path.join(IMG_DIR, f"{i}.jpg")
    before = os.path.getsize(src) / 1024
    compress(src, dst, Q_PNG)
    os.remove(src)
    renames[f"{i}.png"] = f"{i}.jpg"
    total_before += before
    total_after  += os.path.getsize(dst) / 1024

# ── 2. JPG DSC (photos pro) ────────────────────────────────────────────────
print("\n=== DSC JPG ===")
for path in glob.glob(os.path.join(IMG_DIR, "03012010-DSC*.jpg")):
    before = os.path.getsize(path) / 1024
    tmp = path + ".tmp.jpg"
    compress(path, tmp, Q_JPG)
    os.replace(tmp, path)
    total_before += before
    total_after  += os.path.getsize(path) / 1024

# ── 3. WhatsApp JPG ────────────────────────────────────────────────────────
print("\n=== WhatsApp JPG ===")
for path in glob.glob(os.path.join(IMG_DIR, "WhatsApp*.jpg")) + \
            glob.glob(os.path.join(IMG_DIR, "WhatsApp*.jpeg")):
    before = os.path.getsize(path) / 1024
    tmp = path + ".tmp.jpg"
    compress(path, tmp, Q_JPG)
    os.replace(tmp, path)
    total_before += before
    total_after  += os.path.getsize(path) / 1024

# ── 4. Mise à jour des références HTML ────────────────────────────────────
if renames:
    print(f"\n=== HTML: {len(renames)} renommages ===")
    with open(HTML_FILE, encoding="utf-8") as f:
        html = f.read()
    for old, new in renames.items():
        html = html.replace(f"assets/images/{old}", f"assets/images/{new}")
        html = html.replace(f"images/{old}", f"images/{new}")
    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(html)
    print("  index.html mis à jour.")

print(f"\n{'─'*60}")
print(f"  Total avant  : {total_before/1024:.1f} Mo")
print(f"  Total après  : {total_after/1024:.1f} Mo")
print(f"  Réduction    : {100*(1-total_after/total_before):.0f}%")
print(f"{'─'*60}\n")
