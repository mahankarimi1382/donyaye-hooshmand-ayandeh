import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
SCREENSHOTS_DIR = BASE_DIR / "screenshots"

PAGES = [
    {"id": "01_home", "title_en": "Home Page", "title_fa": "صفحه اصلی", "url": "/fa"},
    {"id": "02_products_catalog", "title_en": "Products Catalog", "title_fa": "کاتالوگ جامع نهاده‌ها", "url": "/fa/products"},
    {"id": "03_product_detail_corn", "title_en": "Corn Feed Detail", "title_fa": "مشخصات فنی ذرت دامی", "url": "/fa/products/prd_corn_feed"},
    {"id": "04_product_detail_soybean", "title_en": "Soybean Meal Detail", "title_fa": "مشخصات فنی کنجاله سویا", "url": "/fa/products/prd_soybean_meal"},
    {"id": "05_product_detail_barley", "title_en": "Barley Feed Detail", "title_fa": "مشخصات فنی جو دامی", "url": "/fa/products/prd_barley_feed"},
    {"id": "06_rfq_inquiry_form", "title_en": "RFQ Inquiry Form", "title_fa": "سامانه استعلام رسمی", "url": "/fa/rfq"},
    {"id": "07_track_shipment", "title_en": "Shipment Tracking", "title_fa": "سامانه رهگیری بارنامه", "url": "/fa/track"},
    {"id": "08_quality_assays_faq", "title_en": "Quality & Inspection", "title_fa": "کنترل کیفیت و آنالیز", "url": "/fa/quality"},
    {"id": "09_about_company", "title_en": "About Company", "title_fa": "درباره شرکت و پایانه‌ها", "url": "/fa/about"},
    {"id": "10_export_history", "title_en": "Export History", "title_fa": "پایانه‌ها و سوابق صادرات", "url": "/fa/about/export-history"},
    {"id": "11_services_logistics", "title_en": "Trade & Logistics Services", "title_fa": "خدمات انبارداری و لجستیک", "url": "/fa/services"},
    {"id": "12_service_sourcing", "title_en": "Sourcing Service", "title_fa": "خدمت تخصصی تأمین نهاده", "url": "/fa/services/sourcing"},
    {"id": "13_service_logistics", "title_en": "Logistics & Freight", "title_fa": "خدمت حمل‌ونقل و ترانزیت", "url": "/fa/services/logistics"},
    {"id": "14_markets_corridors", "title_en": "Markets & Incoterms", "title_fa": "کریدورها و شرایط تحویل", "url": "/fa/markets"},
    {"id": "15_contact_offices", "title_en": "Contact & Offices", "title_fa": "تماس، دفاتر و شعب", "url": "/fa/contact"},
    {"id": "16_terms_of_trade", "title_en": "Terms of Trade", "title_fa": "شرایط و ضوابط بازرگانی", "url": "/fa/terms"},
    {"id": "17_privacy_policy", "title_en": "Privacy Policy", "title_fa": "حریم خصوصی و محرمانگی داده‌ها", "url": "/fa/privacy"},
    {"id": "18_customer_portal", "title_en": "Customer Portal", "title_fa": "پورتال مشتریان و همکاران", "url": "/fa/portal"}
]

# Color palette
COLOR_BG = (16, 40, 32)         # #102820 Dark Forest
COLOR_CARD_BG = (27, 67, 50)    # #1B4332 Forest Green
COLOR_GOLD = (201, 154, 58)     # #C99A3A Grain Gold
COLOR_TEXT_WHITE = (255, 255, 255)
COLOR_TEXT_MUTED = (163, 184, 173) # #A3B8AD
COLOR_BORDER = (45, 95, 75)

def get_fonts():
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/tahoma.ttf", 20)
        font_main_title = ImageFont.truetype("C:/Windows/Fonts/tahoma.ttf", 36)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/tahoma.ttf", 15)
        font_url = ImageFont.truetype("C:/Windows/Fonts/tahoma.ttf", 13)
    except Exception:
        font_title = ImageFont.load_default()
        font_main_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_url = ImageFont.load_default()
    return font_main_title, font_title, font_sub, font_url

def build_grid_poster():
    print("\n--- Building Grid Poster via PIL ---")
    font_main_title, font_title, font_sub, font_url = get_fonts()

    cols = 3
    rows = 6
    tile_w = 700
    tile_h = 438
    card_header_h = 40
    card_footer_h = 30
    total_card_h = card_header_h + tile_h + card_footer_h
    
    pad_x = 24
    pad_y = 24
    margin_x = 40
    header_h = 160
    margin_bottom = 40

    total_w = margin_x * 2 + (cols * tile_w) + ((cols - 1) * pad_x)
    total_h = header_h + (rows * total_card_h) + ((rows - 1) * pad_y) + margin_bottom

    grid_img = Image.new("RGB", (total_w, total_h), COLOR_BG)
    draw = ImageDraw.Draw(grid_img)

    # Top Header
    header_title = "Donyaye Hooshmand Ayandeh — Full Platform Pages Overview"
    header_sub = "18 Active Pages | B2B Animal Feed & Grain Procurement Platform | Material 3 & RTL System"
    draw.text((margin_x, 40), header_title, fill=COLOR_GOLD, font=font_main_title)
    draw.text((margin_x, 95), header_sub, fill=COLOR_TEXT_MUTED, font=font_title)
    draw.line([(margin_x, 140), (total_w - margin_x, 140)], fill=COLOR_GOLD, width=2)

    for idx, page in enumerate(PAGES):
        col = idx % cols
        row = idx // cols

        card_x = margin_x + col * (tile_w + pad_x)
        card_y = header_h + row * (total_card_h + pad_y)

        # Draw Card Background
        draw.rectangle(
            [(card_x, card_y), (card_x + tile_w, card_y + total_card_h)],
            fill=COLOR_CARD_BG,
            outline=COLOR_BORDER,
            width=1
        )

        # Draw Header Bar
        num_str = f"[{str(idx + 1).zfill(2)}]"
        card_title = f"{num_str} {page['title_en']}"
        draw.text((card_x + 12, card_y + 10), card_title, fill=COLOR_TEXT_WHITE, font=font_title)

        # Paste Viewport Screenshot
        img_path = SCREENSHOTS_DIR / f"{page['id']}_viewport.png"
        if img_path.exists():
            with Image.open(img_path) as shot:
                shot_resized = shot.resize((tile_w, tile_h), Image.Resampling.LANCZOS)
                grid_img.paste(shot_resized, (card_x, card_y + card_header_h))

        # Draw Footer Bar
        url_text = f"URL: https://donyaye-hooshmand.ir{page['url']}"
        draw.text((card_x + 12, card_y + card_header_h + tile_h + 7), url_text, fill=COLOR_TEXT_MUTED, font=font_url)

    out_file = BASE_DIR / "all_pages_grid.png"
    grid_img.save(out_file, quality=95)
    print(f"Saved: {out_file} ({grid_img.size})")

def build_vertical_stitched():
    print("\n--- Building Vertical Stitched Image via PIL ---")
    font_main_title, font_title, font_sub, font_url = get_fonts()

    card_w = 1440
    margin_x = 40
    spacing = 30
    header_h = 160
    card_bar_h = 50
    margin_bottom = 50

    # Calculate total height
    resized_shots = []
    total_content_h = 0
    print("Pre-measuring images...")
    for idx, page in enumerate(PAGES):
        img_path = SCREENSHOTS_DIR / f"{page['id']}_full.png"
        if img_path.exists():
            shot = Image.open(img_path)
            orig_w, orig_h = shot.size
            new_h = int((card_w / orig_w) * orig_h)
            resized_shots.append((page, shot, new_h))
            total_content_h += card_bar_h + new_h + spacing
        else:
            print(f"Warning: {img_path} not found!")

    total_w = card_w + margin_x * 2
    total_h = header_h + total_content_h + margin_bottom

    print(f"Stitched canvas size: {total_w} x {total_h}")
    stitched_img = Image.new("RGB", (total_w, total_h), COLOR_BG)
    draw = ImageDraw.Draw(stitched_img)

    # Document Header
    draw.text((margin_x, 40), "Donyaye Hooshmand Ayandeh — All Platform Pages (Full Length)", fill=COLOR_GOLD, font=font_main_title)
    draw.text((margin_x, 95), "High-Resolution Complete Page Scrolls | 18 Routes | Feed & Agri Trading Platform", fill=COLOR_TEXT_MUTED, font=font_title)
    draw.line([(margin_x, 140), (total_w - margin_x, 140)], fill=COLOR_GOLD, width=2)

    current_y = header_h
    for idx, (page, shot, new_h) in enumerate(resized_shots):
        num_str = f"[{str(idx + 1).zfill(2)} / {str(len(PAGES)).zfill(2)}]"
        card_title = f"{num_str} {page['title_en']} — https://donyaye-hooshmand.ir{page['url']}"

        # Draw card top bar
        draw.rectangle(
            [(margin_x, current_y), (margin_x + card_w, current_y + card_bar_h)],
            fill=COLOR_CARD_BG,
            outline=COLOR_BORDER,
            width=1
        )
        draw.text((margin_x + 16, current_y + 14), card_title, fill=COLOR_GOLD, font=font_title)

        # Resize and paste image
        shot_resized = shot.resize((card_w, new_h), Image.Resampling.LANCZOS)
        stitched_img.paste(shot_resized, (margin_x, current_y + card_bar_h))
        shot.close()

        current_y += card_bar_h + new_h + spacing

    out_file = BASE_DIR / "all_pages_stitched.png"
    stitched_img.save(out_file, quality=92)
    print(f"Saved: {out_file} ({stitched_img.size})")

def build_pdf_document():
    print("\n--- Building Master PDF via PIL ---")
    pdf_pages = []
    
    font_main_title, font_title, font_sub, font_url = get_fonts()
    page_w = 1920
    page_h = 1200
    bar_h = 70

    for idx, page in enumerate(PAGES):
        img_path = SCREENSHOTS_DIR / f"{page['id']}_viewport.png"
        if not img_path.exists():
            continue

        canvas = Image.new("RGB", (page_w, page_h), COLOR_BG)
        draw = ImageDraw.Draw(canvas)

        # Top Bar
        draw.rectangle([(0, 0), (page_w, bar_h)], fill=COLOR_CARD_BG)
        draw.line([(0, bar_h), (page_w, bar_h)], fill=COLOR_GOLD, width=2)

        num_str = f"{str(idx + 1).zfill(2)} / {str(len(PAGES)).zfill(2)}"
        title_text = f"Page {num_str}: {page['title_en']} ({page['url']})"
        draw.text((25, 20), title_text, fill=COLOR_TEXT_WHITE, font=font_title)
        draw.text((page_w - 380, 22), "Donyaye Hooshmand Ayandeh", fill=COLOR_GOLD, font=font_title)

        # Screenshot fit
        with Image.open(img_path) as shot:
            avail_w = page_w - 40
            avail_h = page_h - bar_h - 40
            orig_w, orig_h = shot.size
            ratio = min(avail_w / orig_w, avail_h / orig_h)
            fit_w = int(orig_w * ratio)
            fit_h = int(orig_h * ratio)

            shot_resized = shot.resize((fit_w, fit_h), Image.Resampling.LANCZOS)
            paste_x = (page_w - fit_w) // 2
            paste_y = bar_h + (avail_h - fit_h) // 2 + 10

            canvas.paste(shot_resized, (paste_x, paste_y))

        pdf_pages.append(canvas)

    out_pdf = BASE_DIR / "all_pages_screenshots.pdf"
    if pdf_pages:
        pdf_pages[0].save(
            out_pdf,
            save_all=True,
            append_images=pdf_pages[1:],
            resolution=150.0
        )
        print(f"Saved: {out_pdf} ({len(pdf_pages)} slides)")

if __name__ == "__main__":
    build_grid_poster()
    build_pdf_document()
    build_vertical_stitched()
