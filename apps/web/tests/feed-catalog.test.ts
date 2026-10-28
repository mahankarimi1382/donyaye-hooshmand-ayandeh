import { describe, expect, it } from 'vitest';
import { createFreshStore } from '../src/lib/store';

describe('Animal Feed Catalog & Seed Integrity', () => {
  const store = createFreshStore();
  const products = store.listProducts();

  it('contains essential animal feed commodities in the store', () => {
    const feedProductIds = [
      'prd_corn_feed',
      'prd_soybean_meal',
      'prd_barley_feed',
      'prd_dcp_feed',
      'prd_cottonseed_meal',
      'prd_wheat_feed',
    ];

    for (const id of feedProductIds) {
      const product = products.find((p) => p.id === id);
      expect(product).toBeDefined();
      expect(product?.name.fa).toBeTruthy();
      expect(product?.name.en).toBeTruthy();
      expect(product?.hsCode).toMatch(/^\d{6}$/);
      expect(Number(product?.moqQuantity)).toBeGreaterThan(0);
      expect(product?.specs.length).toBeGreaterThanOrEqual(2);
      expect(product?.originPort.fa).toBeTruthy();
      expect(product?.packaging.fa).toBeTruthy();
    }
  });

  it('marks core animal feed commodities as featured on homepage', () => {
    const featured = products.filter((p) => p.featured);
    const featuredIds = featured.map((p) => p.id);

    expect(featuredIds).toContain('prd_corn_feed');
    expect(featuredIds).toContain('prd_soybean_meal');
    expect(featuredIds).toContain('prd_barley_feed');
    expect(featuredIds).toContain('prd_dcp_feed');

    // Petrochemicals should no longer be featured on homepage
    expect(featuredIds).not.toContain('prd_hdpe_film');
    expect(featuredIds).not.toContain('prd_copper_cathode');
  });

  it('ensures each feed product has valid HS codes and units', () => {
    const corn = products.find((p) => p.id === 'prd_corn_feed');
    expect(corn?.hsCode).toBe('100590');
    expect(corn?.moqUnit).toBe('metric_ton');
    expect(corn?.specs[0].fa).toContain('رطوبت');

    const soy = products.find((p) => p.id === 'prd_soybean_meal');
    expect(soy?.hsCode).toBe('230400');
    expect(soy?.specs[0].fa).toContain('پروتئین');

    const dcp = products.find((p) => p.id === 'prd_dcp_feed');
    expect(dcp?.hsCode).toBe('283526');
    expect(dcp?.specs[0].fa).toContain('فسفر');
  });
});
