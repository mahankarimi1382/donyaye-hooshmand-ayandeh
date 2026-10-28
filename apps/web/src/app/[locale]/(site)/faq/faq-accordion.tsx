'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@karvan/ui';

export interface FaqItem {
  id: string;
  question: { fa: string; en: string };
  answer: { fa: string; en: string };
}

export interface FaqCategory {
  title: { fa: string; en: string };
  icon?: string;
  items: FaqItem[];
}

interface FaqAccordionProps {
  categories: FaqCategory[];
  locale: string;
}

export function FaqAccordion({ categories, locale }: FaqAccordionProps) {
  const isFa = locale === 'fa';
  const lang = isFa ? 'fa' : 'en';

  const [openId, setOpenId] = useState<string | null>(categories[0]?.items[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  return (
    <div className="space-y-12">
      {categories.map((category, catIndex) => (
        <section key={catIndex} className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant/30">
            <span className="size-2 rounded-full bg-primary" />
            <h2 className="font-display text-xl font-bold text-on-surface">
              {category.title[lang]}
            </h2>
          </div>

          <div className="space-y-3">
            {category.items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-outline-variant/35 bg-surface-container-lowest overflow-hidden transition-all duration-200 shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    className="w-full p-5 sm:p-6 text-start flex items-center justify-between gap-4 hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-3">
                      <HelpCircle className="size-4 text-primary shrink-0" />
                      <span>{item.question[lang]}</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-5 text-on-surface-variant/70 shrink-0 transition-transform duration-300',
                        isOpen && 'rotate-180 text-primary',
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-sm leading-7 sm:leading-8 text-on-surface-variant border-t border-outline-variant/20 bg-surface-container-low/20">
                      {item.answer[lang]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
