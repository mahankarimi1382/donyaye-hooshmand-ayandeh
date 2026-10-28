# AGENTS.md — دنیای هوشمند آینده

## هدف
بازنویسی کامل و منسجم UI/UX فرانت‌اند برای یک وب‌سایت B2B در حوزه نهاده‌های دامی، با تمرکز بر اعتماد، کشف محصول، اطلاعات فنی واقعی و درخواست استعلام.

## ابتدا بخوان
- `00_MASTER_PROMPT_FA.md`
- `01_PROJECT_BRIEF_FA.md`
- `02_INFORMATION_ARCHITECTURE_FA.md`
- `03_DESIGN_SYSTEM_FA.md`
- `04_ROADMAP_TASKS_FA.md`
- `05_COMPONENTS_AND_INTERACTIONS_FA.md`
- `06_CONTENT_AND_ASSETS_FA.md`
- `07_QA_ACCEPTANCE_FA.md`
- `08_REFERENCES_REPOS_SKILLS_FA.md`

## قواعد غیرقابل مذاکره
1. پیش از تغییر کد، stack، routeها، APIها، CMS، تست‌ها و وضعیت git را بررسی کن.
2. داده، محصول، مشخصات فنی، مجوز، مشتری، ظرفیت و ادعای تجاری را جعل نکن.
3. فرانت‌اند را بازنویسی کن؛ backend/API/business logic را بدون دلیل و شواهد تغییر نده.
4. تمامی routeهای موجود را بررسی کن؛ صرفاً Home را تغییر نده.
5. RTL واقعی، responsive، keyboard accessibility و reduced motion را تست کن.
6. هیچ button/link/form/download بی‌اثر یا جعلی باقی نگذار.
7. از tokens و componentهای مشترک استفاده کن؛ style پراکنده نساز.
8. dependency جدید را فقط بعد از بررسی سازگاری، مجوز، نگهداری و وزن اضافه کن.
9. دستورات lint/typecheck/test/build و نتیجه واقعی را ثبت کن.
10. بدون دستور صریح commit/push/release/deploy نکن و تغییرات کاربر را پاک نکن.

## گزارش اجباری
`AUDIT.md`, `DESIGN_DECISIONS.md`, `ROUTES_AND_PAGE_STATUS.md`, `OPEN_QUESTIONS.md`, `QA_REPORT.md` و ثبت نهایی در `09_EXECUTION_LOG_TEMPLATE_FA.md`.

## معیار پایان
تمام routeها بررسی شده باشند؛ صفحات کلیدی یک زبان طراحی واحد داشته باشند؛ CTAها و فرم‌ها واقعی باشند؛ اطلاعات ساختگی در production نباشد؛ RTL و viewportهای کلیدی تست شوند؛ نتایج lint/typecheck/test/build با شواهد گزارش شوند.
