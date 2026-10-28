import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { PageHeader, SectionHeader } from '@karvan/ui';
import { ArrowLeft, Clock, Calendar, CheckCircle2, Share2, Tag, ChevronRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { SiteFrame } from '../../_components/site-chrome';
import { getBlogPost, listBlogPosts } from '@/lib/blog-data';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return listBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  const isFa = locale === 'fa';
  const lang = isFa ? 'fa' : 'en';

  if (!post) {
    return { title: isFa ? 'مقاله یافت نشد' : 'Article Not Found' };
  }

  return {
    title: `${post.title[lang]} | ${isFa ? 'دنیای هوشمند آینده' : 'Donyaye Hooshmand Ayandeh'}`,
    description: post.excerpt[lang],
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const isFa = locale === 'fa';
  const lang = isFa ? 'fa' : 'en';
  const content = post.content[lang];
  const relatedPosts = listBlogPosts().filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <main>
      <SiteFrame marginNote={`DHA-ART-${slug.slice(0, 8).toUpperCase()}`} className="py-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            {isFa ? 'صفحه اصلی' : 'Home'}
          </Link>
          <span className="text-outline-variant/60">/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">
            {isFa ? 'مقالات' : 'Blog'}
          </Link>
          <span className="text-outline-variant/60">/</span>
          <span className="text-on-surface font-semibold truncate max-w-xs">{post.title[lang]}</span>
        </nav>

        {/* Article Header */}
        <header className="bento-card-static bg-surface-container-lowest p-8 sm:p-12 shadow-hero border border-outline-variant/35 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-3.5 py-1 rounded-full bg-primary-fixed/80 text-on-primary-fixed-variant text-xs font-semibold border border-primary-fixed">
              {post.category[lang]}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono">
              <Clock className="size-3.5 text-primary" />
              <span>{post.readTime[lang]}</span>
            </span>
            <span className="text-outline-variant/60">•</span>
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono">
              <Calendar className="size-3.5 text-secondary" />
              <span>{post.date[lang]}</span>
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-on-surface leading-tight mb-8">
            {post.title[lang]}
          </h1>

          <div className="flex items-center gap-4 pt-6 border-t border-outline-variant/25">
            <div className="size-12 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-base shadow-xs">
              {post.author.avatarText}
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-on-surface">{post.author.name[lang]}</div>
              <div className="text-xs text-on-surface-variant">{post.author.role[lang]}</div>
            </div>
          </div>
        </header>

        {/* Article Body Container */}
        <article className="max-w-4xl mx-auto space-y-10">
          {/* Lead Paragraph */}
          <div className="p-6 rounded-2xl bg-surface-container-low/70 border-s-4 border-primary text-base sm:text-lg leading-8 text-on-surface font-medium">
            {content.lead}
          </div>

          {/* Section Bodies */}
          <div className="space-y-8">
            {content.sections.map((section, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface">
                  {section.heading}
                </h2>
                <p className="text-sm sm:text-base leading-8 text-on-surface-variant text-justify">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          {/* Quote Block */}
          {content.quote && (
            <figure className="my-8 rounded-3xl border border-outline-variant/35 bg-surface-container-low p-8 shadow-bento">
              <blockquote className="border-s-4 border-secondary ps-6">
                <p className="text-base sm:text-lg font-bold text-on-surface leading-relaxed italic">
                  «{content.quote}»
                </p>
              </blockquote>
            </figure>
          )}

          {/* Key Takeaways Box */}
          {content.keyTakeaways && content.keyTakeaways.length > 0 && (
            <div className="bento-card-static bg-surface-container-lowest p-7 sm:p-8 border border-outline-variant/35 shadow-xs">
              <h3 className="font-display text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-secondary" />
                <span>{isFa ? 'نکات کلیدی و راهکارهای مدیریتی:' : 'Key Takeaways:'}</span>
              </h3>
              <ul className="space-y-3">
                {content.keyTakeaways.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant leading-7">
                    <span className="size-2 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags Strip */}
          <div className="pt-6 border-t border-outline-variant/25 flex flex-wrap items-center gap-2">
            <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5 ml-2">
              <Tag className="size-3.5 text-primary" />
              <span>{isFa ? 'برچسب‌ها:' : 'Tags:'}</span>
            </span>
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/25 text-xs text-on-surface-variant"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Articles Strip */}
          <div className="pt-10 border-t border-outline-variant/30">
            <h3 className="font-display text-xl font-bold text-on-surface mb-6">
              {isFa ? 'مقالات مرتبط پیشنهادی' : 'Related Articles'}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <div
                  key={related.slug}
                  className="bento-card bg-surface-container-lowest p-6 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-secondary">
                      {related.category[lang]}
                    </span>
                    <h4 className="font-display text-base font-bold text-on-surface mt-2 line-clamp-2">
                      <Link href={`/blog/${related.slug}`} className="hover:text-primary transition-colors">
                        {related.title[lang]}
                      </Link>
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                      {related.excerpt[lang]}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="font-mono text-on-surface-variant/70">{related.readTime[lang]}</span>
                    <Link
                      href={`/blog/${related.slug}`}
                      className="font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      <span>{isFa ? 'مطالعه' : 'Read'}</span>
                      <ArrowLeft className="size-3 rtl:rotate-0 ltr:rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="rounded-3xl bg-primary p-8 sm:p-10 text-on-primary shadow-terracotta flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-on-primary">
                {isFa ? 'پرسشی درباره این نهاده یا شرایط تأمین دارید؟' : 'Have Questions About This Commodity?'}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-primary-fixed max-w-lg leading-relaxed">
                {isFa
                  ? 'کارشناسان تغذیه و بازرگانی شرکت آماده پاسخ‌گویی و ارائه مشاوره‌های تخصصی خرید هستند.'
                  : 'Our commercial and nutrition desks are ready to advise on technical specifications and port allocations.'}
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary-fixed-dim px-7 py-3 text-sm font-bold shadow-xs transition-all shrink-0"
            >
              <span>{isFa ? 'درخواست مشاوره' : 'Contact Us'}</span>
              <ArrowLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        </article>
      </SiteFrame>
    </main>
  );
}
