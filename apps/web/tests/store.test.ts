import { describe, expect, it } from 'vitest';

import { apiSuccess } from '@karvan/contracts';
import { ForbiddenDomainActionError } from '@karvan/core';

import {
  createFreshStore,
  RecordNotFoundError,
  VersionConflictError,
  type ActorContext,
} from '../src/lib/store';
import { InvalidMilestoneAdvanceError } from '@karvan/core';

const SALES_REP: ActorContext = { userId: 'usr_sara_mohseni', role: 'sales_rep', organizationId: 'org_karvan' };
const TRADE_MANAGER: ActorContext = {
  userId: 'usr_trade_manager_karvan',
  role: 'trade_manager',
  organizationId: 'org_karvan',
};
const BUYER_ARYA: ActorContext = { userId: 'usr_buyer_arya', role: 'buyer', organizationId: 'org_arya_polymer' };
const BUYER_BAVARIA: ActorContext = { userId: 'usr_buyer_bavaria', role: 'buyer', organizationId: 'org_bavaria_metall' };

describe('store idempotency', () => {
  it('replays the stored response for a duplicate key and returns null before the first write', () => {
    const store = createFreshStore();
    const key = 'kv-test-key-00000001';

    expect(store.replayOrBegin(key)).toBeNull();

    const body = apiSuccess({ marked: 3 }, 'req-1');
    store.finish(key, 200, body);

    const replay = store.replayOrBegin(key);
    expect(replay).not.toBeNull();
    expect(replay?.status).toBe(200);
    expect(replay?.body).toEqual(body);
  });

  it('keeps separate entries per key', () => {
    const store = createFreshStore();
    store.finish('kv-test-key-00000002', 201, { success: true });
    store.finish('kv-test-key-00000003', 409, { success: false });

    expect(store.replayOrBegin('kv-test-key-00000002')?.status).toBe(201);
    expect(store.replayOrBegin('kv-test-key-00000003')?.status).toBe(409);
    expect(store.replayOrBegin('kv-test-key-00000004')).toBeNull();
  });
});

describe('rfq concurrency and access', () => {
  it('rejects a stale expectedVersion with a version conflict', () => {
    const store = createFreshStore();
    const rfqId = 'rfq_1405_00009';

    expect(() =>
      store.transitionRfq(SALES_REP, rfqId, { targetStatus: 'under_review', expectedVersion: 2 }),
    ).toThrow(VersionConflictError);

    const rfq = store.transitionRfq(SALES_REP, rfqId, { targetStatus: 'under_review', expectedVersion: 1 });
    expect(rfq.status).toBe('under_review');
    expect(rfq.version).toBe(2);
  });

  it('isolates buyer listing and reads to the session tenant', () => {
    const store = createFreshStore();

    const page = store.listRfqs(BUYER_ARYA, { pageSize: 100 });
    expect(page.pagination.total).toBeGreaterThan(0);
    for (const rfq of page.items) {
      expect(rfq.buyerOrganizationId).toBe('org_arya_polymer');
    }
    expect(page.items.some((rfq) => rfq.id === 'rfq_1405_00002')).toBe(true);

    expect(() => store.getRfq(BUYER_ARYA, 'rfq_1405_00001')).toThrow(ForbiddenDomainActionError);
  });

  it('throws not found for an unknown rfq id', () => {
    const store = createFreshStore();
    expect(() => store.getRfq(SALES_REP, 'rfq_missing')).toThrow(RecordNotFoundError);
  });
});

describe('quote revision flow', () => {
  it('spawns a version n+1 draft and archives the sent record', () => {
    const store = createFreshStore();

    const { archived, draft } = store.requestRevision(BUYER_BAVARIA, 'quote_1405_0005', {
      quoteId: 'quote_1405_0005',
      notes: 'Please restate the offer against the LME average of the week.',
    });

    expect(archived.status).toBe('revised');
    expect(archived.version).toBe(5);
    expect(archived.archivedAt).toEqual(archived.updatedAt);
    expect(archived.supersededById).toBe(draft.id);

    expect(draft.status).toBe('draft');
    expect(draft.version).toBe(5);
    expect(draft.revisionNotes).toBe('Please restate the offer against the LME average of the week.');
    expect(draft.snapshot).toBeUndefined();
    expect(draft.rfqId).toBe('rfq_1405_00005');

    const rfq = store.getRfq(TRADE_MANAGER, 'rfq_1405_00005');
    expect(rfq.status).toBe('quote_preparation');

    const storedDraft = store.getQuote(TRADE_MANAGER, draft.id);
    expect(storedDraft.id).toBe(draft.id);
  });
});

describe('quote acceptance flow', () => {
  it('creates a trade case with the first milestone completed and moves the rfq to accepted', () => {
    const store = createFreshStore();

    const { quote, tradeCase } = store.acceptQuote(BUYER_BAVARIA, 'quote_1405_0005', {
      quoteId: 'quote_1405_0005',
      acceptanceSignature: {
        name: 'Jonas Weber',
        companyRole: 'Head of Trading',
        consentAccepted: true,
      },
      poNumber: 'BM-PO-1405-0042',
    });

    expect(quote.status).toBe('accepted');
    expect(quote.acceptance?.poNumber).toBe('BM-PO-1405-0042');

    expect(tradeCase.reference).toBe('TC-1405-0005');
    expect(tradeCase.status).toBe('confirmed');
    expect(tradeCase.milestones).toHaveLength(1);
    expect(tradeCase.milestones[0]?.milestone).toBe('booking_confirmed');
    expect(tradeCase.milestones[0]?.completedAt).toBeTruthy();
    expect(tradeCase.quoteChecksum).toBe(quote.snapshot?.checksum);

    const rfq = store.getRfq(TRADE_MANAGER, 'rfq_1405_00005');
    expect(rfq.status).toBe('accepted');
  });

  it('forbids a buyer from creating a quote draft', () => {
    const store = createFreshStore();
    expect(() =>
      store.createQuoteDraft(BUYER_ARYA, {
        rfqId: 'rfq_1405_00006',
        currency: 'USD',
        lines: [
          {
            description: 'HDPE film grade, MFI 0.05',
            quantity: '100',
            unit: 'metric_ton',
            unitPrice: '1150',
            lineTotal: '115000',
            discountPercentage: 0,
          },
        ],
        shippingAmount: '0',
        insuranceAmount: '0',
        taxAmount: '0',
        discountPercentage: 0,
        incoterm: 'CFR',
        incotermNamedPlace: 'Jebel Ali',
        paymentTerms: 'LC at sight',
        leadTimeDays: 30,
        validUntil: '2026-12-31',
      }),
    ).toThrow(ForbiddenDomainActionError);
  });
});

describe('shipment milestones', () => {
  it('rejects a backwards milestone advance', () => {
    const store = createFreshStore();

    expect(() =>
      store.advanceMilestone(SALES_REP, {
        caseId: 'case_1405_0001',
        targetMilestone: 'vessel_loaded',
        expectedVersion: 7,
      }),
    ).toThrow(InvalidMilestoneAdvanceError);
  });

  it('advances forward and moves a confirmed case into execution', () => {
    const store = createFreshStore();

    const record = store.advanceMilestone(SALES_REP, {
      caseId: 'case_1405_0002',
      targetMilestone: 'cargo_received_at_port',
      location: 'Shahid Rajaee Port',
      expectedVersion: 2,
    });

    expect(record.currentMilestone).toBe('cargo_received_at_port');
    expect(record.status).toBe('in_execution');
    expect(record.version).toBe(3);
    expect(record.milestones.at(-1)?.milestone).toBe('cargo_received_at_port');
  });
});

describe('validity sweep', () => {
  it('expires a sent quote whose validUntil has passed', () => {
    const store = createFreshStore();

    const draft = store.createQuoteDraft(SALES_REP, {
      rfqId: 'rfq_1405_00006',
      currency: 'USD',
      lines: [
        {
          description: 'HDPE film grade, MFI 0.05, repeat order',
          quantity: '20',
          unit: 'metric_ton',
          unitPrice: '1150',
          lineTotal: '23000',
          discountPercentage: 0,
        },
      ],
      shippingAmount: '0',
      insuranceAmount: '0',
      taxAmount: '0',
      discountPercentage: 0,
      incoterm: 'FOB',
      incotermNamedPlace: 'Bandar Abbas',
      paymentTerms: 'TT 30% advance',
      leadTimeDays: 30,
      validUntil: '2026-08-01',
    });
    expect(draft.approvalRequired).toBe(false);

    const sent = store.finalizeAndSendQuote(SALES_REP, draft.id);
    expect(sent.status).toBe('sent');
    expect(sent.snapshot).toBeDefined();

    const summary = store.runSweep();
    expect(summary.expiredQuotes).toBeGreaterThanOrEqual(1);

    const expired = store.getQuote(TRADE_MANAGER, draft.id);
    expect(expired.status).toBe('expired');

    const secondPass = store.runSweep();
    expect(secondPass.expiredQuotes).toBe(0);
  });
});
