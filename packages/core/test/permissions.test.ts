import { describe, expect, it } from 'vitest';
import {
  ForbiddenDomainActionError,
  assertCanAcceptQuote,
  assertCanAccessQuote,
  assertCanAccessRfq,
  assertCanApproveQuote,
  assertCanCreateQuote,
  assertCanDeclineQuote,
  assertCanDispatchQuote,
  canAcceptQuote,
  canAccessQuote,
  canAccessRfq,
  canApproveQuote,
  canCreateQuote,
  canDeclineQuote,
  canDispatchQuote,
  isUserRole,
} from '../src';
import type { AuthUser, QuoteEntity, RfqEntity, UserRole } from '../src';

type DomainError = Error & { code?: string };

function captureError(run: () => unknown): DomainError {
  try {
    run();
  } catch (error) {
    return error as DomainError;
  }
  throw new Error('Expected the call to throw');
}

function user(role: UserRole, organizationId = 'org_karvan', overrides?: Partial<AuthUser>): AuthUser {
  return { id: `user_${role}`, role, organizationId, isActive: true, ...overrides };
}

function rfq(overrides?: Partial<RfqEntity>): RfqEntity {
  return {
    id: 'rfq_1',
    reference: 'RFQ-1405-00001',
    status: 'submitted',
    buyerOrganizationId: 'org_arya_polymer',
    sellerOrganizationId: 'org_karvan',
    assignedToUserId: null,
    createdAt: '2026-01-10T08:00:00.000Z',
    ...overrides,
  };
}

function quote(overrides?: Partial<QuoteEntity>): QuoteEntity {
  return {
    id: 'quote_1',
    quoteNumber: 'Q-1405-0001',
    status: 'sent',
    rfqId: 'rfq_1',
    sellerOrganizationId: 'org_karvan',
    buyerOrganizationId: 'org_arya_polymer',
    createdById: 'user_creator',
    assignedToUserId: null,
    createdAt: '2026-01-12T08:00:00.000Z',
    ...overrides,
  };
}

describe('Role registry', () => {
  it('recognizes the eight roles', () => {
    expect(isUserRole('trade_manager')).toBe(true);
    expect(isUserRole('visitor')).toBe(true);
    expect(isUserRole('director')).toBe(false);
    expect(isUserRole(undefined)).toBe(false);
  });
});

describe('canAccessRfq', () => {
  it('lets a buyer see only the own tenant, draft included', () => {
    const buyer = user('buyer', 'org_arya_polymer');
    expect(canAccessRfq(buyer, rfq())).toBe(true);
    expect(canAccessRfq(buyer, rfq({ status: 'draft' }))).toBe(true);
    expect(canAccessRfq(buyer, rfq({ buyerOrganizationId: 'org_bavaria_metall' }))).toBe(false);
  });

  it('gives a sales_rep own leads plus unassigned non-draft requests', () => {
    const rep = user('sales_rep', 'org_karvan');
    expect(canAccessRfq(rep, rfq({ assignedToUserId: rep.id }))).toBe(true);
    expect(canAccessRfq(rep, rfq({ assignedToUserId: rep.id, status: 'draft' }))).toBe(true);
    expect(canAccessRfq(rep, rfq({ status: 'under_review' }))).toBe(true);
    expect(canAccessRfq(rep, rfq({ status: 'draft' }))).toBe(false);
    expect(canAccessRfq(rep, rfq({ assignedToUserId: 'user_other' }))).toBe(false);
    expect(canAccessRfq(rep, rfq({ assignedToUserId: 'user_other', status: 'draft' }))).toBe(false);
  });

  it('gives trade_manager and admin full visibility', () => {
    for (const role of ['trade_manager', 'admin'] as const) {
      expect(canAccessRfq(user(role), rfq({ status: 'draft' }))).toBe(true);
      expect(canAccessRfq(user(role), rfq({ assignedToUserId: 'user_other' }))).toBe(true);
    }
  });

  it('gives procurement, logistics and finance non-draft read access', () => {
    for (const role of ['procurement', 'logistics', 'finance'] as const) {
      expect(canAccessRfq(user(role), rfq({ status: 'quoted' }))).toBe(true);
      expect(canAccessRfq(user(role), rfq({ status: 'draft' }))).toBe(false);
    }
  });

  it('denies visitors and inactive users', () => {
    expect(canAccessRfq(user('visitor'), rfq())).toBe(false);
    expect(canAccessRfq(user('sales_rep', 'org_karvan', { isActive: false }), rfq())).toBe(false);
    expect(canAccessRfq(user('admin', 'org_karvan', { isActive: false }), rfq())).toBe(false);
  });
});

describe('canAccessQuote', () => {
  it('hides internal states from buyers of other tenants', () => {
    const buyer = user('buyer', 'org_arya_polymer');
    expect(canAccessQuote(buyer, quote({ status: 'sent' }))).toBe(true);
    expect(canAccessQuote(buyer, quote({ status: 'accepted' }))).toBe(true);
    expect(canAccessQuote(buyer, quote({ status: 'draft' }))).toBe(false);
    expect(canAccessQuote(buyer, quote({ status: 'internal_review' }))).toBe(false);
    expect(canAccessQuote(buyer, quote({ buyerOrganizationId: 'org_bavaria_metall' }))).toBe(false);
  });

  it('shows all quotes to staff roles', () => {
    for (const role of ['sales_rep', 'trade_manager', 'procurement', 'logistics', 'finance', 'admin'] as const) {
      expect(canAccessQuote(user(role), quote({ status: 'draft' }))).toBe(true);
    }
    expect(canAccessQuote(user('visitor'), quote())).toBe(false);
    expect(canAccessQuote(user('buyer', 'org_arya_polymer', { isActive: false }), quote())).toBe(false);
  });
});

describe('canCreateQuote', () => {
  it('permits sales roles only', () => {
    for (const role of ['sales_rep', 'trade_manager', 'admin'] as const) {
      expect(canCreateQuote(user(role))).toBe(true);
    }
    for (const role of ['visitor', 'buyer', 'procurement', 'logistics', 'finance'] as const) {
      expect(canCreateQuote(user(role))).toBe(false);
    }
    expect(canCreateQuote(user('sales_rep', 'org_karvan', { isActive: false }))).toBe(false);
  });
});

describe('canDispatchQuote', () => {
  const creator = { id: 'user_creator', role: 'sales_rep' as const, organizationId: 'org_karvan', isActive: true };
  const assignee = { id: 'user_assignee', role: 'sales_rep' as const, organizationId: 'org_karvan', isActive: true };

  it('permits creator and assignee on approved quotes', () => {
    expect(canDispatchQuote(creator, quote({ status: 'approved', createdById: 'user_creator' }))).toBe(true);
    expect(canDispatchQuote(assignee, quote({ status: 'approved', assignedToUserId: 'user_assignee' }))).toBe(true);
    expect(canDispatchQuote(user('sales_rep'), quote({ status: 'approved' }))).toBe(false);
  });

  it('permits draft dispatch only below the approval thresholds', () => {
    expect(canDispatchQuote(creator, quote({ status: 'draft', createdById: 'user_creator' }))).toBe(false);
    expect(
      canDispatchQuote(creator, quote({ status: 'draft', createdById: 'user_creator' }), { autoApprove: true }),
    ).toBe(true);
    expect(
      canDispatchQuote(assignee, quote({ status: 'draft', assignedToUserId: 'user_assignee' }), { autoApprove: true }),
    ).toBe(true);
    expect(
      canDispatchQuote(creator, quote({ status: 'internal_review', createdById: 'user_creator' }), {
        autoApprove: true,
      }),
    ).toBe(false);
  });

  it('lets trade_manager and admin dispatch any quotable record', () => {
    expect(canDispatchQuote(user('trade_manager'), quote({ status: 'approved' }))).toBe(true);
    expect(canDispatchQuote(user('admin'), quote({ status: 'approved' }))).toBe(true);
    expect(canDispatchQuote(user('trade_manager'), quote({ status: 'sent' }))).toBe(false);
    expect(canDispatchQuote(user('buyer'), quote({ status: 'approved' }))).toBe(false);
    expect(canDispatchQuote(user('finance'), quote({ status: 'approved' }))).toBe(false);
    expect(canDispatchQuote(creator, quote({ status: 'approved' }), undefined)).toBe(true);
    expect(
      canDispatchQuote(
        { ...creator, isActive: false },
        quote({ status: 'approved', createdById: 'user_creator' }),
      ),
    ).toBe(false);
  });
});

describe('canApproveQuote', () => {
  it('enforces the four-eyes rule for trade_manager and finance', () => {
    expect(canApproveQuote(user('trade_manager'), quote({ createdById: 'user_creator' }))).toBe(true);
    expect(canApproveQuote(user('finance'), quote({ createdById: 'user_creator' }))).toBe(true);
    expect(canApproveQuote(user('trade_manager'), quote({ createdById: 'user_trade_manager' }))).toBe(false);
    expect(canApproveQuote(user('finance'), quote({ createdById: 'user_finance' }))).toBe(false);
  });

  it('exempts admin from four-eyes and denies all other roles', () => {
    expect(canApproveQuote(user('admin'), quote({ createdById: 'user_admin' }))).toBe(true);
    for (const role of ['visitor', 'buyer', 'sales_rep', 'procurement', 'logistics'] as const) {
      expect(canApproveQuote(user(role), quote({ createdById: 'user_creator' }))).toBe(false);
    }
    expect(canApproveQuote(user('trade_manager', 'org_karvan', { isActive: false }), quote())).toBe(false);
  });
});

describe('canAcceptQuote and canDeclineQuote', () => {
  it('permits the buying tenant on sent quotes', () => {
    const buyer = user('buyer', 'org_arya_polymer');
    expect(canAcceptQuote(buyer, quote({ status: 'sent' }))).toBe(true);
    expect(canDeclineQuote(buyer, quote({ status: 'sent' }))).toBe(true);
    expect(canAcceptQuote(buyer, quote({ status: 'sent', buyerOrganizationId: 'org_bavaria_metall' }))).toBe(false);
    expect(canDeclineQuote(buyer, quote({ status: 'sent', buyerOrganizationId: 'org_bavaria_metall' }))).toBe(false);
  });

  it('restricts both actions to the sent status', () => {
    const buyer = user('buyer', 'org_arya_polymer');
    for (const status of ['draft', 'internal_review', 'approved', 'revised', 'accepted', 'expired'] as const) {
      expect(canAcceptQuote(buyer, quote({ status }))).toBe(false);
      expect(canDeclineQuote(buyer, quote({ status }))).toBe(false);
    }
  });

  it('lets admin act on sent quotes and denies staff roles', () => {
    expect(canAcceptQuote(user('admin'), quote({ status: 'sent' }))).toBe(true);
    expect(canDeclineQuote(user('admin'), quote({ status: 'sent' }))).toBe(true);
    expect(canAcceptQuote(user('admin'), quote({ status: 'approved' }))).toBe(false);
    for (const role of ['sales_rep', 'trade_manager', 'finance', 'procurement', 'logistics'] as const) {
      expect(canAcceptQuote(user(role), quote({ status: 'sent' }))).toBe(false);
      expect(canDeclineQuote(user(role), quote({ status: 'sent' }))).toBe(false);
    }
    expect(canAcceptQuote(user('buyer', 'org_arya_polymer', { isActive: false }), quote())).toBe(false);
  });
});

describe('assert guards', () => {
  it('throws ForbiddenDomainActionError on denial', () => {
    const buyer = user('buyer', 'org_arya_polymer');
    const otherBuyer = user('buyer', 'org_bavaria_metall');
    const denialPairs: Array<() => unknown> = [
      () => assertCanAccessRfq(user('visitor'), rfq()),
      () => assertCanAccessQuote(otherBuyer, quote()),
      () => assertCanCreateQuote(buyer),
      () => assertCanDispatchQuote(user('sales_rep'), quote({ status: 'approved' })),
      () => assertCanApproveQuote(user('trade_manager'), quote({ createdById: 'user_trade_manager' })),
      () => assertCanAcceptQuote(user('sales_rep'), quote()),
      () => assertCanDeclineQuote(otherBuyer, quote()),
    ];
    for (const denial of denialPairs) {
      const error = captureError(denial);
      expect(error).toBeInstanceOf(ForbiddenDomainActionError);
      expect(error.code).toBe('forbidden_domain_action');
      expect((error as ForbiddenDomainActionError).action).toMatch(/^(rfq|quote)\./);
    }
  });

  it('passes silently on allowal', () => {
    const buyer = user('buyer', 'org_arya_polymer');
    expect(() => assertCanAccessRfq(buyer, rfq())).not.toThrow();
    expect(() => assertCanAccessQuote(buyer, quote({ status: 'sent' }))).not.toThrow();
    expect(() => assertCanCreateQuote(user('sales_rep'))).not.toThrow();
    expect(() =>
      assertCanDispatchQuote(
        { id: 'user_creator', role: 'sales_rep', organizationId: 'org_karvan', isActive: true },
        quote({ status: 'approved', createdById: 'user_creator' }),
      ),
    ).not.toThrow();
    expect(() =>
      assertCanApproveQuote(user('finance'), quote({ createdById: 'user_creator' })),
    ).not.toThrow();
    expect(() => assertCanAcceptQuote(buyer, quote({ status: 'sent' }))).not.toThrow();
    expect(() => assertCanDeclineQuote(user('admin'), quote({ status: 'sent' }))).not.toThrow();
  });
});
