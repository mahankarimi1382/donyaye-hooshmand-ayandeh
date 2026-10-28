export interface BlogPost {
  slug: string;
  title: { fa: string; en: string };
  excerpt: { fa: string; en: string };
  category: { fa: string; en: string };
  categorySlug: string;
  readTime: { fa: string; en: string };
  date: { fa: string; en: string };
  author: {
    name: { fa: string; en: string };
    role: { fa: string; en: string };
    avatarText: string;
  };
  content: {
    fa: {
      lead: string;
      sections: { heading: string; body: string }[];
      quote?: string;
      keyTakeaways: string[];
    };
    en: {
      lead: string;
      sections: { heading: string; body: string }[];
      quote?: string;
      keyTakeaways: string[];
    };
  };
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'soya-meal-urease-activity-guide',
    title: {
      fa: 'راهنمای جامع ارزیابی شاخص اوره‌آز در کنجاله سویای وارداتی',
      en: 'Comprehensive Guide to Urease Activity in Imported Soybean Meal',
    },
    excerpt: {
      fa: 'بررسی اثرات حرارت‌دیدگی و تغییرات فعالیت آنزیم اوره‌آز بر قابلیت هضم پروتئین و ضریب تبدیل خوراک در گله‌های صنعتی.',
      en: 'Evaluating thermal processing effects and urease index on protein digestibility and feed conversion rates.',
    },
    category: { fa: 'تغذیه دام و طیور', en: 'Animal Nutrition' },
    categorySlug: 'nutrition',
    readTime: { fa: '۸ دقیقه', en: '8 min read' },
    date: { fa: '۱۵ اردیبهشت ۱۴۰۵', en: 'May 5, 2026' },
    author: {
      name: { fa: 'دکتر حمیدرضا کریمی', en: 'Dr. H. Karimi' },
      role: { fa: 'مشاور ارشد تغذیه و جیره‌نویسی دام', en: 'Senior Nutritionist' },
      avatarText: 'ح.ک',
    },
    content: {
      fa: {
        lead: 'کنجاله سویا ستون اصلی تأمین پروتئین در صنعت پرورش طیور و دام کشور است. کیفیت این نهاده وابستگی مستقیمی به فرآیند پخت و غیرفعال‌سازی فاکتورهای ضدتغذیه‌ای نظیر مهارکننده‌های تریپسین دارد که از طریق شاخص فعالیت اوره‌آز (Urease Index) پایش می‌شود.',
        sections: [
          {
            heading: '۱. شاخص اوره‌آز چیست و چرا پایش آن حیاتی است؟',
            body: 'دانه‌های خام سویا حاوی آنزیم اوره‌آز و پروتئین‌های ضدتغذیه هستند که مانع جذب اسیدهای آمینه در روده پرنده می‌شوند. در کارخانجات دانه‌بندی، سویا حرارت می‌بیند. اگر حرارت ناکافی باشد، اوره‌آز باقی می‌ماند (کمتر پخته‌شده) و اگر بیش از حد باشد، اسید آمینه لیزین تخریب می‌شود (بیشتر پخته‌شده). بنابراین بازه مطلوب فعالیت اوره‌آز بین ۰٫۰۵ تا ۰٫۲۰ اختلاف pH تعریف شده است.',
          },
          {
            heading: '۲. اثر اوره‌آز بالا بر سلامت دستگاه گوارش گله',
            body: 'مصرف کنجاله سویای با اوره‌آز فراتر از ۰٫۲۵ منجر به هیپرتروفی لوزالمعده، تحریک موکوس روده، خیس شدن بستر و افت محسوس در راندمان ضریب تبدیل غذایی (FCR) می‌گردد. در مزارع مرغ گوشتی، این افت می‌تواند هزینه تولید هر کیلوگرم وزن زنده را به میزان چشمگیری افزایش دهد.',
          },
          {
            heading: '۳. فرآیند بازرسی نمونه‌ها پیش از تخلیه در بنادر',
            body: 'شرکت دنیای هوشمند آینده در پایانه بندر امام خمینی (ره) با همکاری بازرسان بین‌المللی SGS و آزمایشگاه همکار دامپزشکی، بر اساس متد استاندارد ملی ۳۲۱، نمونه‌های ترکیبی از انبارهای کشتی اخذ کرده و پیش از صدور مجوز بارگیری، برگه آزمون آزمایشگاهی را ضمیمه بارنامه می‌نماید.',
          },
        ],
        quote: 'ثبات در شاخص اوره‌آز و پروتئین خام کنجاله سویا، پیش‌نیاز قطعی ثبات در ضریب تبدیل گله و تضمین سودآوری اقتصادی است.',
        keyTakeaways: [
          'بازه بهینه شاخص اوره‌آز بین ۰٫۰۵ تا ۰٫۲۰ میلی‌گرم نیتروژن است.',
          'اوره‌آز کمتر از ۰٫۰۲ نشان‌دهنده سوختگی و کاهش زیست‌فراهمی اسید آمینه لیزین است.',
          'هر محموله وارداتی شرکت همراه با گواهی آزمون پیش از بارگیری تحویل می‌شود.',
        ],
      },
      en: {
        lead: 'Soybean meal represents the primary protein source for modern poultry and livestock operations. Quality hinges upon optimal thermal processing monitored via urease activity index.',
        sections: [
          {
            heading: '1. What is Urease Index and why does it matter?',
            body: 'Raw soybeans contain urease and trypsin inhibitors. Optimal processing requires sufficient toasting to deactivate anti-nutritional factors without scorching essential lysine.',
          },
          {
            heading: '2. Impact on herd health and FCR',
            body: 'High urease content elevates intestinal inflammation, increases litter moisture, and worsens feed conversion ratios.',
          },
          {
            heading: '3. Inspection protocols at discharge ports',
            body: 'Donyaye Hooshmand Ayandeh mandates independent lab verification per ISO/GAFTA methods prior to dispatch from port silos.',
          },
        ],
        quote: 'Consistency in urease activity directly guarantees stable feed conversion performance.',
        keyTakeaways: [
          'Optimal urease range is 0.05 to 0.20 delta pH.',
          'Values below 0.02 indicate overheating and lysine destruction.',
          'All port dispatches are accompanied by verified lab certificates.',
        ],
      },
    },
    tags: ['کنجاله سویا', 'شاخص اوره‌آز', 'تغذیه طیور', 'کنترل کیفیت'],
  },
  {
    slug: 'corn-aflatoxin-port-storage',
    title: {
      fa: 'روش‌های نوین کنترل رطوبت و مایکوتوکسین‌ها در سیلوهای بندرامام',
      en: 'Modern Moisture and Mycotoxin Management in Port Grain Silos',
    },
    excerpt: {
      fa: 'تحلیل شرایط هوادهی و پایش دمایی ذرت دانه‌ای در پایانه‌های بندری جهت حفظ استاندارد زیر ۲۰ ppb آفلاتوکسین.',
      en: 'Analyzing ventilation and temperature monitoring in port grain silos to guarantee aflatoxin levels under 20 ppb.',
    },
    category: { fa: 'لجستیک و سیلوداری', en: 'Port Logistics' },
    categorySlug: 'logistics',
    readTime: { fa: '۱۰ دقیقه', en: '10 min read' },
    date: { fa: '۱۰ اردیبهشت ۱۴۰۵', en: 'April 30, 2026' },
    author: {
      name: { fa: 'مهندس سارا تهرانی', en: 'Sara Tehrani' },
      role: { fa: 'مدیر عملیات و سیلوداری بندری', en: 'Head of Port Terminal Operations' },
      avatarText: 'س.ت',
    },
    content: {
      fa: {
        lead: 'حفظ سلامت کیفی غلات وارداتی در شرایط اقلیمی گرم و مرطوب خوزستان، مستلزم بهره‌برداری از سیلوهای بتنی و فلزی مجهز به پایش پیوسته دما و سیستم‌های هوادهی هدایت‌شده است.',
        sections: [
          {
            heading: '۱. خطرات رطوبت بالا در محموله‌های فله ذرت',
            body: 'ذرت دانه‌ای با رطوبت بیش از ۱۴٪ در دمای بالاتر از ۲۵ درجه مستعد رشد قارچ‌های آسپرژیلوس فلاووس و تولید آفلاتوکسین B1 است. این سم قارچی مقاومت بالایی در برابر حرارت دارد و در صورت آلودگی، غیرقابل پالایش خواهد بود.',
          },
          {
            heading: '۲. سیستم‌های پایش سنسوری در سیلوهای بندر امام خمینی (ره)',
            body: 'در سیلوهای مدرن پایانه بندر امام، کابل‌های ترموسنسور در اعماق مختلف ستون غلات مستقر هستند تا هرگونه بالا رفتن موضعی دما (Hotspot) که نشان‌دهنده شروع فعالیت قارچی یا تنفس دانه است، فوراً شناسایی و با فن‌های مکنده خنک‌سازی شود.',
          },
          {
            heading: '۳. نمونه‌برداری طبق استاندارد ایزو ۲۴۳۳۳',
            body: 'نمونه‌گیری متقاطع با بوردارهای پنوماتیک در تمام سطوح انبار کشتی و واگن‌ها انجام می‌گیرد تا اطمینان حاصل شود شاخص آفلاتوکسین کل محموله طبق ضوابط سازمان دامپزشکی کشور زیر ۲۰ ppb قرار دارد.',
          },
        ],
        quote: 'سیلوداری اصولی، آخرین سنگر حفظ ارزش غذایی غلات تا رسیدن به خطوط تولید کارخانجات خوراک است.',
        keyTakeaways: [
          'حداکثر رطوبت مجاز ذرت دامی استاندارد ۱۴ درصد است.',
          'پایش مستمر دمای ستون دانه از تشکیل نقاط داغ و کلوخه‌شدگی جلوگیری می‌کند.',
          'حد مجاز آفلاتوکسین سازمان دامپزشکی کمتر از ۲۰ ppb با تاییدیه HPLC است.',
        ],
      },
      en: {
        lead: 'Preserving imported bulk corn quality in southern humid maritime climates demands advanced silo ventilation and temperature monitoring.',
        sections: [
          {
            heading: '1. Risks of excess moisture in bulk corn',
            body: 'Moisture levels exceeding 14% at elevated temperatures trigger Aspergillus growth and mycotoxin formation.',
          },
          {
            heading: '2. Sensor-based thermal monitoring in silos',
            body: 'Vertical sensor cables detect thermal hotspots instantly, initiating high-velocity cooling aeration.',
          },
          {
            heading: '3. ISO 24333 compliant sampling',
            body: 'Pneumatic probe sampling confirms aflatoxin thresholds remain strictly below 20 ppb.',
          },
        ],
        quote: 'Professional silo management preserves grain nutritional energy down to feed production lines.',
        keyTakeaways: [
          'Standard maximum grain moisture is 14%.',
          'Continuous thermal monitoring prevents hotspot caking.',
          'Aflatoxin limits are kept below 20 ppb via HPLC testing.',
        ],
      },
    },
    tags: ['ذرت دامی', 'آفلاتوکسین', 'سیلوداری', 'بندر امام خمینی'],
  },
  {
    slug: 'caspian-grain-corridor-overview',
    title: {
      fa: 'بررسی مزیت‌های لجستیکی واردات جو و گندم از حوزه خزر به بندر امیرآباد',
      en: 'Logistics Advantages of Caspian Grain Corridors via Amirabad Port',
    },
    excerpt: {
      fa: 'کاهش هزینه‌های دموراژ، تخلیه مکانیزه واگن‌های باری و تسریع توزیع در استان‌های شمالی و مرکزی کشور از طریق هاب امیرآباد.',
      en: 'Demurrage reduction, rail hopper bulk discharge, and expedited distribution across central provinces via Amirabad hub.',
    },
    category: { fa: 'تحلیل بازار غلات', en: 'Market Analysis' },
    categorySlug: 'market',
    readTime: { fa: '۷ دقیقه', en: '7 min read' },
    date: { fa: '۲۸ فروردین ۱۴۰۵', en: 'April 17, 2026' },
    author: {
      name: { fa: 'مهندس رضا باقری', en: 'Reza Bagheri' },
      role: { fa: 'تحلیل‌گر زنجیره تأمین بازرگانی', en: 'Supply Chain Analyst' },
      avatarText: 'ر.ب',
    },
    content: {
      fa: {
        lead: 'کریدور دریای خزر کوتاه‌ترین و اقتصادی‌ترین مسیر برای دسترسی به منابع غلات دامی کشورهای روسیه و قزاقستان است. در این میان، بندر امیرآباد به عنوان تنها بندر متصل به شبکه سراسری راه‌آهن در شمال کشور، نقش کلیدی ایفا می‌کند.',
        sections: [
          {
            heading: '۱. زمان سیر کوتاه‌تر و انعطاف‌پذیری محموله‌ها',
            body: 'حمل دریایی از بنادر آستراخان و آکتائو به بندر امیرآباد بین ۲ تا ۴ روز زمان می‌برد که در مقایسه با مسیرهای اقیانوسی ۴۰ روزه برزیل، امکان مدیریت دقیق‌تر انبارها و انعطاف در تأمین دوره‌ای را برای تولیدکنندگان فراهم می‌سازد.',
          },
          {
            heading: '۲. اتصال مستقیم به خطوط ریلی سراسری',
            body: 'امکان بارگیری واگن‌های فله‌بر سرپوشیده مستقیماً از خروجی سیلوهای بندر امیرآباد، هزینه‌های حمل جاده‌ای را تا ۳۰ درصد برای مقاصد با فاصله بالای ۵۰۰ کیلومتر کاهش می‌دهد.',
          },
          {
            heading: '۳. ویژگی‌های کیفی جو دامی قزاقستان و روسیه',
            body: 'جو دامی وارداتی از این حوزه دارای وزن هکتولیتر بالای ۶۲ کیلوگرم، پروتئین ۱۰٫۵ تا ۱۱ درصد و افت مفید کمتر از ۲ درصد است که استانداردی عالی برای خوراک نشخوارکنندگان محسوب می‌شود.',
          },
        ],
        quote: 'اتصال ریلی بندر امیرآباد هزینه ترانزیت غلات را برای کارخانجات خوراک البرز، سمنان و خراسان به شدت رقابتی می‌سازد.',
        keyTakeaways: [
          'زمان حمل دریایی در خزر تنها ۲ الی ۴ روز است.',
          'اتصال مستقیم ریلی هزینه‌های جابه‌جایی سنگین را تا ۳۰٪ کاهش می‌دهد.',
          'جو وارداتی حوزه خزر دارای هکتولیتر بالای ۶۲ کیلوگرم است.',
        ],
      },
      en: {
        lead: 'The Caspian maritime corridor offers the most direct access to Russian and Kazakh feed grain reserves, anchored by the rail-connected Amirabad port hub.',
        sections: [
          {
            heading: '1. Rapid transit and flexible scheduling',
            body: 'Transit times from Astrakhan and Aktau range from 2 to 4 days, enabling agile inventory replenishment.',
          },
          {
            heading: '2. Direct national railway integration',
            body: 'Direct silo-to-hopper loading reduces interprovincial freight rates by up to 30%.',
          },
          {
            heading: '3. Quality profile of Caspian barley',
            body: 'Delivering test weights above 62 kg/hl and crude protein over 10.5%, ideally suited for ruminant nutrition.',
          },
        ],
        quote: 'Rail connectivity at Amirabad establishes superior supply efficiency for central feed manufacturing plants.',
        keyTakeaways: [
          'Transit time is only 2 to 4 maritime days.',
          'Rail connectivity reduces heavy transit costs by up to 30%.',
          'Barley test weights consistently exceed 62 kg/hl.',
        ],
      },
    },
    tags: ['جو دامی', 'بندر امیرآباد', 'کریدور خزر', 'حمل ریلی'],
  },
  {
    slug: 'dcp-feed-grade-standards',
    title: {
      fa: 'اهمیت سنجش فلزات سنگین و نسبت کلسیم به فسفر در دی‌کلسیم فسفات (DCP)',
      en: 'Assessing Heavy Metals and Ca:P Ratio in Feed Grade DCP',
    },
    excerpt: {
      fa: 'بررسی استانداردهای ملی و بین‌المللی در خصوص حداکثر مجاز فلوئور و فلزات سنگین در مکمل‌های فسفاته خوراک دام.',
      en: 'Reviewing national and global standards for fluorine tolerance and calcium-to-phosphorus ratios in feed phosphate.',
    },
    category: { fa: 'کنترل کیفیت', en: 'Quality Assurance' },
    categorySlug: 'quality',
    readTime: { fa: '۶ دقیقه', en: '6 min read' },
    date: { fa: '۱۸ فروردین ۱۴۰۵', en: 'April 7, 2026' },
    author: {
      name: { fa: 'دکتر علی صادقی', en: 'Dr. Ali Sadeghi' },
      role: { fa: 'سرپرست آزمایشگاه کنترل کیفی', en: 'Quality Lab Director' },
      avatarText: 'ع.ص',
    },
    content: {
      fa: {
        lead: 'دی‌کلسیم فسفات (DCP) اصلی‌ترین منبع تأمین فسفر و کلسیم قابل جذب در اسکلت‌بندی و متابولیسم سلولی دام و طیور است. با این حال، استفاده از منابع نامرغوب یا صنعتی می‌تواند خطر مسمومیت با فلوئور و فلزات سنگین را به همراه داشته باشد.',
        sections: [
          {
            heading: '۱. نسبت مطلوب کلسیم به فسفر',
            body: 'در DCP استاندارد گرید خوراکی، میزان فسفر کل باید حداقل ۱۸ درصد و میزان کلسیم بین ۲۱ تا ۲۴ درصد باشد. هرگونه عدم تعادل در این نسبت، توازن جیره را برهم زده و جذب سایر ریزمغذی‌ها را مختل می‌سازد.',
          },
          {
            heading: '۲. حد بحرانی فلوئور در مکمل‌های فسفاته',
            body: 'میزان فلوئور در DCP دامی نباید از ۰٫۱۸٪ (۱۸۰۰ ppm) فراتر رود. فلوئور مازاد منجر به فلوئوروزیس، تخریب بافت دندان‌ها و استخوان‌ها و افت شدید اشتها در دام می‌گردد.',
          },
          {
            heading: '۳. خلوص فیزیکی و دانه‌بندی یکنواخت',
            body: 'مکمل‌های ارائه‌شده توسط شرکت به صورت پودری میکرونیزه و گرانول‌های فاقد ناخالصی ماسه‌ای و فاقد بو است که میکس همگن آن را در کارخانجات تولید پلت تضمین می‌کند.',
          },
        ],
        quote: 'فسفر گران‌بهاترین عنصر در فرمولاسیون خوراک است؛ خلوص بالا و فقدان فلزات سنگین، تضمین سلامت کبد و کلیه گله است.',
        keyTakeaways: [
          'میزان فسفر قابل استفاده در DCP حداقل ۱۸ درصد است.',
          'آستانه حداکثر فلوئور کمتر از ۰٫۱۸ درصد بر مبنای ICP است.',
          'تمامی بسته‌بندی‌ها به صورت کیسه‌های ۵۰ کیلویی دو لایه ضد رطوبت عرضه می‌شوند.',
        ],
      },
      en: {
        lead: 'Feed-grade dicalcium phosphate (DCP) serves as the primary bioavailable phosphorus and calcium donor for skeletal development in poultry and livestock.',
        sections: [
          {
            heading: '1. Optimal Ca:P balance',
            body: 'Standard feed DCP requires a minimum of 18% phosphorus and 21-24% calcium for optimal biological retention.',
          },
          {
            heading: '2. Critical fluorine thresholds',
            body: 'Fluorine levels must not exceed 0.18% (1800 ppm) to prevent toxic skeletal fluorosis.',
          },
          {
            heading: '3. Homogeneous physical granulation',
            body: 'Uniform granulation ensures dust-free, homogenous dispersion in pellet mixer lines.',
          },
        ],
        quote: 'Phosphorus is the most valuable dietary mineral; certified purity preserves vital organ health.',
        keyTakeaways: [
          'Available phosphorus minimum is 18%.',
          'Fluorine ceiling is strictly below 0.18%.',
          'Packaged in heavy-duty 50 kg moisture-barrier bags.',
        ],
      },
    },
    tags: ['دی‌کلسیم فسفات', 'مکمل دامی', 'فسفر ۱۸٪', 'استاندارد کیفیت'],
  },
  {
    slug: 'incoterms-2020-feed-trade',
    title: {
      fa: 'راهنمای کاربردی اینکوترمز ۲۰۲۰ در حمل فله دریایی نهاده‌های دامی',
      en: 'Practical Guide to Incoterms 2020 in Bulk Feed Grain Shipping',
    },
    excerpt: {
      fa: 'تفکیک نقاط انتقال ریسک، هزینه خسارت و کرایه حمل دریایی در ترم‌های FOB بنادر بارگیری و CFR بنادر ایران.',
      en: 'Clarifying risk transfer, demurrage liabilities, and ocean freight costs under FOB and CFR rules for Iranian discharge ports.',
    },
    category: { fa: 'قوانین بازرگانی', en: 'Trade Regulations' },
    categorySlug: 'trade',
    readTime: { fa: '۱۱ دقیقه', en: '11 min read' },
    date: { fa: '۵ فروردین ۱۴۰۵', en: 'March 25, 2026' },
    author: {
      name: { fa: 'علیرضا رستمی', en: 'Alireza Rostami' },
      role: { fa: 'مدیر امور حقوقی و قراردادها', en: 'Legal and Contracts Director' },
      avatarText: 'ع.ر',
    },
    content: {
      fa: {
        lead: 'در مبادلات بین‌المللی کالاهای اساسی و فله کشاورزی، درک صحیح از شرایط قراردادهای اینکوترمز ۲۰۲۰ (به ویژه قواعد FOB، CFR و CIF) جهت پیشگیری از اختلافات حقوقی پیرامون خسارت دریا و هزینه‌های دموراژ اسکله الزامی است.',
        sections: [
          {
            heading: '۱. قاعده FOB (Free on Board)',
            body: 'در شرایط FOB، مسئولیت فروشنده با عبور کالا از لبه کشتی در بندر مبدأ به اتمام می‌رسد. تمامی هزینه‌های کرایه حمل دریایی، بیمه باربری و ریسک‌های ناشی از تأخیرات آبراه‌ها متوجه خریدار خواهد بود.',
          },
          {
            heading: '۲. قاعده CFR (Cost and Freight)',
            body: 'در معاملات نهاده‌های دامی به مقصد بنادر ایران، ترم CFR یکی از متداول‌ترین روش‌هاست. فروشنده هزینه حمل دریایی تا بندر امام یا امیرآباد را پرداخت می‌کند، اما ریسک آسیب دیدن کالا در طول سفر دریایی پس از بارگیری متوجه خریدار است و نیازمند بیمه معتبر باربری است.',
          },
          {
            heading: '۳. ضوابط تحویل در پایانه سیلو (Ex-Silo)',
            body: 'برای تولیدکنندگان داخلی که تمایلی به درگیر شدن با پیچیدگی‌های دریایی ندارند، شرکت دنیای هوشمند آینده امکان تحویل کالا به صورت ترخیص‌شده پای باسکول سیلوهای بندر امام یا امیرآباد را با فاکتور رسمی ریالی فراهم می‌نماید.',
          },
        ],
        quote: 'قراردادهای شفاف مبتنی بر اینکوترمز ۲۰۲۰، ابهام در مسئولیت‌های بیمه‌ای و ترخیص را به صفر می‌رساند.',
        keyTakeaways: [
          'در ترم CFR هزینه حمل بر عهده فروشنده و ریسک مسیر بر عهده خریدار است.',
          'تهیه بیمه‌نامه معتبر برای محموله‌های فله اقیانوسی الزامی است.',
          'فروش پای سیلو (Ex-Silo) ساده‌ترین شیوه تحویل برای کارخانجات داخلی است.',
        ],
      },
      en: {
        lead: 'Mastering Incoterms 2020 rules for bulk agricultural trade eliminates ambiguities regarding marine loss, freight responsibilities, and demurrage liabilities.',
        sections: [
          {
            heading: '1. The FOB rule',
            body: 'Risk passes once cargo is loaded on board the vessel at the departure port. Ocean freight and marine insurance are managed by the buyer.',
          },
          {
            heading: '2. The CFR rule',
            body: 'The seller pays ocean freight to Iranian discharge ports, while maritime transit risk transfers upon departure loading.',
          },
          {
            heading: '3. Ex-Silo delivery solutions',
            body: 'Donyaye Hooshmand Ayandeh provides domestic cleared deliveries ex-silo at BIK and Amirabad under transparent official invoicing.',
          },
        ],
        quote: 'Standardized Incoterms 2020 contracts eliminate insurance and customs disputes.',
        keyTakeaways: [
          'Under CFR, freight is paid by the seller, while transit risk rests with the buyer.',
          'Comprehensive marine insurance is mandatory for ocean voyages.',
          'Ex-Silo purchasing represents the simplest pathway for domestic feed mills.',
        ],
      },
    },
    tags: ['اینکوترمز ۲۰۲۰', 'حمل دریایی', 'قرارداد بازرگانی', 'ترخیص بندر'],
  },
];

export function listBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
