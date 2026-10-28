'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Search, Wheat, Warehouse, Scale, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface HeroSearchHubProps {
  locale: string;
}

const COMMODITY_PRESETS = [
  { id: 'prd_corn_feed', label: 'ذرت برزیل', port: 'بندر امام خمینی (ره)', volume: '۵۰۰ تن' },
  { id: 'prd_soybean_meal', label: 'کنجاله سویا ۴۴٪', port: 'بندر امام خمینی (ره)', volume: '۲۰۰ تن' },
  { id: 'prd_barley_feed', label: 'جو قزاق / روس', port: 'بندر امیرآباد', volume: '۳۰۰ تن' },
  { id: 'prd_dcp_feed', label: 'دی‌کلسیم فسفات (DCP)', port: 'تحویل انبار کارخانه', volume: '۲۵ تن' },
];

export function HeroSearchHub({ locale }: HeroSearchHubProps) {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState(COMMODITY_PRESETS[0].id);
  const [commodity, setCommodity] = useState('ذرت زرد دانه‌ای درجه یک');
  const [port, setPort] = useState('بندر امام خمینی (ره)');
  const [volume, setVolume] = useState('۵۰۰ تن (فله کمپرسی)');

  const handlePresetClick = (preset: typeof COMMODITY_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    setCommodity(preset.label);
    setPort(preset.port);
    setVolume(preset.volume);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/contact?product=${selectedPreset}&port=${encodeURIComponent(port)}&volume=${encodeURIComponent(volume)}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-7 shadow-bento border border-outline-variant/35 backdrop-blur-xs">
        {/* Search Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-outline-variant/25 text-xs">
          <span className="text-on-surface-variant font-medium shrink-0 ml-1">کالاهای پرتقاضا:</span>
          {COMMODITY_PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePresetClick(item)}
              className={`chip-btn transition-all shrink-0 ${
                selectedPreset === item.id
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/25'
              }`}
            >
              {selectedPreset === item.id && (
                <CheckCircle2 className="size-3.5 text-primary-fixed" />
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Multi-Pill Interactive Controls */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 items-center">
          {/* Pill 1: Product Query */}
          <div className="md:col-span-4 bg-surface-container-low/70 hover:bg-surface-container-low rounded-xl px-4 py-2.5 flex items-center gap-3 border border-outline-variant/25 focus-within:border-primary transition-all">
            <Wheat className="size-5 text-secondary shrink-0" />
            <div className="w-full text-start">
              <label className="block text-[10px] text-on-surface-variant font-medium">نهاده مورد نظر</label>
              <input
                type="text"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm font-semibold text-on-surface focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Pill 2: Port / Terminal */}
          <div className="md:col-span-3 bg-surface-container-low/70 hover:bg-surface-container-low rounded-xl px-4 py-2.5 flex items-center gap-3 border border-outline-variant/25 focus-within:border-primary transition-all">
            <Warehouse className="size-5 text-primary shrink-0" />
            <div className="w-full text-start">
              <label className="block text-[10px] text-on-surface-variant font-medium">پایانه و بارانداز</label>
              <select
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm font-semibold text-on-surface focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="بندر امام خمینی (ره)">بندر امام خمینی (ره)</option>
                <option value="بندر امیرآباد">بندر امیرآباد (شمال)</option>
                <option value="تحویل انبار مرکزی">تحویل انبار مرکزی</option>
              </select>
            </div>
          </div>

          {/* Pill 3: Volume / Tonnage */}
          <div className="md:col-span-3 bg-surface-container-low/70 hover:bg-surface-container-low rounded-xl px-4 py-2.5 flex items-center gap-3 border border-outline-variant/25 focus-within:border-primary transition-all">
            <Scale className="size-5 text-secondary shrink-0" />
            <div className="w-full text-start">
              <label className="block text-[10px] text-on-surface-variant font-medium">حجم درخواستی</label>
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm font-semibold text-on-surface focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Action: Search Pill Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-[52px] rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center gap-2 font-semibold text-sm shadow-terracotta transition-all active:scale-[0.98]"
            >
              <Search className="size-4" />
              <span>استعلام فوری</span>
            </button>
          </div>
        </form>

        {/* Fast Status Info Row */}
        <div className="mt-4 pt-3 border-t border-outline-variant/25 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-on-surface-variant gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-secondary bg-secondary-fixed/50 px-3 py-1 rounded-full font-medium border border-secondary-fixed">
              <span className="size-1.5 rounded-full bg-secondary animate-pulse"></span>
              صدور آنی پیش‌فاکتور رسمی در کمتر از ۲ ساعت
            </span>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <span className="text-[11px] text-on-surface-variant/70">تأییدیه مستقیم سامانه بازارگاه و دامپزشکی کشور</span>
          </div>

          <button
            type="button"
            onClick={() => router.push('/contact')}
            className="text-primary font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>درخواست مشاوره و تماس</span>
            <ArrowLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
