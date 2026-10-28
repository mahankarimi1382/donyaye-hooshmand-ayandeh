'use client';

import { useId, useMemo, useState } from 'react';
import { Calculator, ArrowLeft, Truck, Wheat, CheckCircle2, RotateCcw } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

interface FeedCalculatorProps {
  locale: string;
}

type FarmType = 'broiler' | 'layer' | 'dairy' | 'feedmill';

export function FeedCalculator({ locale }: FeedCalculatorProps) {
  const isFa = locale === 'fa';
  const router = useRouter();

  const [farmType, setFarmType] = useState<FarmType>('broiler');
  const [headCount, setHeadCount] = useState<number>(50000); // 50,000 birds default
  const [periodMonths, setPeriodMonths] = useState<number>(2); // 2 months / cycles

  const estimates = useMemo(() => {
    let totalTonnage = 0;
    let cornTonnage = 0;
    let soyTonnage = 0;
    let otherTonnage = 0;
    let otherLabel = isFa ? 'جو و مکمل‌ها' : 'Barley & Additives';

    if (farmType === 'broiler') {
      // 4.5 kg total feed per bird per 45-day cycle
      // 55% Corn, 25% Soybean meal, 20% Wheat/DCP/Premix
      const totalKg = headCount * 4.5 * (periodMonths / 1.5);
      totalTonnage = Math.round(totalKg / 1000);
      cornTonnage = Math.round(totalTonnage * 0.55);
      soyTonnage = Math.round(totalTonnage * 0.25);
      otherTonnage = totalTonnage - cornTonnage - soyTonnage;
      otherLabel = isFa ? 'گندم، دی‌کلسیم فسفات و مکمل' : 'Wheat, DCP & Additives';
    } else if (farmType === 'layer') {
      // 110g per hen per day
      // 60% Corn, 20% Soybean meal, 20% Limestone/DCP/Premix
      const days = periodMonths * 30;
      const totalKg = headCount * 0.11 * days;
      totalTonnage = Math.round(totalKg / 1000);
      cornTonnage = Math.round(totalTonnage * 0.60);
      soyTonnage = Math.round(totalTonnage * 0.20);
      otherTonnage = totalTonnage - cornTonnage - soyTonnage;
      otherLabel = isFa ? 'دی‌کلسیم فسفات، صدف و مکمل' : 'DCP, Calcium & Additives';
    } else if (farmType === 'dairy') {
      // 16 kg concentrate per cow per day
      // 35% Corn, 25% Soybean meal/Cottonseed, 25% Barley, 15% DCP/Minerals
      const days = periodMonths * 30;
      const totalKg = headCount * 16 * days;
      totalTonnage = Math.round(totalKg / 1000);
      cornTonnage = Math.round(totalTonnage * 0.35);
      soyTonnage = Math.round(totalTonnage * 0.25);
      otherTonnage = totalTonnage - cornTonnage - soyTonnage;
      otherLabel = isFa ? 'جو دامی، کنجاله پنبه‌دانه و DCP' : 'Barley, Cottonseed & DCP';
    } else {
      // Feed Mill: headCount acts as monthly metric tons
      totalTonnage = Math.round(headCount * periodMonths);
      cornTonnage = Math.round(totalTonnage * 0.50);
      soyTonnage = Math.round(totalTonnage * 0.25);
      otherTonnage = totalTonnage - cornTonnage - soyTonnage;
      otherLabel = isFa ? 'جو دامی، مکمل‌ها و فسفات' : 'Barley, Additives & Phosphate';
    }

    const trucksRequired = Math.ceil(totalTonnage / 25); // 25 MT per dump truck

    return {
      totalTonnage,
      cornTonnage,
      soyTonnage,
      otherTonnage,
      otherLabel,
      trucksRequired,
    };
  }, [farmType, headCount, periodMonths, isFa]);

  const handleApplyToRfq = () => {
    const params = new URLSearchParams({
      volume: `${estimates.totalTonnage} تن`,
      notes: `برآورد محاسبه‌گر: ${farmType} با ظرفیت ${headCount} — ذرت: ${estimates.cornTonnage} تن، سویا: ${estimates.soyTonnage} تن`,
    });
    router.push(`/rfq?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-3xl border border-m3-outline-variant/40 bg-m3-surface-lowest p-6 sm:p-10 shadow-m3-2 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-m3-outline-variant/30 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-m3-primary-container text-m3-on-primary-container text-xs font-semibold">
            <Calculator className="size-3.5" />
            <span>{isFa ? 'ابزار مهندسی تغذیه دام و طیور' : 'Feed Formulation Tonnage Estimator'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-m3-on-surface mt-2">
            {isFa ? 'محاسبه‌گر تخصصی تناژ نهاده‌ها و ناوگان باری' : 'Livestock Feed Intake & Fleet Estimator'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setFarmType('broiler');
            setHeadCount(50000);
            setPeriodMonths(2);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-m3-outline hover:text-m3-primary transition font-medium self-start sm:self-auto"
        >
          <RotateCcw className="size-3.5" />
          <span>{isFa ? 'بازنشانی مقادیر' : 'Reset Inputs'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left Inputs Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Farm Operation Type */}
          <div>
            <label className="block text-xs font-bold text-m3-on-surface mb-2">
              {isFa ? '۱. نوع واحد پرورشی یا صنعتی:' : '1. Operation Type:'}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFarmType('broiler');
                  setHeadCount(50000);
                }}
                className={`p-3 rounded-2xl border text-start font-medium transition m3-press-state ${
                  farmType === 'broiler'
                    ? 'border-m3-primary bg-m3-primary-container/60 text-m3-on-primary-container font-bold shadow-xs'
                    : 'border-m3-outline-variant/40 bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant'
                }`}
              >
                <span>{isFa ? 'فارم مرغ گوشتی صنعتی' : 'Broiler Farm'}</span>
                <span className="block text-[10px] text-m3-outline mt-0.5">
                  {isFa ? 'دوره ۴۵ روزه با ۵۵٪ ذرت' : '45-day cycle, 55% corn'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFarmType('layer');
                  setHeadCount(100000);
                }}
                className={`p-3 rounded-2xl border text-start font-medium transition m3-press-state ${
                  farmType === 'layer'
                    ? 'border-m3-primary bg-m3-primary-container/60 text-m3-on-primary-container font-bold shadow-xs'
                    : 'border-m3-outline-variant/40 bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant'
                }`}
              >
                <span>{isFa ? 'فارم مرغ تخم‌گذار' : 'Layer Farm'}</span>
                <span className="block text-[10px] text-m3-outline mt-0.5">
                  {isFa ? '۱۱۰ گرم روزانه به ازای هر مرغ' : '110g/day per bird'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFarmType('dairy');
                  setHeadCount(1000);
                }}
                className={`p-3 rounded-2xl border text-start font-medium transition m3-press-state ${
                  farmType === 'dairy'
                    ? 'border-m3-primary bg-m3-primary-container/60 text-m3-on-primary-container font-bold shadow-xs'
                    : 'border-m3-outline-variant/40 bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant'
                }`}
              >
                <span>{isFa ? 'گاوداری شیری و پرواری' : 'Dairy & Beef Cattle'}</span>
                <span className="block text-[10px] text-m3-outline mt-0.5">
                  {isFa ? '۱۶ کیلو کنسانتره روزانه' : '16 kg concentrate/day'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFarmType('feedmill');
                  setHeadCount(2000);
                }}
                className={`p-3 rounded-2xl border text-start font-medium transition m3-press-state ${
                  farmType === 'feedmill'
                    ? 'border-m3-primary bg-m3-primary-container/60 text-m3-on-primary-container font-bold shadow-xs'
                    : 'border-m3-outline-variant/40 bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant'
                }`}
              >
                <span>{isFa ? 'کارخانه خوراک و مکمل' : 'Feed Mill / Premix'}</span>
                <span className="block text-[10px] text-m3-outline mt-0.5">
                  {isFa ? 'ظرفیت ماهانه خط تولید' : 'Monthly mill tonnage'}
                </span>
              </button>
            </div>
          </div>

          {/* Herd / Flock Size Slider & Input */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-m3-on-surface mb-2">
              <label>
                {farmType === 'dairy'
                  ? isFa ? 'تعداد رأس دام شیری/پرواری:' : 'Herd Head Count:'
                  : farmType === 'feedmill'
                    ? isFa ? 'ظرفیت تولید ماهانه (تن):' : 'Monthly Production (MT):'
                    : isFa ? 'ظرفیت گله (قطعه جوجه / مرغ):' : 'Flock Capacity (Birds):'}
              </label>
              <span className="font-mono text-m3-primary text-sm font-black" dir="ltr">
                {headCount.toLocaleString()} {farmType === 'dairy' ? (isFa ? 'رأس' : 'Heads') : farmType === 'feedmill' ? (isFa ? 'تن' : 'MT') : (isFa ? 'قطعه' : 'Birds')}
              </span>
            </div>
            <input
              type="range"
              min={farmType === 'dairy' ? 100 : farmType === 'feedmill' ? 200 : 5000}
              max={farmType === 'dairy' ? 10000 : farmType === 'feedmill' ? 20000 : 500000}
              step={farmType === 'dairy' ? 50 : farmType === 'feedmill' ? 100 : 5000}
              value={headCount}
              onChange={(e) => setHeadCount(Number(e.target.value))}
              className="w-full accent-m3-primary cursor-pointer h-2 bg-m3-surface-container rounded-lg"
            />
          </div>

          {/* Supply Duration Period */}
          <div>
            <label className="block text-xs font-bold text-m3-on-surface mb-2">
              {isFa ? '۲. بازه زمانی مورد نیاز برای تأمین:' : '2. Supply Duration Horizon:'}
            </label>
            <div className="flex gap-2 text-xs">
              {[1, 2, 3, 6].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPeriodMonths(m)}
                  className={`flex-1 py-2 rounded-xl border text-center font-semibold transition ${
                    periodMonths === m
                      ? 'border-m3-primary bg-m3-primary text-white shadow-xs'
                      : 'border-m3-outline-variant/30 bg-m3-surface-container text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                  }`}
                >
                  {m} {isFa ? 'ماهه' : 'Mo'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Live Results Card */}
        <div className="lg:col-span-6 bg-m3-surface-container/60 rounded-3xl p-6 sm:p-7 border border-m3-outline-variant/40 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-m3-outline font-semibold block">
              {isFa ? 'تخمین کل نهاده‌های مورد نیاز:' : 'Total Feed Requirements:'}
            </span>

            {/* Total Tonnage Highlight */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-4xl sm:text-5xl font-black text-m3-primary" dir="ltr">
                {estimates.totalTonnage.toLocaleString()}
              </span>
              <span className="text-base font-bold text-m3-on-surface">
                {isFa ? 'تن متریک' : 'Metric Tons'}
              </span>
            </div>

            {/* Commodity Breakdown Grid */}
            <div className="mt-6 space-y-3">
              {/* Corn */}
              <div className="p-3.5 rounded-2xl bg-m3-surface-lowest border border-m3-outline-variant/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-m3-on-surface">{isFa ? 'ذرت زرد دامی (فله بنادر)' : 'Yellow Corn'}</span>
                </div>
                <span className="font-mono text-xs font-black text-m3-primary" dir="ltr">
                  {estimates.cornTonnage.toLocaleString()} {isFa ? 'تن' : 'MT'}
                </span>
              </div>

              {/* Soybean Meal */}
              <div className="p-3.5 rounded-2xl bg-m3-surface-lowest border border-m3-outline-variant/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-emerald-600"></span>
                  <span className="font-bold text-m3-on-surface">{isFa ? 'کنجاله سویای پروتئینی ۴۴٪' : 'Soybean Meal 44%'}</span>
                </div>
                <span className="font-mono text-xs font-black text-m3-primary" dir="ltr">
                  {estimates.soyTonnage.toLocaleString()} {isFa ? 'تن' : 'MT'}
                </span>
              </div>

              {/* Other Grains & Additives */}
              <div className="p-3.5 rounded-2xl bg-m3-surface-lowest border border-m3-outline-variant/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-sky-600"></span>
                  <span className="font-bold text-m3-on-surface">{estimates.otherLabel}</span>
                </div>
                <span className="font-mono text-xs font-black text-m3-primary" dir="ltr">
                  {estimates.otherTonnage.toLocaleString()} {isFa ? 'تن' : 'MT'}
                </span>
              </div>
            </div>

            {/* Logistics & Fleet Requirement */}
            <div className="mt-4 pt-3 border-t border-m3-outline-variant/30 flex items-center justify-between text-xs text-m3-on-surface-variant">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Truck className="size-4 text-m3-secondary" />
                <span>{isFa ? 'ناوگان حمل کمپرسی مورد نیاز:' : 'Fleet Requirement:'}</span>
              </span>
              <span className="font-mono font-bold text-m3-on-surface" dir="ltr">
                {estimates.trucksRequired} {isFa ? 'دستگاه تریلی (۲۵ تنی)' : 'Trucks'}
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-6 pt-4 border-t border-m3-outline-variant/30">
            <button
              type="button"
              onClick={handleApplyToRfq}
              className="m3-press-state w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-m3-primary hover:bg-m3-primary-hover text-white font-bold text-xs sm:text-sm shadow-m3-1 transition"
            >
              <span>{isFa ? 'ثبت استعلام رسمی بر پایه این برآورد' : 'Submit RFQ Based on this Estimate'}</span>
              <ArrowLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
