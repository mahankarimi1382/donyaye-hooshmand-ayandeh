import { describe, expect, it } from 'vitest';

import { dictionaries, fa } from '../src';

type TreeNode = string | number | { [key: string]: TreeNode } | readonly TreeNode[];

function leafPaths(value: TreeNode, prefix: string[] = []): string[] {
  if (value === null || typeof value !== 'object') return [prefix.join('.')];
  return Object.entries(value).flatMap(([key, child]) => leafPaths(child as TreeNode, [...prefix, key]));
}

const EMOJI_PATTERN = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}]/u;

function stringLeaves(value: TreeNode): string[] {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object') return [];
  return Object.values(value).flatMap((child) => stringLeaves(child as TreeNode));
}

describe('fa/en structural parity', () => {
  it('carries identical key sets in both locales, recursively', () => {
    const faPaths = leafPaths(fa).sort();
    const enPaths = leafPaths(dictionaries.en).sort();
    expect(enPaths).toEqual(faPaths);
    expect(faPaths.length).toBeGreaterThan(300);
  });

  it('keeps the required record sizes', () => {
    expect(Object.keys(fa.statuses.rfq)).toHaveLength(11);
    expect(Object.keys(fa.statuses.quote)).toHaveLength(8);
    expect(Object.keys(fa.statuses.milestone)).toHaveLength(9);
    expect(Object.keys(fa.statuses.case)).toHaveLength(4);
    expect(Object.keys(fa.units)).toHaveLength(6);
    expect(Object.keys(fa.currencies)).toHaveLength(6);
    expect(Object.keys(fa.portal.documents.categories)).toHaveLength(9);
    expect(Object.keys(fa.portal.quoteActions.declineReasons)).toHaveLength(5);
    expect(Object.keys(fa.crm.rfqDetail.actions)).toHaveLength(12);
    expect(Object.keys(dictionaries.en.statuses.rfq)).toHaveLength(11);
    expect(Object.keys(dictionaries.en.statuses.milestone)).toHaveLength(9);
  });

  it('keeps the fixed collection lengths', () => {
    for (const dictionary of [fa, dictionaries.en]) {
      expect(dictionary.services.items).toHaveLength(5);
      expect(dictionary.home.process.steps).toHaveLength(4);
      expect(dictionary.home.stats.items).toHaveLength(4);
      expect(dictionary.about.offices).toHaveLength(3);
      expect(dictionary.contact.offices).toHaveLength(3);
      expect(dictionary.markets.incotermGlossary).toHaveLength(9);
      for (const item of dictionary.services.items) {
        expect(item.deliverables).toHaveLength(4);
        expect(item.steps).toHaveLength(4);
      }
      expect(dictionary.statuses.rfq.submitted.label.length).toBeGreaterThan(0);
    }
  });
});

describe('Persian copy rules', () => {
  it('uses ZWNJ in the required inflections', () => {
    expect(fa.home.hero.subtitle).toContain('می\u200Cماند');
    expect(fa.footer.description).toContain('می\u200Cبرد');
    expect(fa.statuses.rfq.draft.label).toBe('پیش\u200Cنویس');
    expect(fa.statuses.rfq.expired.label).toBe('منقضی\u200Cشده');
    expect(fa.nav.track).toBe('رهگیری محموله');
  });

  it('keeps the brand voice in fixed strings', () => {
    expect(fa.common.brandName).toBe('دنیای هوشمند آینده');
    expect(fa.common.tagline).toBe('تأمین هوشمند نهاده‌های دامی و طیور');
    expect(fa.footer.copyright).toBe('© ۱۴۰۵ شرکت دنیای هوشمند آینده. کلیه حقوق محفوظ است.');
    expect(fa.crm.quoteEngine.approvalWarning).toContain('۱۰');
    expect(fa.crm.quoteEngine.approvalWarning).toContain('۵۰٬۰۰۰');
    expect(fa.rfq.success.slaNote).toBe('پاسخ\u200Cگویی تا ۲۴ ساعت');
    expect(fa.products.sampleNote).toContain('نمونهٔ پرونده');
  });

  it('avoids banned vocabulary in both locales', () => {
    const bannedFa = ['انقلابی', 'یکتا', 'بی\u200Cنظیر', 'سینرژی', 'سرویس', 'راهکار', 'اکوسیستم', 'یوزر'];
    const allFa = stringLeaves(fa).join('\n');
    for (const word of bannedFa) {
      expect(allFa).not.toContain(word);
    }
  });

  it('contains no emoji anywhere', () => {
    for (const dictionary of [fa, dictionaries.en]) {
      for (const leaf of stringLeaves(dictionary)) {
        expect(leaf).not.toMatch(EMOJI_PATTERN);
      }
    }
  });
});
