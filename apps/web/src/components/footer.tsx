import type { Dictionary } from '@karvan/i18n';
import { Link } from '@/i18n/navigation';

interface FooterProps {
  locale: string;
  dictionary: Dictionary;
}

export function Footer({ locale, dictionary }: FooterProps) {
  const isFa = locale === 'fa';

  return (
    <footer
      className="w-full overflow-hidden border-t border-outline-variant/30 bg-surface-container-low text-on-surface-variant text-sm mt-16"
      data-purpose="site-footer"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: About & Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary flex items-center justify-center text-primary-fixed shadow-xs">
                <svg className="size-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <span className="font-extrabold text-on-surface text-base">
                {isFa ? 'دنیای هوشمند آینده' : dictionary.common.brandName}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isFa
                ? 'شرکت بازرگانی دنیای هوشمند آینده؛ فعال در زمینه تأمین، ترخیص و مدیریت زنجیره تأمین غلات دامی، کنجاله‌ها و ریزمغذی‌های خوراک دام و طیور کشور.'
                : dictionary.footer.description}
            </p>
            <div className="text-xs text-on-surface-variant/90 space-y-1 font-mono" dir="ltr">
              <p>REG: <span className="font-semibold text-on-surface">542198</span></p>
              <p>NATIONAL ID: <span className="font-semibold text-on-surface">14008912345</span></p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-on-surface font-bold text-sm">دسترسی سریع</h4>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="text-primary rtl:rotate-180">←</span>
                  <span>{dictionary.nav.products}</span>
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="text-primary rtl:rotate-180">←</span>
                  <span>{dictionary.nav.services}</span>
                </Link>
              </li>
              <li>
                <Link href="/quality" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="text-primary rtl:rotate-180">←</span>
                  <span>{dictionary.nav.quality}</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="text-primary rtl:rotate-180">←</span>
                  <span>{dictionary.nav.blog || 'مقالات و تحلیل بازار'}</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="text-primary rtl:rotate-180">←</span>
                  <span>{dictionary.nav.faq || 'پرسش‌های متداول'}</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="text-primary rtl:rotate-180">←</span>
                  <span>{dictionary.nav.about}</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="text-primary rtl:rotate-180">←</span>
                  <span>{dictionary.nav.contact}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Ports & Terminals */}
          <div className="space-y-3" id="terminals">
            <h4 className="text-on-surface font-bold text-sm">پایانه‌ها و باراندازها</h4>
            <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
              <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-xs">
                <span className="text-primary font-bold block mb-1">پایانه جنوب (خوزستان):</span>
                <span>بندر امام خمینی (ره)، مجتمع بندری، محوطه سیلوهای غلات فله (اسکله ۳۴)</span>
              </div>
              <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-xs">
                <span className="text-secondary font-bold block mb-1">پایانه شمال (مازندران):</span>
                <span>بندر امیرآباد، انبار اختصاصی ترخیص نهاده‌های خزر</span>
              </div>
            </div>
          </div>

          {/* Col 4: Central Office & Contact */}
          <div className="space-y-3">
            <h4 className="text-on-surface font-bold text-sm">دفتر مرکزی تهران</h4>
            <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <p>تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۱۵، واحد ۴</p>
              <p>تلفن: <span className="font-mono font-semibold text-on-surface" dir="ltr">۰۲۱-۸۸۸۸۸۸۸۸</span></p>
              <p>ایمیل بازرگانی: <span className="font-mono font-semibold text-on-surface" dir="ltr">trade@ayandeh-feed.com</span></p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-semibold shadow-terracotta hover:bg-primary-container transition-all"
                >
                  <span>{isFa ? 'درخواست مشاوره بازرگانی' : 'Contact Sales Desk'}</span>
                  <span className="rtl:rotate-180">←</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-outline-variant/30 text-xs text-on-surface-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{isFa ? '© ۱۴۰۵ شرکت دنیای هوشمند آینده. کلیه حقوق محفوظ است.' : dictionary.footer.copyright}</p>
          <div className="flex items-center gap-4 text-[11px] text-on-surface-variant/80">
            <Link href="/terms" className="hover:text-primary transition-colors">
              {dictionary.footer.legal.terms}
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              {dictionary.footer.legal.privacy}
            </Link>
            <span>•</span>
            <span className="font-mono" dir="ltr">Donyaye Hooshmand Ayandeh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
