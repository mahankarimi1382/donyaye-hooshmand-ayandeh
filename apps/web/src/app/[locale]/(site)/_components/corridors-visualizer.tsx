'use client';

import { useState } from 'react';
import { Ship, Train, Warehouse, Clock, Scale, ShieldCheck, ArrowLeft, Anchor, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface CorridorsVisualizerProps {
  locale: string;
}

interface HubInfo {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  badgeFa: string;
  badgeEn: string;
  capacity: string;
  berths: string;
  railAccess: boolean;
  clearanceTime: string;
  commoditiesFa: string[];
  commoditiesEn: string[];
  descriptionFa: string;
  descriptionEn: string;
}

const HUBS: HubInfo[] = [
  {
    id: 'bik',
    code: 'IRBKI',
    nameFa: 'پایانه غلات بندر امام خمینی (ره)',
    nameEn: 'Bandar Imam Grain Terminal',
    badgeFa: 'هاب استراتژیک جنوب',
    badgeEn: 'Southern Strategic Hub',
    capacity: '۱۲۰٬۰۰۰ تن در سیلوهای مکانیزه',
    berths: 'اسکله ۳۴ و ۳۵ فله غلات',
    railAccess: true,
    clearanceTime: '۲ الی ۳ روز کاری',
    commoditiesFa: ['ذرت زرد برزیلی', 'کنجاله سویای ۴۴٪ آرژانتین', 'روغن خام سویا'],
    commoditiesEn: ['Brazilian Yellow Corn', 'Argentine Soybean Meal 44%', 'Crude Soy Oil'],
    descriptionFa:
      'بزرگ‌ترین پایانه ترخیص نهاده‌های اقیانوسی کشور مجهز به دستگاه‌های مکنده نیوماتیک با سرعت تخلیه ۸۰۰ تن در ساعت و اتصال مستقیم به خطوط سراسری راه‌آهن.',
    descriptionEn:
      'Premier ocean-going bulk grain port equipped with high-speed pneumatic unloaders (800 MT/hr) and direct national rail siding.',
  },
  {
    id: 'amr',
    code: 'IRAMR',
    nameFa: 'پایانه غلات بندر امیرآباد (کاسپین)',
    nameEn: 'Amirabad Caspian Grain Hub',
    badgeFa: 'هاب غلات حوزه خزر',
    badgeEn: 'Caspian Grain Hub',
    capacity: '۷۵٬۰۰۰ تن سیلوهای عمودی',
    berths: 'حوضچه غلات و اسکله رو-رو',
    railAccess: true,
    clearanceTime: '۱ الی ۲ روز کاری',
    commoditiesFa: ['جو دامی قزاقستان', 'گندم دامی استاندارد', 'جو دامی روسیه'],
    commoditiesEn: ['Kazakh Feed Barley', 'Standard Feed Wheat', 'Russian Feed Barley'],
    descriptionFa:
      'تنها بندر شمالی متصل به شبکه ریلی سراسری کشور، دارای پایانه‌های تخصصی بوجاری، هوادهی سیلوها و بارگیری روزانه قطارهای باری به مقاصد سراسر ایران.',
    descriptionEn:
      'Sole northern port connected to the national railway network, featuring mechanized cleaning, aerated silo cells, and daily bulk rail dispatch.',
  },
  {
    id: 'anz',
    code: 'IRANZ',
    nameFa: 'پایانه بنادر انزلی و نوشهر',
    nameEn: 'Anzali & Noshahr Terminals',
    badgeFa: 'کریدور خزر غربی',
    badgeEn: 'Western Caspian Corridor',
    capacity: '۴۰٬۰۰۰ تن انبارش مسقف',
    berths: 'اسکله‌های چندمنظوره فله',
    railAccess: false,
    clearanceTime: '۲ روز کاری',
    commoditiesFa: ['جو دامی هکتولیتر بالا', 'کنجاله آفتابگردان', 'سبوس گندم'],
    commoditiesEn: ['High Test Weight Barley', 'Sunflower Meal', 'Wheat Bran'],
    descriptionFa:
      'ترخیص بهنگام محموله‌های سبک دریایی با نظارت مستمر قرنطینه استانی و توزیع مستقیم جاده‌ای به مرغداری‌های استان‌های گیلان، مازندران و قزوین.',
    descriptionEn:
      'Rapid maritime discharge for regional feed distribution with dedicated quarantine assays and direct road freight to northern poultry farms.',
  },
  {
    id: 'thr',
    code: 'IRTHR',
    nameFa: 'هاب مرکزی انبار و دپوی تهران',
    nameEn: 'Tehran Central Logistics Depot',
    badgeFa: 'پایگاه توزیع مرکزی',
    badgeEn: 'Inland Distribution Depot',
    capacity: '۲۵٬۰۰۰ تن دپوی مکمل و کیسه',
    berths: 'بارانداز مرکزی ترانزیت',
    railAccess: true,
    clearanceTime: 'توزیع روزانه و ۲۴ ساعته',
    commoditiesFa: ['دی‌کلسیم فسفات (DCP)', 'ال-لیزین و متیونین', 'کنجاله پنبه‌دانه'],
    commoditiesEn: ['Dicalcium Phosphate (DCP)', 'L-Lysine & DL-Methionine', 'Cottonseed Meal'],
    descriptionFa:
      'انبارش تخصصی در دمای کنترل‌شده برای مکمل‌ها، ریزمغذی‌ها و اسیدهای آمینه حساس، با توزین رسمی باسکول دیجیتال و تحویل روزانه به کارخانجات خوراک.',
    descriptionEn:
      'Climate-monitored warehousing for premixes, amino acids, and DCP, certified weighbridge facilities, and scheduled dispatch to regional feed mills.',
  },
];

export function CorridorsVisualizer({ locale }: CorridorsVisualizerProps) {
  const isFa = locale === 'fa';
  const [selectedHubId, setSelectedHubId] = useState<string>('bik');

  const selectedHub = HUBS.find((h) => h.id === selectedHubId) ?? HUBS[0];

  return (
    <div className="w-full rounded-3xl border border-m3-outline-variant/40 bg-m3-surface-lowest p-6 sm:p-8 shadow-m3-2 text-start">
      {/* Hub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-m3-outline-variant/30">
        <span className="text-xs font-bold text-m3-outline shrink-0 me-2">
          {isFa ? 'انتخاب پایانه:' : 'Select Hub:'}
        </span>
        {HUBS.map((hub) => (
          <button
            key={hub.id}
            type="button"
            onClick={() => setSelectedHubId(hub.id)}
            className={`m3-press-state rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 inline-flex items-center gap-2 ${
              selectedHubId === hub.id
                ? 'bg-m3-primary text-white shadow-m3-1'
                : 'bg-m3-surface-container text-m3-on-surface-variant hover:bg-m3-surface-container-high'
            }`}
          >
            <Anchor className="size-3.5" />
            <span>{isFa ? hub.nameFa : hub.nameEn}</span>
          </button>
        ))}
      </div>

      {/* Hub Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* Left Information Stack */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>{isFa ? selectedHub.badgeFa : selectedHub.badgeEn}</span>
            </span>
            <span className="font-mono text-xs font-bold text-m3-tertiary bg-m3-tertiary-container/50 px-2.5 py-1 rounded-lg" dir="ltr">
              <bdi>CODE: {selectedHub.code}</bdi>
            </span>
          </div>

          <h3 className="text-2xl font-black text-m3-on-surface">
            {isFa ? selectedHub.nameFa : selectedHub.nameEn}
          </h3>

          <p className="text-sm text-m3-on-surface-variant leading-relaxed">
            {isFa ? selectedHub.descriptionFa : selectedHub.descriptionEn}
          </p>

          {/* Handled Commodities List */}
          <div>
            <h4 className="text-xs font-bold text-m3-on-surface mb-2.5">
              {isFa ? 'نهاده‌های اصلی قابل بارگیری در این پایانه:' : 'Key Commodities Handled:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {(isFa ? selectedHub.commoditiesFa : selectedHub.commoditiesEn).map((com) => (
                <span
                  key={com}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-m3-surface-container border border-m3-outline-variant/30 text-xs font-semibold text-m3-on-surface"
                >
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  <span>{com}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Metric Cards Stack */}
        <div className="lg:col-span-5 bg-m3-surface-container/60 rounded-3xl p-6 border border-m3-outline-variant/40 space-y-4">
          <div className="p-3.5 rounded-2xl bg-m3-surface-lowest border border-m3-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-m3-outline flex items-center gap-1.5">
              <Warehouse className="size-4 text-m3-primary" />
              <span>ظرفیت سیلو و دپو:</span>
            </span>
            <span className="font-bold text-m3-on-surface">{selectedHub.capacity}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-m3-surface-lowest border border-m3-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-m3-outline flex items-center gap-1.5">
              <Ship className="size-4 text-m3-secondary" />
              <span>اسکله‌های پهلوگیری:</span>
            </span>
            <span className="font-bold text-m3-on-surface">{selectedHub.berths}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-m3-surface-lowest border border-m3-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-m3-outline flex items-center gap-1.5">
              <Train className="size-4 text-m3-tertiary" />
              <span>اتصال مستقیم ریلی:</span>
            </span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {selectedHub.railAccess ? (isFa ? 'دارد (واگن باری)' : 'Active Rail Siding') : isFa ? 'حمل جاده‌ای' : 'Road Fleet'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-m3-surface-lowest border border-m3-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-m3-outline flex items-center gap-1.5">
              <Clock className="size-4 text-sky-600" />
              <span>میانگین زمان ترخیص:</span>
            </span>
            <span className="font-mono font-bold text-m3-primary">{selectedHub.clearanceTime}</span>
          </div>

          {/* Action Link */}
          <div className="pt-2">
            <Link
              href={`/rfq?port=${encodeURIComponent(isFa ? selectedHub.nameFa : selectedHub.nameEn)}`}
              className="m3-press-state w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-m3-primary hover:bg-m3-primary-hover text-white text-xs font-bold shadow-xs transition"
            >
              <span>{isFa ? `ثبت استعلام تحویل در ${selectedHub.nameFa}` : 'Inquire at this Hub'}</span>
              <ArrowLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
