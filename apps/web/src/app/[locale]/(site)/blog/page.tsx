import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { PageHeader, SectionHeader } from '@karvan/ui';
import { ArrowLeft, Clock, Calendar, BookOpen, User, Tag } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { SiteFrame, sectionIndex } from '../_components/site-chrome';
import { listBlogPosts } from '@/lib/blog-data';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';
  return {
    title: isFa ? 'مقالات و تحلیل تخصصی بازار نهاده‌های دامی' : 'Market Analysis & Feed Insights',
    description: isFa
      ? 'پایگاه دانش و تحلیل تخصصی بازرگانی غلات، استانداردهای آزمایشگاهی، تغذیه دام و طیور و وضعیت بنادر کشور شرکت دنیای هوشمند آینده.'
      : 'Authoritative market analysis, nutritional feed assays, and logistics insights from Donyaye Hooshmand Ayandeh.',
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const lang = isFa ? 'fa' : 'en';
  const today = formatJalaliDate(new Date().toISOString(), lang);
  const posts = listBlogPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <main>
      <SiteFrame marginNote="DHA-BLG-1405" className="py-10">
        <PageHeader
          title={isFa ? 'پایگاه دانش و تحلیل بازار نهاده‌ها' : 'Market Analysis & Feed Insights'}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-BLG-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: isFa ? 'حوزه تخصصی' : 'Specialization', value: isFa ? 'غلات و تغذیه دامی' : 'Grains & Nutrition' },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-on-surface-variant">
          {isFa
            ? 'مجموعه مقالات فنی و راهنماهای کاربردی کارشناسان بازرگانی و تغذیه دام پیرامون شاخص‌های آزمایشگاهی، کنترل رطوبت و مایکوتوکسین‌ها در سیلوها، قواعد اینکوترمز و تحلیل کریدورهای حمل فله دریایی.'
            : 'Technical guidelines and authoritative industry perspectives on laboratory assays, mycotoxin mitigation in port silos, Incoterms standards, and grain trade corridors.'}
        </p>

        {/* Featured Article Bento Card */}
        {featured && (
          <section className="mt-12">
            <div className="bento-card bg-surface-container-lowest p-8 lg:p-10 shadow-hero border border-outline-variant/35">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3.5 py-1 rounded-full bg-primary-fixed/80 text-on-primary-fixed-variant text-xs font-semibold border border-primary-fixed">
                  {featured.category[lang]}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono">
                  <Clock className="size-3.5 text-primary" />
                  <span>{featured.readTime[lang]}</span>
                </span>
                <span className="text-outline-variant/60">•</span>
                <span className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono">
                  <Calendar className="size-3.5 text-secondary" />
                  <span>{featured.date[lang]}</span>
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface mb-4 leading-snug">
                <Link href={`/blog/${featured.slug}`} className="hover:text-primary transition-colors">
                  {featured.title[lang]}
                </Link>
              </h2>

              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-3xl mb-8">
                {featured.excerpt[lang]}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-outline-variant/25">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-sm shadow-xs">
                    {featured.author.avatarText}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-on-surface">{featured.author.name[lang]}</div>
                    <div className="text-xs text-on-surface-variant">{featured.author.role[lang]}</div>
                  </div>
                </div>

                <Link
                  href={`/blog/${featured.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs sm:text-sm font-semibold text-on-primary shadow-terracotta hover:bg-primary-container transition-all"
                >
                  <span>{isFa ? 'مطالعه مقاله کامل' : 'Read Article'}</span>
                  <ArrowLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Other Articles Grid */}
        <section className="mt-14">
          <SectionHeader
            index={isFa ? '۰۲' : '02'}
            title={isFa ? 'سایر تحلیل‌ها و یادداشت‌های تخصصی' : 'Recent Technical Insights'}
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {rest.map((post) => (
              <article
                key={post.slug}
                className="bento-card bg-surface-container-lowest p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-secondary text-xs font-semibold">
                      {post.category[lang]}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant/70 font-mono">
                      <Clock className="size-3 text-primary" />
                      <span>{post.readTime[lang]}</span>
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-on-surface mb-3 leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title[lang]}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                    {post.excerpt[lang]}
                  </p>
                </div>

                <div className="pt-4 border-t border-outline-variant/25 flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-on-surface-variant">
                    <span>{post.author.name[lang]}</span>
                    <span className="mx-2 text-outline-variant">•</span>
                    <span className="font-mono text-[11px]">{post.date[lang]}</span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>{isFa ? 'ادامه مطلب' : 'Read more'}</span>
                    <ArrowLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Corporate Advisory Callout */}
        <section className="mt-16">
          <div className="rounded-3xl border border-outline-variant/35 bg-surface-container-low p-8 sm:p-10 shadow-bento flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-on-surface">
                {isFa ? 'نیاز به مشاوره تخصصی جیره‌نویسی یا تحلیل قیمت دارید؟' : 'Need Specialized Advisory on Feed Formulations?'}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl">
                {isFa
                  ? 'تیم فنی و بازرگانی شرکت آماده پاسخ‌گویی به سوالات کارخانجات خوراک و مزارع پرورشی در خصوص انتخاب بهینه نهاده‌هاست.'
                  : 'Our technical desk provides direct consultation on feed optimization and landed grain procurement.'}
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-on-primary shadow-terracotta hover:bg-primary-container transition-all shrink-0"
            >
              <span>{isFa ? 'تماس با واحد مشاوره' : 'Contact Advisory'}</span>
              <ArrowLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        </section>
      </SiteFrame>
    </main>
  );
}
