import os
import sys
import time
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

PAGES = [
    {
        "id": "01_home",
        "title": "صفحه اصلی (Home Page)",
        "url": "/fa",
        "desc": "هاب تعاملی استعلام فوری، شاخص‌های بازار و زنجیره ارزش نهاده‌های دامی"
    },
    {
        "id": "02_products_catalog",
        "title": "کاتالوگ جامع نهاده‌ها (Products Catalog)",
        "url": "/fa/products",
        "desc": "جستجوی هوشمند Omnibox، گرید M3 محصولات، فیلتر خاستگاه و دسته‌بندی"
    },
    {
        "id": "03_product_detail_corn",
        "title": "مشخصات فنی ذرت دامی (Corn Feed Detail)",
        "url": "/fa/products/prd_corn_feed",
        "desc": "آنالیز فیزیکی و شیمیایی ذرت، پروتئین، رطوبت، سیلوهای تحویل و استعلام"
    },
    {
        "id": "04_product_detail_soybean",
        "title": "مشخصات فنی کنجاله سویا (Soybean Meal Detail)",
        "url": "/fa/products/prd_soybean_meal",
        "desc": "کنجاله پلت سویا ۴۴٪، پروفایل اسیدهای آمینه، استانداردهای بهداشتی"
    },
    {
        "id": "05_product_detail_barley",
        "title": "مشخصات فنی جو دامی (Barley Feed Detail)",
        "url": "/fa/products/prd_barley_feed",
        "desc": "جو دامی وارداتی استاندارد خزر، پروتئین ۱۰.۵٪، دانه‌بندی مطلوب و انبار سیلو"
    },
    {
        "id": "06_rfq_inquiry_form",
        "title": "سامانه استعلام رسمی قیمت (RFQ Form)",
        "url": "/fa/rfq",
        "desc": "کاربرگ صدور پیش‌فاکتور با اعتبارسنجی زنده، تعهد ۲ ساعته و کد رهگیری یکتا"
    },
    {
        "id": "07_track_shipment",
        "title": "سامانه رهگیری بارنامه و استعلام (Tracking)",
        "url": "/fa/track",
        "desc": "رهگیری وضعیت بار کشتی و ترانزیت، خط زمانی ۴ مرحله‌ای و استعلام آنی"
    },
    {
        "id": "08_quality_assays_faq",
        "title": "کنترل کیفیت و آنالیز آزمایشگاهی (Quality)",
        "url": "/fa/quality",
        "desc": "تأییدیه‌های استاندارد ملی و SGS، فرآیند نمونه‌برداری و چک‌سام SHA-256"
    },
    {
        "id": "09_about_company",
        "title": "درباره شرکت و توانمندی‌ها (About Us)",
        "url": "/fa/about",
        "desc": "معرفی مأموریت، هیئت‌مدیره، هاب‌های بنادر امام و امیرآباد و ناوگان"
    },
    {
        "id": "10_export_history",
        "title": "پایانه‌ها و سوابق تأمین (Export History)",
        "url": "/fa/about/export-history",
        "desc": "پیشینه ترخیص و بارگیری سالانه در بنادر شمالی و جنوبی کشور"
    },
    {
        "id": "11_services_logistics",
        "title": "خدمات انبارداری و لجستیک (Services)",
        "url": "/fa/services",
        "desc": "سیلوهای مکانیزه، ترخیص گمرکی، ناوگان فله‌بر و مدیریت زنجیره تأمین"
    },
    {
        "id": "12_service_sourcing",
        "title": "خدمت تخصصی تأمین نهاده (Sourcing)",
        "url": "/fa/services/sourcing",
        "desc": "مذاکره و خرید مستقیم از مبادی معتبر برزیل، روسیه، قزاقستان و هند"
    },
    {
        "id": "13_service_logistics",
        "title": "خدمت حمل‌ونقل و ترانزیت (Logistics Detail)",
        "url": "/fa/services/logistics",
        "desc": "پوشش لجستیک دریایی، ترانزیت ریلی و جاده‌ای نهاده‌های فله و کیسه‌ای"
    },
    {
        "id": "14_markets_corridors",
        "title": "کریدورها و شرایط تحویل (Markets & Incoterms)",
        "url": "/fa/markets",
        "desc": "مسیرهای واردات دریای خزر و خلیج فارس با قوانین اینکوترمز ۲۰۲۰"
    },
    {
        "id": "15_contact_offices",
        "title": "تماس، دفاتر و شعب (Contact & Offices)",
        "url": "/fa/contact",
        "desc": "اطلاعات تماس دفتر مرکزی تهران، شعبه بندر امام و پایانه امیرآباد"
    },
    {
        "id": "16_terms_of_trade",
        "title": "شرایط و ضوابط بازرگانی (Terms of Trade)",
        "url": "/fa/terms",
        "desc": "چارچوب قراردادهای تجاری B2B، تضمین کیفیت و فرآیند تسویه حساب"
    },
    {
        "id": "17_privacy_policy",
        "title": "حریم خصوصی و امنیت داده‌ها (Privacy Policy)",
        "url": "/fa/privacy",
        "desc": "سند محرمانگی اطلاعات تجاری مشتریان و استانداردهای رمزنگاری داده‌ها"
    },
    {
        "id": "18_customer_portal",
        "title": "پورتال مشتریان و همکاران (Customer Portal)",
        "url": "/fa/portal",
        "desc": "ورود به پیشخوان کاربری اختصاصی برای پیگیری قراردادها و صورت‌حساب‌ها"
    }
]

BASE_URL = "http://localhost:3100"
OUTPUT_DIR = "screenshots"

def setup_browser_context(browser, is_mobile=False):
    if is_mobile:
        ctx = browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
            locale='fa-IR'
        )
    else:
        ctx = browser.new_context(
            viewport={'width': 1440, 'height': 900},
            device_scale_factor=1.5,
            locale='fa-IR'
        )
    ctx.add_cookies([
        {'name': 'NEXT_LOCALE', 'value': 'fa', 'domain': 'localhost', 'path': '/'}
    ])
    return ctx

def capture_all():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    full_desktop_files = []
    viewport_desktop_files = []
    mobile_files = []

    print("=== Starting Playwright Browser Capture ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)

        # 1. Desktop captures
        print("\n--- Capturing Desktop Pages ---")
        desktop_ctx = setup_browser_context(browser, is_mobile=False)
        desktop_page = desktop_ctx.new_page()

        for idx, item in enumerate(PAGES, 1):
            url = BASE_URL + item['url']
            print(f"[{idx}/{len(PAGES)}] Loading Desktop {item['id']}: {url}...")
            try:
                desktop_page.goto(url, wait_until='networkidle', timeout=15000)
                desktop_page.wait_for_timeout(1000)
            except Exception as e:
                print(f"  Warning on goto: {e}")

            # Capture Full Page
            full_path = os.path.join(OUTPUT_DIR, f"{item['id']}_full.png")
            desktop_page.screenshot(path=full_path, full_page=True)
            full_desktop_files.append((item, full_path))

            # Capture Viewport (1440x900)
            view_path = os.path.join(OUTPUT_DIR, f"{item['id']}_viewport.png")
            desktop_page.screenshot(path=view_path, full_page=False)
            viewport_desktop_files.append((item, view_path))
            print(f"  Captured: {full_path} & {view_path}")

        desktop_ctx.close()

        # 2. Mobile captures for key pages
        print("\n--- Capturing Mobile Responsive Views ---")
        mobile_ctx = setup_browser_context(browser, is_mobile=True)
        mobile_page = mobile_ctx.new_page()

        for idx, item in enumerate(PAGES, 1):
            url = BASE_URL + item['url']
            print(f"[{idx}/{len(PAGES)}] Loading Mobile {item['id']}: {url}...")
            try:
                mobile_page.goto(url, wait_until='networkidle', timeout=15000)
                mobile_page.wait_for_timeout(1000)
            except Exception as e:
                print(f"  Warning on goto: {e}")

            mob_path = os.path.join(OUTPUT_DIR, f"{item['id']}_mobile.png")
            mobile_page.screenshot(path=mob_path, full_page=True)
            mobile_files.append((item, mob_path))
            print(f"  Captured Mobile: {mob_path}")

        mobile_ctx.close()
        browser.close()

    print("\n=== All Screenshots Captured Successfully ===")
    return full_desktop_files, viewport_desktop_files, mobile_files

if __name__ == "__main__":
    capture_all()
