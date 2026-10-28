# منابع مرجع، ریپازیتوری‌های متن‌باز و اسکیل‌های ایجنت

**وضعیت:** این‌ها فهرست shortlist برای بررسی‌اند. وجود در این سند به معنی نیاز قطعی به نصب، endorsement یا تأیید کامل مجوز و سازگاری نیست. پیش از استفاده، README، license، releases، activity، issueهای باز، dependency tree، سازگاری با stack و معیار performance بررسی شود. از کپی‌کردن عین طراحی برندهای دیگر خودداری کن؛ از الگوها یاد بگیر و هویت اختصاصی بساز.

## 1. سایت‌های صنعتی برای benchmark محتوایی/تجربه
این سایت‌ها نمونه‌هایی برای بررسی پیام‌رسانی، ساختار دسته‌بندی، شیوه نمایش راهکار و ارائه محتوای علمی‌اند؛ این بررسی به معنای تأیید ادعاها یا توصیه برای کپی طراحی نیست.
- Cargill Animal Nutrition: https://www.cargill.com/animal-nutrition
- Alltech: https://www.alltech.com/
- dsm-firmenich Animal Nutrition & Health: https://www.dsm-firmenich.com/anh.html
- NOVUS International: https://www.novusint.com/
- Evonik Animal Nutrition: https://animal-nutrition.evonik.com/
- Adisseo: https://www.adisseo.com/
- Trouw Nutrition: https://www.trouwnutrition.com/
- All About Feed (رسانه تخصصی صنعت): https://www.allaboutfeed.net/

هنگام بررسی، فقط موارد قابل مشاهده و مرتبط را ثبت کن: ساختار محصولات، فیلترهای کاتالوگ، نحوه ارائه داده فنی، مسیر تماس، محتوا، وضوح پیام و تجربه موبایل. آمار/متن شرکت دیگر را وارد سایت دنیای هوشمند آینده نکن.

## 2. Component libraries / design systems
- shadcn/ui — https://github.com/shadcn-ui/ui — componentهای قابل سفارشی‌سازی؛ در صورت سازگاری React/Tailwind.
- Radix Primitives — https://github.com/radix-ui/primitives — primitiveهای accessible برای تعاملات.
- Base UI — https://github.com/mui/base-ui — primitiveهای headless؛ پیش از انتخاب با stack فعلی ارزیابی شود.
- Tailwind CSS — https://github.com/tailwindlabs/tailwindcss — utility-first styling، فقط اگر پروژه بر آن بنا شده/نیاز واقعی دارد.
- Mantine — https://github.com/mantinedev/mantine — component system برای React؛ با shadcn/Radix هم‌زمان انتخاب بی‌دلیل نکن.
- Chakra UI — https://github.com/chakra-ui/chakra-ui — system کامپوننت React.
- HeroUI — https://github.com/heroui-inc/heroui — مجموعه کامپوننت React.
- DaisyUI — https://github.com/saadeghi/daisyui — component classes برای Tailwind؛ مناسب یا نامناسب بودنش وابسته به نیاز برند.
- Lucide — https://github.com/lucide-icons/lucide — آیکون‌های SVG یکپارچه.
- React Bits — https://github.com/DavidHDev/react-bits — ایده‌ها/کامپوننت‌های بصری؛ هر افکت را قبل از استفاده از نظر دسترس‌پذیری و performance ارزیابی کن.
- Magic UI — https://github.com/magicuidesign/magicui — الگوهای متحرک/بصری؛ انتخاب گزینشی.
- Aceternity UI — https://github.com/aceternity/ui — ایده‌های UI/animation؛ از بار بصری زیاد پرهیز کن.
- Origin UI — https://github.com/origin-space/originui — نمونه‌های کامپوننت و فرم.
- Tremor — https://github.com/tremorlabs/tremor — dashboard/data visualization، فقط اگر صفحه داده‌ای واقعاً لازم است.

## 3. Motion / visuals / 3D
- Motion — https://github.com/motiondivision/motion — motion برای React/JS؛ برای transitionهای هدفمند، نه انیمیشن همگانی.
- React Three Fiber — https://github.com/pmndrs/react-three-fiber — renderer سه‌بعدی React؛ برای سایت شرکتی معمولاً لازم نیست مگر 3D ارزش محصولی مشخصی بسازد.
- Drei — https://github.com/pmndrs/drei — helperهای React Three Fiber؛ فقط در صورت نیاز واقعی به 3D.

## 4. Form، validation و data UI
- React Hook Form — https://github.com/react-hook-form/react-hook-form — فرم‌های React.
- Zod — https://github.com/colinhacks/zod — schema validation و type inference.
- TanStack Form — https://github.com/TanStack/form — فرم‌های type-safe.
- TanStack Query — https://github.com/TanStack/query — server state؛ اگر با الگوی فعلی پروژه سازگار است.
- TanStack Table — https://github.com/TanStack/table — جدول‌های پیچیده/قابل کنترل.
- Zustand — https://github.com/pmndrs/zustand — state کوچک و قابل نگهداری، فقط با نیاز مشخص.
- Sonner — https://github.com/emilkowalski/sonner — notifications/toasts؛ اگر در stack موجود قابل استفاده است.
- Recharts — https://github.com/recharts/recharts — visualization برای داده‌ها، فقط اگر واقعاً بخش داده‌ای نیاز دارد.

## 5. Internationalization / Persian / routing
- next-intl — https://github.com/amannn/next-intl — i18n برای Next.js.
- FormatJS / react-intl — https://github.com/formatjs/formatjs — پیام‌ها و قالب‌بندی locale.
- React Router — https://github.com/remix-run/react-router — فقط اگر پروژه همین router را استفاده می‌کند.
- Next.js — https://github.com/vercel/next.js — مرجع framework اگر پروژه Next.js است.
- React — https://github.com/facebook/react — مرجع React.

راهنمای RTL باید بر اساس semantics، logical CSS، فونت، bidi isolation، date/number formatting و تست واقعی باشد؛ افزودن یک CSS `direction: rtl` به تنهایی کافی نیست.

## 6. CMS/content editable (فقط اگر لازم است)
- Payload CMS — https://github.com/payloadcms/payload — CMS مبتنی بر TypeScript/Node؛ پیش از افزودن، CMS موجود بررسی شود.
- Strapi — https://github.com/strapi/strapi — headless CMS.
- Puck — https://github.com/puckeditor/puck — visual page editor برای React.

قانون: اگر CMS موجود پاسخ‌گو است، برای حل یک مشکل ظاهری CMS دیگری اضافه نکن. محتوا باید به‌صورت امن، محدود و قابل نگهداری مدیریت شود.

## 7. Testing / accessibility / QA
- Storybook — https://github.com/storybookjs/storybook — ساخت و مستندسازی componentها در انزوا.
- Playwright — https://github.com/microsoft/playwright — E2E/browser testing.
- axe-core — https://github.com/dequelabs/axe-core — accessibility rules engine؛ در کنار تست دستی.
- Testing Library React — https://github.com/testing-library/react-testing-library — تست بر اساس رفتار کاربر.
- Vitest — https://github.com/vitest-dev/vitest — unit/component testing، اگر با محیط موجود سازگار است.
- Lighthouse — https://github.com/GoogleChrome/lighthouse — audit عملکرد، SEO و best practices.
- web-vitals — https://github.com/GoogleChrome/web-vitals — اندازه‌گیری Web Vitals.
- Chromatic — https://github.com/chromaui/chromatic — visual review/testing برای Storybook؛ بررسی طرح و نیاز تیم.

## 8. Skills / agent instructions
### فهرست رسمی/شناخته‌شده
- Vercel Agent Skills: https://github.com/vercel-labs/agent-skills
  - `frontend-design` یا skill معادل آن، در صورت موجود بودن در نسخه مخزن انتخابی
  - `web-design-guidelines`
  - `vercel-react-best-practices`
  - `vercel-composition-patterns`
  - deployment/performance skills فقط وقتی مطابق محیط پروژه‌اند
- skills CLI: https://github.com/vercel-labs/skills
  - راهنمای نصب/جست‌وجوی skillها: `npx skills find` و `npx skills add ...`
- Frontend design skill مستقل: https://github.com/Junaid-PK/frontend-design-skill
- نمونه skill در مخزن Vercel Open Agents: https://github.com/vercel-labs/open-agents/blob/main/.agents/skills/frontend-design/SKILL.md

### نصب پیشنهادی پس از بررسی
از ریشه پروژه و پس از تأیید محیط/Node نسخه مناسب:
```bash
npx skills find frontend design
npx skills find web design guidelines
npx skills add vercel-labs/agent-skills --list
```
سپس skillهای لازم را بر اساس agent (Codex/Claude Code/Cursor/...) و گزینه‌های قابل نصب در نسخه روز انتخاب کن. نام‌ها ممکن است تغییر کنند؛ ابتدا `--list` و مستندات همان مخزن را مبنا قرار بده. skill را بدون خواندن محتوای `SKILL.md` و بدون بررسی اثر آن در workflow به‌صورت کورکورانه فعال نکن.

### وضعیت مهارت‌های محیط حاضر
در فهرست skillهای قابل خواندن در همین گفت‌وگو، فقط مهارت مربوط به مدیریت پلاگین‌ها مستقیماً قابل مشاهده بود؛ skill تخصصی UI/UX نصب‌شده‌ای در آن فهرست وجود نداشت. بنابراین منابع بالا به‌عنوان گزینه‌های عمومی GitHub معرفی شده‌اند، نه مهارت‌هایی که ادعا کنیم همین حالا در runtime فعال‌اند. ایجنتی که به مخزن دسترسی دارد باید skillهای local/project-level مانند `AGENTS.md`, `.agents/skills/`, `.claude/skills/`, `.cursor/rules/` یا پوشه متناظر را هم بررسی کند.

## 9. راهنمای انتخاب وابستگی
برای هر dependency کاندید این rubric را ثبت کن:
1. آیا قابلیت مورد نیاز را حل می‌کند؟
2. آیا stack و نسخه runtime را پشتیبانی می‌کند؟
3. مجوز برای استفاده موردنظر مناسب است؟
4. پروژه نگهداری و release مناسب دارد؟
5. چه میزان وزن bundle/runtime اضافه می‌کند؟
6. RTL، keyboard و reduced motion را پشتیبانی می‌کند؟
7. آیا پروژه راه‌حل فعلی مشابهی دارد که بهتر است حفظ شود؟
8. راه حذف/جایگزینی در آینده چیست؟

حداکثر یک component foundation اصلی انتخاب کن مگر دلیل فنی ثبت‌شده‌ای برای ترکیب وجود داشته باشد. کتابخانه‌های نمایشی متعدد را روی هم انباشته نکن.

## 10. منابع تصویر برای تحقیق اولیه
- Unsplash search برای feed mills: https://unsplash.com/s/photos/feed-mill
- جست‌وجوی تصویر در این مرحله صرفاً برای درک art direction و پیدا کردن منابع بالقوه است؛ هر فایل باید مجوز و تناسب مشخص داشته باشد. عکس‌های صنعتی مرجع را بدون بررسی license و زمینه استفاده کپی نکن.
