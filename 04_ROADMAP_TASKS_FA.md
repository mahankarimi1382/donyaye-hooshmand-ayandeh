# رودمپ اجرایی بازنویسی فرانت‌اند

## قواعد اجرا
- فازها به ترتیب جلو بروند، اما تسک‌های مستقل بعد از تثبیت قراردادها می‌توانند موازی شوند.
- هر تسک باید owner/agent، خروجی قابل مشاهده، dependency و معیار تکمیل داشته باشد.
- هیچ فازی فقط با توضیح متنی «انجام شد» بسته نشود؛ شواهد، فایل‌ها، commandها و نتیجه تست لازم است.
- تغییرات باید کوچک و قابل review باشند. حفظ تغییرات کاربر و عدم deploy/commit بدون اجازه ضروری است.

## فاز 0 — دسترسی، baseline و inventory
**هدف:** شناخت واقعیت پروژه و جلوگیری از بازنویسی کورکورانه.

- [ ] F0.1 تأیید مسیر مخزن، branch، وضعیت git و تغییرات محلی
- [ ] F0.2 خواندن `AGENTS.md`، README، package manager، lockfile، env example و docs
- [ ] F0.3 شناخت stack، build/runtime، routing و ساختار CSS/component
- [ ] F0.4 فهرست تمام routeهای کاربرمحور و صفحات CMS
- [ ] F0.5 مشاهده سایت در viewport موبایل/تبلت/دسکتاپ و ذخیره screenshots
- [ ] F0.6 بررسی فرم‌ها، navigation، downloads، search، filters و CTAها
- [ ] F0.7 اجرای lint/typecheck/test/build فعلی و ثبت baseline واقعی
- [ ] F0.8 بررسی APIها، مدل داده، CMS، analytics، SEO و جریان تماس/استعلام
- [ ] F0.9 ثبت مشکلات severity: P0 blocker، P1 high، P2 medium، P3 polish
- [ ] F0.10 نوشتن `AUDIT.md`، `ROUTES_AND_PAGE_STATUS.md` و `OPEN_QUESTIONS.md`

**گیت خروج:** هیچ مسیر اصلی ناشناخته نمانده باشد؛ محدودیت‌های backend و فایل‌های کاربر مستند شده باشند.

## فاز 1 — UX، محتوا و جهت هنری
- [ ] F1.1 تعریف primary user journeys برای خریدار B2B
- [ ] F1.2 تعیین هدف و CTA اصلی هر صفحه
- [ ] F1.3 ترسیم sitemap/route map
- [ ] F1.4 بررسی سایت‌های مرجع صنعت فقط برای یادگیری الگو، نه کپی طراحی
- [ ] F1.5 ثبت جهت بصری: تخصصی، صنعتی، معتبر، مبتنی بر داده/محصول
- [ ] F1.6 فهرست موجودی محتوا: متن، محصول، تصویر، PDF، گواهی، اطلاعات تماس
- [ ] F1.7 مشخص کردن content gap و اطلاعاتی که نیازمند تأیید شرکت‌اند
- [ ] F1.8 وایرفریم کم‌جزئیات برای home، listing، product detail، inquiry، contact
- [ ] F1.9 ارزیابی دسترس‌پذیری و RTL از مرحله وایرفریم
- [ ] F1.10 ثبت تصمیم‌ها در `DESIGN_DECISIONS.md`

**گیت خروج:** ساختار اصلی و CTAها معلوم باشند؛ کپی/محتوای حساس و ادعاها منبع تأیید داشته باشند.

## فاز 2 — بنیاد فنی و Design System
- [ ] F2.1 بررسی اینکه آیا tokens/components فعلی باید حفظ/تکمیل یا به‌صورت کنترل‌شده جایگزین شوند
- [ ] F2.2 ساخت/تکمیل tokens رنگ، typography، spacing، radius، shadow، focus و z-index
- [ ] F2.3 تثبیت فارسی RTL و در صورت نیاز localeهای موجود
- [ ] F2.4 component پایه Button، Link، Field، Input، Textarea، Select، Checkbox، Alert
- [ ] F2.5 componentهای layout: Container، Section، Stack/Grid، Divider، Page Header
- [ ] F2.6 states: Loading/Skeleton، Empty، Error، Success، Disabled، Not Found
- [ ] F2.7 header/footer/nav/breadcrumb responsive
- [ ] F2.8 keyboard/focus/contrast smoke test
- [ ] F2.9 مستندسازی مثال و حالت‌های کامپوننت
- [ ] F2.10 حذف تدریجی استایل‌های تکراری فقط پس از شناسایی استفاده‌ها

**گیت خروج:** صفحات نمونه با همان tokens و components قابل ساخت باشند و RTL در اجزای پایه کار کند.

## فاز 3 — Home و shell سراسری
- [ ] F3.1 بازنویسی header دسکتاپ و navigation
- [ ] F3.2 پیاده‌سازی mobile menu و focus management
- [ ] F3.3 بازطراحی hero و CTAهای home با محتوای واقعی/موقت مشخص‌شده
- [ ] F3.4 بخش دسته‌های محصول واقعی
- [ ] F3.5 بخش ارزش پیشنهادی با evidence یا حذف ادعای غیرقابل اثبات
- [ ] F3.6 کیفیت/تأمین یا فرآیند همکاری بر اساس سند واقعی
- [ ] F3.7 CTAهای پایین صفحه
- [ ] F3.8 footer و اطلاعات تماس تأییدشده
- [ ] F3.9 metadata/OG و تصویر preview در صورت پشتیبانی stack
- [ ] F3.10 تست همه CTAهای خانه و تمام breakpointها

**گیت خروج:** home فقط زیبا نباشد؛ مسیرهای محصولات و تماس واقعاً کار کنند.

## فاز 4 — کاتالوگ محصولات
- [ ] F4.1 تطبیق مدل UI با API/CMS موجود
- [ ] F4.2 طراحی listing با دسته و search واقعی
- [ ] F4.3 فیلتر و sort فقط برای ویژگی‌هایی که داده معتبر دارند
- [ ] F4.4 کارت محصول با layout ثابت، خوانا و responsive
- [ ] F4.5 حالت loading/empty/error/no results
- [ ] F4.6 pagination یا load-more مطابق الگوی واقعی، با حفظ back/forward
- [ ] F4.7 صفحه دسته‌بندی و breadcrumb
- [ ] F4.8 URL/query state برای جست‌وجو و فیلتر در صورت سازگاری
- [ ] F4.9 تست با داده خالی، داده طولانی، تصویر خراب و نام‌های بلند
- [ ] F4.10 عملکرد لیست با تعداد داده واقعی یا حجم نماینده

**گیت خروج:** کاربر می‌تواند محصول را پیدا کند و از نتایج به جزئیات برسد؛ هیچ فیلتر نمایشی وجود ندارد.

## فاز 5 — جزئیات محصول و اسناد
- [ ] F5.1 ساخت product detail template reusable
- [ ] F5.2 نمایش مشخصات و واحدها با hierarchy یکپارچه
- [ ] F5.3 پنهان‌کردن فیلدهای خالی/نامعتبر و شفافیت درباره اطلاعات ناموجود
- [ ] F5.4 نمایش اسناد و دانلودهای معتبر با label و نسخه/تاریخ در صورت موجود بودن
- [ ] F5.5 CTA استعلام با product context از پیش پرشده
- [ ] F5.6 متادیتا و structured data صرفاً بر اساس داده واقعی
- [ ] F5.7 جلوگیری از نشت اطلاعات داخلی/غیرعمومی در view model
- [ ] F5.8 حالت 404 برای slug نامعتبر و redirect در صورت تغییر مسیر
- [ ] F5.9 بررسی mobile layout برای جداول specs
- [ ] F5.10 تست route مستقیم و refresh

**گیت خروج:** صفحه مشخصات قابل استفاده است و داده‌های ساختگی یا فایل جعلی نمایش داده نمی‌شود.

## فاز 6 — استعلام، تماس و تبدیل
- [ ] F6.1 مشخص‌کردن endpoint/CRM/email واقعی و قرارداد payload
- [ ] F6.2 کمینه‌سازی فیلدهای فرم مطابق نیاز فروش و privacy
- [ ] F6.3 label، helper، validation، error summary و inline errors
- [ ] F6.4 submitting state و جلوگیری از double submit
- [ ] F6.5 success state فقط پس از پاسخ واقعی سرور/سرویس
- [ ] F6.6 خطا، retry و روش تماس جایگزین
- [ ] F6.7 حفاظت ضد spam/rate limit در لایه مناسب طبق backend موجود
- [ ] F6.8 رضایت و privacy copy فقط مطابق سیاست مصوب
- [ ] F6.9 analytics eventها بدون داده شخصی غیرضروری
- [ ] F6.10 تست keyboard، screen reader basics، موبایل و خطای شبکه

**گیت خروج:** مسیر تبدیل کامل و end-to-end تست شده باشد.

## فاز 7 — درباره، کیفیت، کاربردها و محتوا
- [ ] F7.1 بازطراحی صفحات درباره و معرفی شرکت
- [ ] F7.2 صفحات کیفیت/تأمین فقط اگر سند واقعی وجود دارد
- [ ] F7.3 صفحات کاربردها فقط برای بازار/گونه‌های تأییدشده
- [ ] F7.4 article listing/detail اگر سایت محتوای معتبر دارد
- [ ] F7.5 منابع و نام بازبین علمی برای محتوای فنی در صورت امکان
- [ ] F7.6 لینک داخلی به دسته/محصول مرتبط
- [ ] F7.7 typography محتوای طولانی، جدول، blockquote و PDF links
- [ ] F7.8 مشخص‌کردن تاریخ انتشار/بروزرسانی در صورت ردیابی واقعی
- [ ] F7.9 SEO محتوایی بدون keyword stuffing
- [ ] F7.10 بررسی محتوای تکراری/placeholderهای باقی‌مانده

**گیت خروج:** ادعاهای تجاری و فنی تأیید نشده وجود نداشته باشد.

## فاز 8 — تکمیل همه مسیرها و consistency pass
- [ ] F8.1 بررسی تک‌تک routeهای موجود در route inventory
- [ ] F8.2 تطبیق همه صفحات با tokens و spacing scale
- [ ] F8.3 بازبینی hover/focus/active/disabled/loading/error states
- [ ] F8.4 بررسی 404، empty, error, forbidden و server errors طبق معماری واقعی
- [ ] F8.5 بررسی زبان دوم / LTR در صورت وجود
- [ ] F8.6 بررسی table/card/modal/dropdown در موبایل و RTL
- [ ] F8.7 رفع متن overflow، horizontal scrolling و targetهای لمس کوچک
- [ ] F8.8 بررسی navigation و footer در همه layoutها
- [ ] F8.9 پاک‌سازی code dead/duplicate فقط پس از یافتن referenceها
- [ ] F8.10 تهیه before/after visual diff برای صفحات کلیدی

## فاز 9 — Accessibility، SEO و Performance
- [ ] F9.1 اجرای axe یا ابزار مشابه روی routeهای کلیدی
- [ ] F9.2 keyboard-only walkthrough و focus order
- [ ] F9.3 reduced motion، contrast، labels و semantics
- [ ] F9.4 بهینه‌سازی image size/format/responsive loading
- [ ] F9.5 بررسی font loading، layout shift و `font-display`
- [ ] F9.6 بررسی bundle size و dynamic import برای بخش‌های سنگین
- [ ] F9.7 Lighthouse/Web Vitals در محیط قابل مقایسه و ثبت baseline/final
- [ ] F9.8 SEO tags، sitemap، robots، canonical و redirects در صورت scope
- [ ] F9.9 بررسی لینک شکسته و metadataهای تکراری
- [ ] F9.10 ثبت limitations و نتایج اندازه‌گیری واقعی

## فاز 10 — تست نهایی، تحویل و handoff
- [ ] F10.1 lint
- [ ] F10.2 typecheck
- [ ] F10.3 unit/component tests
- [ ] F10.4 E2E critical journeys در حد stack موجود
- [ ] F10.5 production build
- [ ] F10.6 بررسی route inventory؛ هیچ مسیر مهم untested نماند
- [ ] F10.7 بررسی console/network در جریان‌های حیاتی
- [ ] F10.8 نوشتن `QA_REPORT.md`
- [ ] F10.9 نوشتن `ROUTES_AND_PAGE_STATUS.md` نهایی و فهرست debt باقی‌مانده
- [ ] F10.10 تحویل screenshots، تصمیم‌ها، محدودیت‌ها و روش اجرای محلی

## ترتیب اولویت
- **P0:** خطای build/runtime، مسیر خراب، CTA حیاتی بی‌اثر، فرم جعلی، رخنه داده، صفحه موبایل غیرقابل استفاده
- **P1:** RTL شکسته، کاتالوگ/جزئیات/استعلام ناقص، خطای دسترس‌پذیری پراثر، محتوای گمراه‌کننده
- **P2:** تناقض طراحی، صفحات مهم کم‌کیفیت، performance قابل بهبود، SEO فنی ناقص
- **P3:** motion تزئینی، polish بصری کم‌اثر، جزئیات فرعی

## شرایط اتمام کل پروژه
- 100٪ routeهای شناخته‌شده مرور و تعیین وضعیت شده باشند.
- تمام routeهای P0/P1 برطرف شده یا با مانع و دلیل مستند شوند.
- Home، listing، details، inquiry و contact در زبان بصری واحد باشند.
- تمام تعاملات قابل مشاهده یا واقعی باشند یا با دلیل مخفی/disabled شوند.
- RTL و responsive در viewportهای کلیدی تست شده باشد.
- lint/typecheck/tests/build اجرا و نتایج واقعی ثبت شده باشد.
- هیچ داده ساختگی یا placeholder نامشخص در production نمانده باشد.
- QA report و open items کامل تحویل شود.
