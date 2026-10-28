import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_DIR = Path(__file__).resolve().parent.parent

PAGES = [
    {
        "id": "01_home",
        "title": "صفحه اصلی (Home Page)",
        "url": "/fa",
        "badge": "هاب تعاملی و ورود به سامانه",
        "desc": "هاب تعاملی استعلام فوری نرخ، شاخص‌های بازار غلات، معرفی شرکت و زنجیره تأمین نهاده‌های دامی"
    },
    {
        "id": "02_products_catalog",
        "title": "کاتالوگ جامع نهاده‌ها (Products Catalog)",
        "url": "/fa/products",
        "badge": "جستجوی هوشمند Omnibox",
        "desc": "کاتالوگ جامع انواع غلات دامی، کنجاله‌های پروتئینی و مکمل‌ها با فیلتر آنالیز آزمایشگاهی و سوییچ گرید/جدول"
    },
    {
        "id": "03_product_detail_corn",
        "title": "مشخصات فنی ذرت دامی (Corn Feed Detail)",
        "url": "/fa/products/prd_corn_feed",
        "badge": "برگه آنالیز استاندارد",
        "desc": "آنالیز فیزیکی و شیمیایی، پروتئین، رطوبت، دانه‌بندی، سیلوهای تحویل بنادر و استعلام مستقیم با پرکردن خودکار"
    },
    {
        "id": "04_product_detail_soybean",
        "title": "مشخصات فنی کنجاله سویا (Soybean Meal Detail)",
        "url": "/fa/products/prd_soybean_meal",
        "badge": "پروتئین ۴۴٪ و اسیدهای آمینه",
        "desc": "کنجاله پلت سویا ۴۴٪ وارداتی آمریکای جنوبی، پروفایل اسیدهای آمینه و گواهی‌های سلامت و بهداشت"
    },
    {
        "id": "05_product_detail_barley",
        "title": "مشخصات فنی جو دامی (Barley Feed Detail)",
        "url": "/fa/products/prd_barley_feed",
        "badge": "غلات استاندارد خزر",
        "desc": "جو دامی وارداتی استاندارد روسیه و قزاقستان با دانه‌بندی مطلوب، وزن حجمی استاندارد و انبارش سیلو"
    },
    {
        "id": "06_rfq_inquiry_form",
        "title": "سامانه صدور استعلام رسمی (RFQ Form)",
        "url": "/fa/rfq",
        "badge": "تعهد پاسخ‌گویی ۲ ساعته",
        "desc": "کاربرگ صدور پیش‌فاکتور با اعتبارسنجی ارگونومیک، اتصال مستقیم به API، حفاظت Honeypot و تولید کد یکتای رسمی"
    },
    {
        "id": "07_track_shipment",
        "title": "سامانه رهگیری بارنامه و استعلام (Shipment Tracking)",
        "url": "/fa/track",
        "badge": "رهگیری ۴ مرحله‌ای ترانزیت",
        "desc": "رهگیری زنده وضعیت محموله، بار کشتی و گمرک با خط زمانی چهارمرحله‌ای و نمونه‌های تستی قابل آزمایش"
    },
    {
        "id": "08_quality_assays_faq",
        "title": "کنترل کیفیت و آنالیز آزمایشگاهی (Quality Control)",
        "url": "/fa/quality",
        "badge": "چک‌سام امنیتی SHA-256",
        "desc": "استانداردهای ملی و بین‌المللی، فرآیند نمونه‌برداری در بندر و چک‌سام رمزنگاری‌شده آنالیزها با آکاردئون علمی"
    },
    {
        "id": "09_about_company",
        "title": "درباره شرکت و توانمندی‌ها (About Us)",
        "url": "/fa/about",
        "badge": "هاب‌های استراتژیک بنادر",
        "desc": "تاریخچه تأسیس، مأموریت سازمانی، هیئت‌مدیره و پایانه‌های اختصاصی شرکت در بندر امام خمینی و بندر امیرآباد"
    },
    {
        "id": "10_export_history",
        "title": "پایانه‌ها و سوابق تأمین (Export History)",
        "url": "/fa/about/export-history",
        "badge": "سوابق ترخیص و بارگیری",
        "desc": "پیشینه ترخیص و بارگیری سالانه در بنادر شمالی و جنوبی، ظرفیت‌های تناژ و کریدورهای حمل‌ونقل"
    },
    {
        "id": "11_services_logistics",
        "title": "خدمات انبارداری و لجستیک (Services)",
        "url": "/fa/services",
        "badge": "سیلوهای ذخیره‌سازی مکانیزه",
        "desc": "سیلوهای مکانیزه ذخیره‌سازی، ترخیص اختصاصی بنادر، تخلیه اسکله، ناوگان فله‌بر و مدیریت زنجیره تأمین"
    },
    {
        "id": "12_service_sourcing",
        "title": "خدمت تخصصی تأمین و سورسینگ (Sourcing)",
        "url": "/fa/services/sourcing",
        "badge": "تأمین مستقیم بین‌المللی",
        "desc": "مذاکره، بازرگانی و تأمین مستقیم نهاده‌های خوراک دام از شرکت‌های پیشرو روسیه، برزیل و قزاقستان"
    },
    {
        "id": "13_service_logistics",
        "title": "خدمت حمل‌ونقل و ترانزیت (Freight & Transport)",
        "url": "/fa/services/logistics",
        "badge": "حمل چندوجهی ترکیبی",
        "desc": "پوشش ناوگان کشتیرانی کاسپین و خلیج فارس، ترانزیت ریلی سیلو به سیلو و خطوط کامیونی استاندارد"
    },
    {
        "id": "14_markets_corridors",
        "title": "کریدورها و شرایط تحویل (Markets & Incoterms)",
        "url": "/fa/markets",
        "badge": "اینکوترمز ۲۰۲۰ و کریدورها",
        "desc": "مسیرهای واردات دریای خزر و خلیج فارس با جدول قوانین اینکوترمز ۲۰۲۰ و ایزولاسیون Bidi کدهای بنادر"
    },
    {
        "id": "15_contact_offices",
        "title": "تماس، دفاتر مرکزی و شعب (Contact & Offices)",
        "url": "/fa/contact",
        "badge": "پاسخ‌گویی سریع سازمانی",
        "desc": "اطلاعات تماس دفتر مرکزی تهران، شعبه بندر امام خمینی و پایانه امیرآباد با فرم تماس متصل به سامانه CRM"
    },
    {
        "id": "16_terms_of_trade",
        "title": "شرایط و ضوابط بازرگانی (Terms of Trade)",
        "url": "/fa/terms",
        "badge": "چارچوب رسمی حقوقی",
        "desc": "چارچوب قراردادهای تجاری B2B، تضمین کیفیت، ضوابط دموراژ و فرآیند قانونی تسویه حساب"
    },
    {
        "id": "17_privacy_policy",
        "title": "حریم خصوصی و محرمانگی داده‌ها (Privacy Policy)",
        "url": "/fa/privacy",
        "badge": "امنیت داده‌های تجاری",
        "desc": "سند رسمی محرمانگی اطلاعات تجاری، امنیت استعلام‌ها و سازوکارهای رمزنگاری داده‌ها"
    },
    {
        "id": "18_customer_portal",
        "title": "پورتال مشتریان و همکاران (Customer Portal)",
        "url": "/fa/portal",
        "badge": "پیشخوان اختصاصی B2B",
        "desc": "ورود به پیشخوان کاربری اختصاصی برای پیگیری قراردادها، صدور فاکتور و رهگیری بارهای جاری"
    }
]

def generate_slides_html():
    slides_html = ""
    for idx, page in enumerate(PAGES, 1):
        num_fa = str(idx).zfill(2)
        total_fa = str(len(PAGES)).zfill(2)
        img_rel = f"screenshots/{page['id']}_viewport.png"

        slides_html += f"""
        <div class="slide">
            <div class="slide-header">
                <div class="slide-meta">
                    <span class="slide-num">{num_fa} / {total_fa}</span>
                    <span class="slide-badge">{page['badge']}</span>
                    <h2 class="slide-title">{page['title']}</h2>
                </div>
                <div class="slide-url">
                    <code>https://donyaye-hooshmand.ir{page['url']}</code>
                </div>
            </div>
            <div class="slide-content">
                <div class="browser-bar">
                    <div class="dots">
                        <span class="dot red"></span>
                        <span class="dot yellow"></span>
                        <span class="dot green"></span>
                    </div>
                    <div class="url-input">🔒 https://donyaye-hooshmand.ir{page['url']}</div>
                </div>
                <div class="img-wrapper">
                    <img src="{img_rel}" alt="{page['title']}" class="slide-img" />
                </div>
            </div>
            <div class="slide-footer">
                <p>{page['desc']}</p>
            </div>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>اسلایدهای تمامی صفحات — دنیای هوشمند آینده</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap');

        @page {{
            size: A4 landscape;
            margin: 0;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: 'Vazirmatn', sans-serif;
            background: #102820;
            color: #FFFFFF;
        }}

        .slide {{
            width: 297mm;
            height: 210mm;
            padding: 12mm 15mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            break-after: page;
            background: #102820;
            position: relative;
        }}

        .slide-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid rgba(201, 154, 58, 0.4);
            padding-bottom: 8px;
            margin-bottom: 8px;
        }}

        .slide-meta {{
            display: flex;
            align-items: center;
            gap: 12px;
        }}

        .slide-num {{
            background: #C99A3A;
            color: #102820;
            padding: 3px 10px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 14px;
        }}

        .slide-badge {{
            background: rgba(61, 120, 85, 0.3);
            border: 1px solid rgba(61, 120, 85, 0.6);
            color: #A3E0BA;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }}

        .slide-title {{
            font-size: 18px;
            font-weight: 800;
            color: #FFFFFF;
        }}

        .slide-url code {{
            background: rgba(255, 255, 255, 0.1);
            color: #F3CA68;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-family: monospace;
            direction: ltr;
            display: inline-block;
        }}

        .slide-content {{
            flex: 1;
            background: #FAF8F1;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border: 1px solid #DDE5DE;
        }}

        .browser-bar {{
            background: #E8ECE9;
            padding: 6px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid #D5DDD7;
        }}

        .dots {{
            display: flex;
            gap: 6px;
        }}

        .dot {{
            width: 9px;
            height: 9px;
            border-radius: 50%;
        }}
        .red {{ background: #FF5F56; }}
        .yellow {{ background: #FFBD2E; }}
        .green {{ background: #27C93F; }}

        .url-input {{
            flex: 1;
            background: #FFFFFF;
            border: 1px solid #D0D8D2;
            border-radius: 5px;
            padding: 3px 10px;
            font-size: 11px;
            color: #52635A;
            font-family: monospace;
            direction: ltr;
            text-align: left;
        }}

        .img-wrapper {{
            flex: 1;
            overflow: hidden;
            background: #FFFFFF;
        }}

        .slide-img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top;
            display: block;
        }}

        .slide-footer {{
            padding-top: 8px;
            font-size: 12px;
            color: #A3B8AD;
            text-align: right;
        }}
    </style>
</head>
<body>
    {slides_html}
</body>
</html>
"""
    target = (BASE_DIR / "all_pages_slides.html").resolve()
    target.write_text(html, encoding="utf-8")
    print(f"Created {target.name} successfully!")
    return target

def generate_interactive_viewer_html():
    buttons_html = ""
    sections_html = ""
    for idx, page in enumerate(PAGES, 1):
        num = str(idx).zfill(2)
        full_img = f"screenshots/{page['id']}_full.png"
        view_img = f"screenshots/{page['id']}_viewport.png"
        mob_img = f"screenshots/{page['id']}_mobile.png"
        
        active_class = "active" if idx == 1 else ""
        buttons_html += f"""
        <button class="nav-btn {active_class}" onclick="selectPage({idx - 1})">
            <span class="btn-num">{num}</span>
            <span class="btn-title">{page['title']}</span>
        </button>
        """

        sections_html += f"""
        <div class="view-item" id="item-{idx - 1}" style="display: {'block' if idx == 1 else 'none'};">
            <div class="item-header">
                <div class="item-title-box">
                    <span class="badge">{page['badge']}</span>
                    <h2>{page['title']}</h2>
                    <p class="desc">{page['desc']}</p>
                </div>
                <div class="item-url-box">
                    <a href="http://localhost:3100{page['url']}" target="_blank" class="url-link">
                        🌐 باز کردن در سرور: <code>{page['url']}</code> ↗
                    </a>
                </div>
            </div>

            <div class="view-modes-bar">
                <button class="mode-tab active" onclick="switchMode({idx - 1}, 'full')">صفحه کامل دسکتاپ (Full Page)</button>
                <button class="mode-tab" onclick="switchMode({idx - 1}, 'viewport')">نمای اولیه دسکتاپ (1440×900)</button>
                <button class="mode-tab" onclick="switchMode({idx - 1}, 'mobile')">نمای ریسپانسیو موبایل (390×844)</button>
            </div>

            <div class="screenshot-container">
                <div class="screenshot-box full-box" id="mode-full-{idx - 1}">
                    <img src="{full_img}" alt="{page['title']}" class="responsive-img" />
                </div>
                <div class="screenshot-box viewport-box" id="mode-viewport-{idx - 1}" style="display: none;">
                    <img src="{view_img}" alt="{page['title']}" class="responsive-img" />
                </div>
                <div class="screenshot-box mobile-box" id="mode-mobile-{idx - 1}" style="display: none; max-width: 420px; margin: 0 auto;">
                    <img src="{mob_img}" alt="{page['title']}" class="responsive-img" style="border-radius: 20px; border: 8px solid #1B4332;" />
                </div>
            </div>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نمایشگر تعاملی اسکرین‌شات‌های پلتفرم — دنیای هوشمند آینده</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap');

        :root {{
            --bg: #FAF8F1;
            --primary: #1B4332;
            --primary-dark: #102820;
            --accent: #C99A3A;
            --surface: #FFFFFF;
            --text: #17211C;
            --text-muted: #52635A;
            --border: #DDE5DE;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: 'Vazirmatn', sans-serif;
            background: var(--bg);
            color: var(--text);
            display: flex;
            height: 100vh;
            overflow: hidden;
        }}

        /* Sidebar Navigation */
        .sidebar {{
            width: 340px;
            background: var(--primary-dark);
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            border-left: 1px solid rgba(201, 154, 58, 0.3);
            flex-shrink: 0;
        }}

        .sidebar-header {{
            padding: 24px 20px;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}

        .brand-title {{
            font-size: 18px;
            font-weight: 800;
            color: #F3CA68;
            margin-bottom: 4px;
        }}

        .brand-sub {{
            font-size: 13px;
            color: #A3B8AD;
        }}

        .downloads-box {{
            margin-top: 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }}

        .dl-link {{
            background: rgba(201, 154, 58, 0.15);
            color: #F3CA68;
            border: 1px solid rgba(201, 154, 58, 0.3);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s;
        }}

        .dl-link:hover {{
            background: rgba(201, 154, 58, 0.3);
        }}

        .nav-list {{
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }}

        .nav-btn {{
            width: 100%;
            text-align: right;
            padding: 10px 14px;
            background: transparent;
            border: none;
            border-radius: 8px;
            color: #D3E0D8;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: inherit;
            font-size: 13px;
            transition: all 0.2s;
        }}

        .nav-btn:hover {{
            background: rgba(255, 255, 255, 0.08);
            color: #FFFFFF;
        }}

        .nav-btn.active {{
            background: var(--primary);
            color: #FFFFFF;
            border-right: 4px solid var(--accent);
            font-weight: 700;
        }}

        .btn-num {{
            background: rgba(255, 255, 255, 0.15);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
        }}

        .btn-title {{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}

        /* Main Viewer Area */
        .main-viewer {{
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
            background: #EFEFE9;
        }}

        .content-scroll {{
            flex: 1;
            overflow-y: auto;
            padding: 30px 40px;
        }}

        .item-header {{
            background: var(--surface);
            padding: 24px 30px;
            border-radius: 16px;
            border: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 16px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }}

        .badge {{
            background: rgba(61, 120, 85, 0.1);
            color: var(--primary);
            border: 1px solid rgba(61, 120, 85, 0.2);
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 6px;
        }}

        .item-title-box h2 {{
            font-size: 22px;
            font-weight: 800;
            color: var(--primary-dark);
            margin-bottom: 4px;
        }}

        .desc {{
            font-size: 14px;
            color: var(--text-muted);
        }}

        .url-link {{
            background: #F4F6F5;
            border: 1px solid #D5DDD7;
            padding: 8px 16px;
            border-radius: 8px;
            color: var(--primary);
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .url-link code {{
            font-family: monospace;
            direction: ltr;
            color: var(--accent);
            font-weight: 700;
        }}

        .view-modes-bar {{
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }}

        .mode-tab {{
            padding: 8px 18px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-muted);
            transition: all 0.2s;
        }}

        .mode-tab.active {{
            background: var(--primary);
            color: #FFFFFF;
            border-color: var(--primary);
        }}

        .screenshot-container {{
            background: var(--surface);
            border-radius: 16px;
            padding: 16px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }}

        .responsive-img {{
            width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
        }}
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-header">
            <h1 class="brand-title">دنیای هوشمند آینده</h1>
            <p class="brand-sub">مستند اسکرین‌شات ۱۸ صفحه پلتفرم</p>
            <div class="downloads-box">
                <a href="all_pages_screenshots.pdf" class="dl-link" download>
                    <span>📄 دانلود فایل PDF جامع (A4)</span>
                    <span>↓</span>
                </a>
                <a href="all_pages_slides.pdf" class="dl-link" download>
                    <span>📊 دانلود فایل اسلایدهای PDF (16:9)</span>
                    <span>↓</span>
                </a>
                <a href="all_pages_stitched.png" class="dl-link" download>
                    <span>🖼️ دانلود تصویر پیوسته کامل (PNG)</span>
                    <span>↓</span>
                </a>
                <a href="all_pages_grid.png" class="dl-link" download>
                    <span>📑 دانلود پوستر گرید ۳×۶ (PNG)</span>
                    <span>↓</span>
                </a>
            </div>
        </div>
        <div class="nav-list">
            {buttons_html}
        </div>
    </div>

    <div class="main-viewer">
        <div class="content-scroll">
            {sections_html}
        </div>
    </div>

    <script>
        function selectPage(index) {{
            document.querySelectorAll('.view-item').forEach((item, i) => {{
                item.style.display = (i === index) ? 'block' : 'none';
            }});
            document.querySelectorAll('.nav-btn').forEach((btn, i) => {{
                if (i === index) {{
                    btn.classList.add('active');
                    btn.scrollIntoView({{ block: 'nearest', behavior: 'smooth' }});
                }} else {{
                    btn.classList.remove('active');
                }}
            }});
        }}

        function switchMode(pageIndex, mode) {{
            const item = document.getElementById('item-' + pageIndex);
            item.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');

            item.querySelector('#mode-full-' + pageIndex).style.display = (mode === 'full') ? 'block' : 'none';
            item.querySelector('#mode-viewport-' + pageIndex).style.display = (mode === 'viewport') ? 'block' : 'none';
            item.querySelector('#mode-mobile-' + pageIndex).style.display = (mode === 'mobile') ? 'block' : 'none';
        }}
    </script>
</body>
</html>
"""
    target = (BASE_DIR / "all_pages_viewer.html").resolve()
    target.write_text(html, encoding="utf-8")
    print(f"Created {target.name} successfully!")
    return target

def build_slides_pdf():
    slides_path = generate_slides_html()
    generate_interactive_viewer_html()

    print("\n=== Rendering all_pages_slides.pdf via Playwright ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        slides_uri = slides_path.as_uri()
        page.goto(slides_uri, wait_until='networkidle')
        page.wait_for_timeout(2000)

        pdf_path = (BASE_DIR / "all_pages_slides.pdf").resolve()
        page.pdf(
            path=str(pdf_path),
            format="A4",
            landscape=True,
            print_background=True,
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"}
        )
        print("  -> all_pages_slides.pdf generated successfully!")
        browser.close()

if __name__ == "__main__":
    build_slides_pdf()
