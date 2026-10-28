import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, formatJalaliDate, toFarsiDigits } from '@karvan/i18n';
import { Check } from 'lucide-react';
import { PageHeader, SectionHeader } from '@karvan/ui';

import { Link } from '@/i18n/navigation';

import { linkButtonClasses, SiteFrame, sectionIndex } from '../../_components/site-chrome';

interface ServiceDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return getDictionary('fa').services.items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const dictionary = getDictionary(locale);
  const service = dictionary.services.items.find((item) => item.slug === slug);
  if (!service) return { title: dictionary.notFound.title };
  return { title: service.title, description: service.summary };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { locale, slug } = await params;
  const dictionary = getDictionary(locale);
  const service = dictionary.services.items.find((item) => item.slug === slug);
  if (!service) notFound();

  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), locale === 'fa' ? 'fa' : 'en');
  const serviceNumber = dictionary.services.items.findIndex((item) => item.slug === slug) + 1;
  const docCode = `KV-SRV-${String(1000 + serviceNumber).slice(1)}`;
  const num = (n: number) => (locale === 'fa' ? toFarsiDigits(n) : String(n));

  return (
    <main>
      <SiteFrame marginNote={docCode} className="py-10">
        <PageHeader
          title={service.title}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: docCode },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.reference, value: service.slug.toUpperCase() },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-ink-soft">{service.summary}</p>

        {/* deliverables — ledger checklist */}
        <section className="mt-14">
          <SectionHeader index={index(1)} title={dictionary.services.deliverablesTitle} />
          <ul className="mt-8">
            {service.deliverables.map((deliverable, i) => (
              <li
                key={deliverable}
                className="flex items-baseline gap-4 border-t border-rule py-5 last:border-b"
              >
                <span className="font-mono text-[13px] text-ink-faint">{num(i + 1)}</span>
                <Check aria-hidden="true" className="size-4 shrink-0 self-center text-clear" />
                <span className="text-ink">{deliverable}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* process steps — numbered rows */}
        <section className="mt-14">
          <SectionHeader index={index(2)} title={dictionary.services.stepsTitle} />
          <ol className="mt-8">
            {service.steps.map((step, i) => (
              <li
                key={step}
                className="grid gap-2 border-t border-rule py-5 last:border-b md:grid-cols-[5rem_1fr] md:items-baseline"
              >
                <span className="font-display text-2xl text-stamp">{num(i + 1)}</span>
                <span className="max-w-3xl text-ink">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA to /rfq */}
        <section className="mt-14">
          <div className="rounded-3xl border border-outline-variant/35 bg-surface-container-low p-8 shadow-bento md:p-10">
            <h2 className="font-display text-2xl text-on-surface md:text-3xl font-bold">{dictionary.services.rfqCta}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-on-surface-variant">
              {dictionary.home.ctaBanner.description}
            </p>
            <div className="mt-6">
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm shadow-terracotta hover:bg-primary-container transition-all"
              >
                <span>{dictionary.nav.rfq}</span>
                <span className="rtl:rotate-180">←</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-10 flex justify-end border-t border-rule pt-6">
          <Link href="/services" className="font-mono text-[13px] text-ink-soft hover:text-harbor">
            {dictionary.services.title}
          </Link>
        </div>
      </SiteFrame>
    </main>
  );
}
