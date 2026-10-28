import type { Dictionary } from '@karvan/i18n';

interface TickerProps {
  dictionary: Dictionary;
}

export function Ticker({ dictionary }: TickerProps) {
  const terminalItems = [
    { title: 'ذرت زرد برزیلی فله', sub: 'FOB بندرامام (اسکله ۳۴)' },
    { title: 'کنجاله سویا پلیت', sub: '44% CP تحویل سیلو' },
    { title: 'جو دامی قزاقستان', sub: 'بندر امیرآباد (سیلوهای مکانیزه)' },
    { title: 'دی‌کلسیم فسفات', sub: 'DCP 18% کیسه ۵۰kg' },
    { title: 'کنجاله تخم‌پنبه خوراک دام', sub: 'پروتئین ۳۲٪ پلت' },
    { title: 'گندم دامی استاندارد', sub: 'گلوتن ۲۴+ تحویل فوری' },
  ];

  return (
    <div
      className="hidden md:block w-full overflow-hidden border-b border-outline-variant/30 bg-surface-container-low py-2 text-xs text-on-surface-variant"
      data-purpose="market-ticker"
    >
      <div className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-4 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-fixed/60 border border-primary-fixed/40 px-2.5 py-0.5 text-[11px] font-semibold text-on-primary-fixed-variant shadow-xs">
            <span className="inline-block size-2 animate-pulse rounded-full bg-primary"></span>
            <span className="hidden sm:inline">پایش زنده پایانه‌ها:</span>
            <span className="sm:hidden">پایانه‌ها:</span>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="ticker-track flex w-max items-center gap-6 whitespace-nowrap text-xs">
              {[...terminalItems, ...terminalItems].map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-2">
                  <span className="font-semibold text-on-surface">{item.title}</span>
                  <span className="rounded-full bg-surface-container-lowest px-2 py-0.5 font-mono text-[11px] text-primary border border-outline-variant/25" dir="ltr">
                    <bdi>{item.sub}</bdi>
                  </span>
                  <span className="text-outline-variant opacity-60">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-3 font-mono text-[11px] font-medium text-on-surface-variant/80 md:flex">
          <span className="inline-flex items-center gap-1 text-secondary font-semibold">
            <svg className="size-3.5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            SGS Verified
          </span>
          <span>•</span>
          <span>ISO 9001:2015</span>
          <span>•</span>
          <span>GAFTA Standard</span>
        </div>
      </div>
    </div>
  );
}

