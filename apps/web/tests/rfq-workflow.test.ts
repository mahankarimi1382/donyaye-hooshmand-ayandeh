import { describe, expect, it } from 'vitest';
import { createFreshStore, RecordNotFoundError } from '../src/lib/store';

describe('Animal Feed RFQ & Tracking Workflow', () => {
  it('creates an RFQ for animal feed and tracks its lifecycle', () => {
    const store = createFreshStore();
    const futureDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    const newRfq = store.createRfq({
      company: {
        name: 'شرکت خوراک دام و طیور آریا',
        country: 'IR',
        address: 'شهرک صنعتی اصفهان',
      },
      contact: {
        name: 'مهندس حسینی',
        email: 'hosseini@arya-feed.ir',
        phone: '+989131112233',
        role: 'مدیر بازرگانی و خرید',
      },
      destinationCountry: 'IR',
      destinationCity: 'بندر امام خمینی',
      incoterm: 'FOB',
      incotermNamedPlace: 'بندر امام خمینی',
      targetDeliveryDate: futureDate,
      lines: [
        {
          description: 'ذرت دامی دانه‌ای درجه یک وارداتی',
          quantity: '500',
          unit: 'metric_ton',
          productId: 'prd_corn_feed',
          specifications: 'رطوبت حداکثر ۱۴٪، آفلاتوکسین زیر ۱۰ ppb',
        },
      ],
      notes: 'تحویل پای کشتی در بندر امام خمینی',
      websiteUrlHp: '',
      consentToTerms: true,
    });

    expect(newRfq).toBeDefined();
    expect(newRfq.reference).toMatch(/^RFQ-1405-\d{5}$/);
    expect(newRfq.status).toBe('submitted');
    expect(newRfq.lines).toHaveLength(1);
    expect(newRfq.lines[0].quantity).toBe('500');

    // Track by reference and email
    const tracked = store.trackRequest(newRfq.reference, 'hosseini@arya-feed.ir');
    expect(tracked).toBeDefined();
    expect(tracked.reference).toBe(newRfq.reference);
    expect(tracked.status).toBe('submitted');
    expect(tracked.commodity.fa).toContain('ذرت');
    expect(tracked.buyerName).toBe('شرکت خوراک دام و طیور آریا');
  });

  it('rejects tracking when email does not match the RFQ record', () => {
    const store = createFreshStore();
    const futureDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    const rfq = store.createRfq({
      company: { name: 'فارم پرورشی سپید', country: 'IR' },
      contact: { name: 'رضا باقری', email: 'bagheri@sepid.ir', role: 'مسئول تأمین' },
      destinationCountry: 'IR',
      destinationCity: 'بندر امیرآباد',
      incoterm: 'FOB',
      targetDeliveryDate: futureDate,
      lines: [{ description: 'جو دامی وارداتی', quantity: '200', unit: 'metric_ton' }],
      websiteUrlHp: '',
      consentToTerms: true,
    });

    expect(() => store.trackRequest(rfq.reference, 'intruder@other.com')).toThrow(RecordNotFoundError);
  });

  it('creates and stores general contact inquiries', () => {
    const store = createFreshStore();

    const inquiry = store.createInquiry({
      name: 'دکتر صادقی',
      email: 'sadeghi@poultry-nutrition.com',
      company: 'کلینیک تغذیه طیور البرز',
      phone: '+989123456789',
      topic: 'sales',
      subject: 'استعلام قیمت مکمل ال-لیزین دامی',
      message: 'لطفاً پیش‌فاکتور برای ۱۰ تن ال-لیزین هیدروکلراید ۹۸٫۵٪ ارسال فرمایید.',
      websiteUrlHp: '',
      consent: true,
    });

    expect(inquiry).toBeDefined();
    expect(inquiry.id).toMatch(/^inq_[a-z0-9]+$/);
    expect(inquiry.status).toBe('new');
    expect(inquiry.subject).toContain('ال-لیزین');
  });
});
