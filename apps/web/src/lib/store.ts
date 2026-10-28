import {
  assertMilestoneAdvance,
  assertQuoteTransition,
  assertRfqTransition,
  assertTradeCaseTransition,
  assertCanAcceptQuote,
  assertCanApproveQuote,
  assertCanCreateQuote,
  assertCanDeclineQuote,
  assertCanDispatchQuote,
  ForbiddenDomainActionError,
  buildRedactedAuditRecord,
  calculateLineTotal,
  calculateQuoteSubtotal,
  calculateQuoteTotal,
  createQuoteSnapshot,
  Money,
  requiresManagementApproval,
  verifyQuoteSnapshot,
  type AuditEventType,
  type AuthUser,
  type QuoteSnapshot,
  type ShipmentMilestone,
  type UserRole,
} from '@karvan/core';
import {
  type AcceptQuoteInput,
  type CaseChecklistItem,
  type CountryCode,
  type CreateInquiryInput,
  type CreateQuoteInput,
  type CreateRfqInput,
  type DeclineQuoteInput,
  type Incoterm,
  type MilestoneAdvanceInput,
  type ReviseQuoteInput,
  type RfqStatus,
  type TradeCaseStatus,
  type UpdateRfqStatusInput,
} from '@karvan/contracts';

import {createSeedData} from './seed';
import type {
  ActorContext,
  AuditEvent,
  CaseMilestoneRecord,
  ContactInquiryRecord,
  IdempotentEntry,
  NotificationRecord,
  Organization,
  ProductRecord,
  QuoteRecord,
  RfqRecord,
  StoreData,
  TradeCaseRecord,
  TradeDocumentRecord,
  UserRecord,
} from './types';
import type {Dictionary} from '@karvan/i18n';

export class VersionConflictError extends Error {
  readonly code = 'version_conflict';
  readonly expectedVersion: number;
  readonly actualVersion: number;

  constructor(expectedVersion: number, actualVersion: number) {
    super(`Stale write: expected version ${expectedVersion}, record is at version ${actualVersion}.`);
    this.name = 'VersionConflictError';
    this.expectedVersion = expectedVersion;
    this.actualVersion = actualVersion;
  }
}

export class RecordNotFoundError extends Error {
  readonly code = 'not_found';
  readonly entity: string;
  readonly id: string;

  constructor(entity: string, id: string) {
    super(`${entity} ${id} was not found.`);
    this.name = 'RecordNotFoundError';
    this.entity = entity;
    this.id = id;
  }
}

export class SnapshotMismatchError extends Error {
  readonly code = 'snapshot_mismatch';

  constructor(quoteId: string) {
    super(`The archived snapshot of quote ${quoteId} does not match its checksum.`);
    this.name = 'SnapshotMismatchError';
  }
}

const RFQ_PAGE_SIZE_LIMIT = 100;

const STAFF_RFQ_ROLES: ReadonlySet<UserRole> = new Set<UserRole>(['sales_rep', 'trade_manager', 'admin']);
const CASE_WRITER_ROLES: ReadonlySet<UserRole> = new Set<UserRole>(['sales_rep', 'trade_manager', 'logistics', 'admin']);

function authUserOf(actor: ActorContext): AuthUser {
  return {id: actor.userId, role: actor.role, organizationId: actor.organizationId, isActive: true};
}

function nowIso(): string {
  return new Date().toISOString();
}

function plus24h(from: string): string {
  return new Date(new Date(from).getTime() + 24 * 60 * 60 * 1000).toISOString();
}

function isPast(iso: string, reference: string): boolean {
  return new Date(iso).getTime() < new Date(reference).getTime();
}

export interface RfqListFilter {
  status?: RfqStatus | readonly RfqStatus[];
  assignedUser?: string;
  destinationCountry?: CountryCode;
  search?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface Paginated<T> {
  items: T[];
  pagination: {page: number; pageSize: number; total: number; totalPages: number};
}

export interface TrackResult {
  kind: 'rfq' | 'quote' | 'trade_case';
  reference: string;
  status: string;
  currentMilestone?: ShipmentMilestone;
  lastUpdate: string;
  buyerOrganizationId: string;
  buyerName: string;
  commodity: {fa: string; en: string};
  incoterm?: Incoterm;
}

export interface SweepSummary {
  expiredRfqs: number;
  expiredQuotes: number;
}

export interface DocumentDownloadTicket {
  documentId: string;
  downloadToken: string;
  expiresAt: string;
  expiresInSeconds: number;
}

type NotificationTemplate = keyof Dictionary['notifications'];

interface NotificationInput {
  recipientOrganizationId: string;
  recipientUserId?: string | null;
  area: 'crm' | 'portal';
  template: NotificationTemplate;
  params: Record<string, string>;
}

export class Store {
  private readonly data: StoreData;

  constructor(data: StoreData) {
    this.data = data;
  }

  // ---- idempotency ----

  replayOrBegin(idempotencyKey: string): IdempotentEntry | null {
    return this.data.idempotency.get(idempotencyKey) ?? null;
  }

  finish(idempotencyKey: string, status: number, body: unknown): void {
    this.data.idempotency.set(idempotencyKey, {status, body});
  }

  // ---- public directory reads ----

  getOrganization(organizationId: string): Organization {
    const organization = this.data.organizations.get(organizationId);
    if (!organization) throw new RecordNotFoundError('organization', organizationId);
    return organization;
  }

  getUser(userId: string): UserRecord | null {
    return this.data.users.get(userId) ?? null;
  }

  listProducts(): ProductRecord[] {
    return [...this.data.products.values()];
  }

  getProduct(productId: string): ProductRecord {
    const product = this.data.products.get(productId);
    if (!product) throw new RecordNotFoundError('product', productId);
    return product;
  }

  // ---- RFQ ----

  listRfqs(actor: ActorContext, filter: RfqListFilter = {}): Paginated<RfqRecord> {
    this.runSweep();
    const user = authUserOf(actor);
    const accessible = [...this.data.rfqs.values()].filter((rfq) => this.canViewRfq(user, rfq));
    const filtered = accessible.filter((rfq) => {
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(rfq.status)) return false;
      }
      if (filter.assignedUser && rfq.assignedToUserId !== filter.assignedUser) return false;
      if (filter.destinationCountry && rfq.destinationCountry !== filter.destinationCountry) return false;
      if (filter.search) {
        const needle = filter.search.toLowerCase();
        const haystack = [
          rfq.reference,
          rfq.company.name,
          rfq.contact.name,
          rfq.contact.email,
          ...rfq.lines.map((line) => line.description),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
    filtered.sort((left, right) => {
      const delta = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      return filter.sortOrder === 'asc' ? delta : -delta;
    });
    const page = Math.max(1, filter.page ?? 1);
    const pageSize = Math.min(RFQ_PAGE_SIZE_LIMIT, Math.max(1, filter.pageSize ?? 20));
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  }

  getRfq(actor: ActorContext, rfqId: string): RfqRecord {
    this.runSweep();
    const rfq = this.data.rfqs.get(rfqId);
    if (!rfq) throw new RecordNotFoundError('rfq', rfqId);
    const user = authUserOf(actor);
    if (!this.canViewRfq(user, rfq)) throw new ForbiddenDomainActionError('rfq.access');
    return rfq;
  }

  createRfq(input: CreateRfqInput): RfqRecord {
    const createdAt = nowIso();
    const slug = nameSlug(input.company.name);
    let buyerOrganizationId = [...this.data.organizations.values()].find(
      (organization) => organization.nameSlug === slug,
    )?.id;
    if (!buyerOrganizationId) {
      buyerOrganizationId = `org_${slug}`;
      while (this.data.organizations.has(buyerOrganizationId)) {
        buyerOrganizationId = `${buyerOrganizationId}x`;
      }
      const organization: Organization = {
        id: buyerOrganizationId,
        kind: 'buyer',
        name: {fa: input.company.name, en: input.company.name},
        country: input.company.country,
        city: {fa: input.company.city ?? input.destinationCity, en: input.company.city ?? input.destinationCity},
        contactEmail: input.contact.email,
        nameSlug: slug,
      };
      this.data.organizations.set(organization.id, organization);
    }

    const reference = `RFQ-1405-${String(this.data.counters.rfq + 1).padStart(5, '0')}`;
    this.data.counters.rfq += 1;
    const rfq: RfqRecord = {
      id: `rfq_1405_${String(this.data.counters.rfq).padStart(5, '0')}`,
      reference,
      status: 'submitted',
      version: 1,
      buyerOrganizationId,
      sellerOrganizationId: 'org_karvan',
      assignedToUserId: null,
      createdAt,
      updatedAt: createdAt,
      slaDeadline: plus24h(createdAt),
      company: input.company,
      contact: input.contact,
      destinationCountry: input.destinationCountry,
      destinationCity: input.destinationCity,
      incoterm: input.incoterm,
      incotermNamedPlace: input.incotermNamedPlace,
      targetDeliveryDate: input.targetDeliveryDate,
      lines: input.lines,
      notes: input.notes,
    };
    this.data.rfqs.set(rfq.id, rfq);

    this.recordAudit('rfq.created', actorFromInput(input), {
      type: 'rfq',
      id: rfq.id,
      reference,
      organizationId: 'org_karvan',
    });
    this.notify({recipientOrganizationId: 'org_karvan', area: 'crm', template: 'rfqSubmitted', params: {reference}});
    return rfq;
  }

  transitionRfq(
    actor: ActorContext,
    rfqId: string,
    input: UpdateRfqStatusInput,
  ): RfqRecord {
    const rfq = this.data.rfqs.get(rfqId);
    if (!rfq) throw new RecordNotFoundError('rfq', rfqId);
    if (input.expectedVersion !== rfq.version) {
      throw new VersionConflictError(input.expectedVersion, rfq.version);
    }

    assertRfqTransition(rfq.status, input.targetStatus);
    const action = actionForTransition(rfq.status, input.targetStatus);
    this.assertRfqTransitionPermission(actor, rfq, action);

    const updatedAt = nowIso();
    rfq.status = input.targetStatus;
    rfq.version += 1;
    rfq.updatedAt = updatedAt;

    if (action === 'ASSIGN_LEAD') {
      rfq.assignedToUserId = actor.userId;
    }
    if (action === 'REQUEST_INFO') {
      if (!input.comment || input.comment.trim().length < 20) {
        throw new ForbiddenDomainActionError(
          'rfq.request_info',
          'A question of at least 20 characters is required to request information.',
        );
      }
      rfq.question = input.comment.trim();
      rfq.slaDeadline = plus24h(updatedAt);
      this.notify({
        recipientOrganizationId: rfq.buyerOrganizationId,
        area: 'portal',
        template: 'rfqNeedsInformation',
        params: {reference: rfq.reference},
      });
    }
    if (action === 'PROVIDE_INFO') {
      rfq.question = undefined;
    }
    if (action === 'REJECT_LEAD' || action === 'REJECT_RFQ') {
      if (!input.reason || input.reason.trim().length === 0) {
        throw new ForbiddenDomainActionError('rfq.reject', 'A reason is required to reject an RFQ.');
      }
      rfq.rejectionReason = input.reason.trim();
    }

    const auditType: AuditEventType
      = action === 'ASSIGN_LEAD' ? 'rfq.assigned'
      : action === 'QUALIFY_RFQ' ? 'rfq.qualified'
      : action === 'REJECT_LEAD' || action === 'REJECT_RFQ' ? 'rfq.rejected'
      : action === 'SUBMIT_RFQ' ? 'rfq.submitted'
      : 'rfq.status_changed';
    this.recordAudit(
      auditType,
      actor,
      {type: 'rfq', id: rfq.id, reference: rfq.reference, organizationId: 'org_karvan'},
      {action, fromStatus: rfq.status, toStatus: input.targetStatus},
    );
    return rfq;
  }

  // ---- Quotes ----

  listQuotes(actor: ActorContext, filter: {rfqId?: string} = {}): QuoteRecord[] {
    this.runSweep();
    const user = authUserOf(actor);
    return [...this.data.quotes.values()]
      .filter((quote) => (filter.rfqId ? quote.rfqId === filter.rfqId : true))
      .filter((quote) => this.canViewQuote(user, quote))
      .sort((left, right) => left.quoteNumber.localeCompare(right.quoteNumber));
  }

  getQuote(actor: ActorContext, quoteId: string): QuoteRecord {
    this.runSweep();
    const quote = this.data.quotes.get(quoteId);
    if (!quote) throw new RecordNotFoundError('quote', quoteId);
    const user = authUserOf(actor);
    if (!this.canViewQuote(user, quote)) throw new ForbiddenDomainActionError('quote.access');
    return quote;
  }

  createQuoteDraft(
    actor: ActorContext,
    input: CreateQuoteInput,
    options: {expectedVersion?: number} = {},
  ): QuoteRecord {
    const user = authUserOf(actor);
    assertCanCreateQuote(user);
    const rfq = this.data.rfqs.get(input.rfqId);
    if (!rfq) throw new RecordNotFoundError('rfq', input.rfqId);
    if (rfq.sellerOrganizationId !== actor.organizationId) {
      throw new ForbiddenDomainActionError('quote.create');
    }
    if (options.expectedVersion !== undefined && options.expectedVersion !== rfq.version) {
      throw new VersionConflictError(options.expectedVersion, rfq.version);
    }
    if (rfq.status !== 'qualified' && rfq.status !== 'quote_preparation' && rfq.status !== 'quoted') {
      throw new ForbiddenDomainActionError('quote.create', `RFQ ${rfq.reference} is not ready for pricing.`);
    }

    const createdAt = nowIso();
    const currency = input.currency;
    const lines = input.lines.map((line, index) => ({
      ...line,
      lineTotal: calculateLineTotal(
        {unitPrice: line.unitPrice, quantity: line.quantity, discountPct: line.discountPercentage},
        currency,
      ).format(),
      description: line.description,
      productId: line.productId ?? (index === 0 ? rfq.lines[0]?.productId : undefined),
    }));
    const subtotal = calculateQuoteSubtotal(lines, currency);
    const discount = input.discountPercentage > 0
      ? subtotal.mul(String(input.discountPercentage)).div('100')
      : Money.zero(currency);
    const total = calculateQuoteTotal({
      lines,
      shipping: input.shippingAmount,
      insurance: input.insuranceAmount,
      tax: input.taxAmount,
      discount,
      currency,
    });
    const approvalRequired = requiresManagementApproval(input.discountPercentage, Number(total.format()));

    if (rfq.status === 'qualified') {
      assertRfqTransition('qualified', 'quote_preparation');
      rfq.status = 'quote_preparation';
      rfq.version += 1;
      rfq.updatedAt = createdAt;
      this.recordAudit(
        'rfq.status_changed',
        actor,
        {type: 'rfq', id: rfq.id, reference: rfq.reference, organizationId: 'org_karvan'},
        {action: 'START_PRICING', fromStatus: 'qualified', toStatus: 'quote_preparation'},
      );
    }

    this.data.counters.quote += 1;
    const quoteNumber = `Q-1405-${String(this.data.counters.quote).padStart(4, '0')}`;
    const quote: QuoteRecord = {
      id: `quote_1405_${String(this.data.counters.quote).padStart(4, '0')}`,
      quoteNumber,
      rfqId: rfq.id,
      status: 'draft',
      version: 1,
      sellerOrganizationId: actor.organizationId,
      buyerOrganizationId: rfq.buyerOrganizationId,
      createdById: actor.userId,
      assignedToUserId: actor.userId,
      createdAt,
      updatedAt: createdAt,
      currency,
      lines,
      shippingAmount: input.shippingAmount,
      insuranceAmount: input.insuranceAmount,
      taxAmount: input.taxAmount,
      discountPercentage: input.discountPercentage,
      subtotal: subtotal.format(),
      discountAmount: discount.format(),
      total: total.format(),
      approvalRequired,
      incoterm: input.incoterm,
      incotermNamedPlace: input.incotermNamedPlace,
      paymentTerms: input.paymentTerms,
      leadTimeDays: input.leadTimeDays,
      productionDays: input.productionDays,
      transitDays: input.transitDays,
      validUntil: input.validUntil,
      notes: input.notes,
    };
    this.data.quotes.set(quote.id, quote);

    this.recordAudit('quote.created', actor, {
      type: 'quote',
      id: quote.id,
      reference: quoteNumber,
      organizationId: 'org_karvan',
    });
    return quote;
  }

  approveQuote(
    actor: ActorContext,
    quoteId: string,
    input: {approvalNote?: string},
    options: {expectedVersion?: number} = {},
  ): QuoteRecord {
    const quote = this.requireQuote(quoteId);
    const user = authUserOf(actor);
    if (options.expectedVersion !== undefined && options.expectedVersion !== quote.version) {
      throw new VersionConflictError(options.expectedVersion, quote.version);
    }
    assertCanApproveQuote(user, quoteEntityOf(quote));
    assertQuoteTransition(quote.status, 'approved');

    quote.status = 'approved';
    quote.version += 1;
    quote.updatedAt = nowIso();
    quote.approvedByUserId = actor.userId;
    quote.approvalNote = input.approvalNote;

    this.recordAudit('quote.approved', actor, {
      type: 'quote',
      id: quote.id,
      reference: quote.quoteNumber,
      organizationId: 'org_karvan',
    });
    return quote;
  }

  finalizeAndSendQuote(
    actor: ActorContext,
    quoteId: string,
    options: {expectedVersion?: number} = {},
  ): QuoteRecord {
    const quote = this.requireQuote(quoteId);
    const user = authUserOf(actor);
    if (options.expectedVersion !== undefined && options.expectedVersion !== quote.version) {
      throw new VersionConflictError(options.expectedVersion, quote.version);
    }
    assertCanDispatchQuote(user, quoteEntityOf(quote), {autoApprove: !quote.approvalRequired});

    const from = quote.status;
    assertQuoteTransition(from, 'sent');
    const dispatchedAt = nowIso();
    const rfq = this.data.rfqs.get(quote.rfqId);
    if (!rfq) throw new RecordNotFoundError('rfq', quote.rfqId);

    quote.snapshot = createQuoteSnapshot({
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      rfqId: quote.rfqId,
      rfqReference: rfq.reference,
      version: quote.version + 1,
      seller: {
        organizationId: quote.sellerOrganizationId,
        name: this.getOrganization(quote.sellerOrganizationId).name.en,
        country: this.getOrganization(quote.sellerOrganizationId).country,
        email: 'desk@karvan.trade',
      },
      buyer: {
        organizationId: quote.buyerOrganizationId,
        name: rfq.company.name,
        country: rfq.company.country,
        city: rfq.company.city,
        contactName: rfq.contact.name,
        email: rfq.contact.email,
      },
      lines: quote.lines.map((line, index) => ({
        id: `line_${index + 1}`,
        productId: line.productId,
        description: line.description,
        hsCode: line.hsCode,
        unit: line.unit,
        quantity: Number(line.quantity),
        unitPrice: line.unitPrice,
        discountPct: line.discountPercentage,
        lineTotal: line.lineTotal,
      })),
      financials: {
        currency: quote.currency,
        subtotal: quote.subtotal,
        shipping: quote.shippingAmount,
        insurance: quote.insuranceAmount,
        tax: quote.taxAmount,
        discount: quote.discountAmount,
        total: quote.total,
      },
      incoterms: {code: quote.incoterm, location: quote.incotermNamedPlace ?? ''},
      leadTime: {
        productionDays: quote.productionDays,
        transitDays: quote.transitDays,
        totalDays: quote.leadTimeDays,
      },
      validUntil: quote.validUntil,
      notes: quote.notes,
    });
    if (!verifyQuoteSnapshot(quote.snapshot)) {
      throw new SnapshotMismatchError(quote.id);
    }

    quote.status = 'sent';
    quote.version += 1;
    quote.updatedAt = dispatchedAt;
    quote.dispatchedAt = dispatchedAt;

    if (rfq.status === 'quote_preparation') {
      assertRfqTransition('quote_preparation', 'quoted');
      rfq.status = 'quoted';
      rfq.version += 1;
      rfq.updatedAt = dispatchedAt;
      this.recordAudit(
        'rfq.status_changed',
        actor,
        {type: 'rfq', id: rfq.id, reference: rfq.reference, organizationId: 'org_karvan'},
        {action: 'DISPATCH_QUOTE', fromStatus: 'quote_preparation', toStatus: 'quoted'},
      );
    }

    this.recordAudit('quote.sent', actor, {
      type: 'quote',
      id: quote.id,
      reference: quote.quoteNumber,
      organizationId: 'org_karvan',
    }, {action: 'DISPATCH_QUOTE', fromStatus: from, toStatus: 'sent'});
    this.notify({
      recipientOrganizationId: quote.buyerOrganizationId,
      area: 'portal',
      template: 'quoteSent',
      params: {quoteNumber: quote.quoteNumber, reference: rfq.reference},
    });
    return quote;
  }

  acceptQuote(
    actor: ActorContext,
    quoteId: string,
    input: AcceptQuoteInput,
    options: {expectedVersion?: number} = {},
  ): {quote: QuoteRecord; tradeCase: TradeCaseRecord} {
    this.runSweep();
    const quote = this.requireQuote(quoteId);
    const user = authUserOf(actor);
    if (options.expectedVersion !== undefined && options.expectedVersion !== quote.version) {
      throw new VersionConflictError(options.expectedVersion, quote.version);
    }
    assertCanAcceptQuote(user, quoteEntityOf(quote));
    if (!quote.snapshot || !verifyQuoteSnapshot(quote.snapshot)) {
      throw new SnapshotMismatchError(quote.id);
    }
    assertQuoteTransition(quote.status, 'accepted');

    const acceptedAt = nowIso();
    const rfq = this.data.rfqs.get(quote.rfqId);
    if (!rfq) throw new RecordNotFoundError('rfq', quote.rfqId);

    quote.status = 'accepted';
    quote.version += 1;
    quote.updatedAt = acceptedAt;
    quote.acceptance = {
      acceptedAt,
      signature: input.acceptanceSignature,
      poNumber: input.poNumber,
    };

    const reference = `TC-1405-${String(this.data.counters.case + 1).padStart(4, '0')}`;
    this.data.counters.case += 1;
    const tradeCase: TradeCaseRecord = {
      id: `case_1405_${String(this.data.counters.case).padStart(4, '0')}`,
      reference,
      quoteId: quote.id,
      rfqId: rfq.id,
      sellerOrganizationId: quote.sellerOrganizationId,
      buyerOrganizationId: quote.buyerOrganizationId,
      status: 'confirmed',
      version: 1,
      createdAt: acceptedAt,
      updatedAt: acceptedAt,
      currentMilestone: 'booking_confirmed',
      milestones: [
        {
          milestone: 'booking_confirmed',
          completedAt: acceptedAt,
          notes: 'پروندهٔ تجاری با پذیرش پیش‌فاکتور گشوده شد و نخستین نقطهٔ عطف ثبت گردید.',
        },
      ],
      checklist: {
        sgs_draft_survey: {done: false},
        laboratory_assay: {done: false},
        export_customs_declaration: {done: false},
        clean_on_board_bl: {done: false},
        commercial_invoice: {done: false},
      },
      quoteChecksum: quote.snapshot.checksum,
      transportMode: 'sea',
      commodity: {fa: rfq.lines[0]?.description ?? quote.lines[0]?.description ?? '', en: rfq.lines[0]?.description ?? ''},
    };
    this.data.tradeCases.set(tradeCase.id, tradeCase);

    if (rfq.status === 'quoted') {
      assertRfqTransition('quoted', 'accepted');
      rfq.status = 'accepted';
      rfq.version += 1;
      rfq.updatedAt = acceptedAt;
      this.recordAudit(
        'rfq.status_changed',
        actor,
        {type: 'rfq', id: rfq.id, reference: rfq.reference, organizationId: 'org_karvan'},
        {action: 'ACCEPT_DEAL', fromStatus: 'quoted', toStatus: 'accepted'},
      );
    }

    this.recordAudit('quote.accepted', actor, {
      type: 'quote',
      id: quote.id,
      reference: quote.quoteNumber,
      organizationId: 'org_karvan',
    });
    this.recordAudit('trade_case.created', actor, {
      type: 'trade_case',
      id: tradeCase.id,
      reference,
      organizationId: 'org_karvan',
    });
    this.notify({
      recipientOrganizationId: quote.sellerOrganizationId,
      area: 'crm',
      template: 'quoteAccepted',
      params: {quoteNumber: quote.quoteNumber},
    });
    return {quote, tradeCase};
  }

  requestRevision(
    actor: ActorContext,
    quoteId: string,
    input: ReviseQuoteInput,
    options: {expectedVersion?: number} = {},
  ): {archived: QuoteRecord; draft: QuoteRecord} {
    const quote = this.requireQuote(quoteId);
    const user = authUserOf(actor);
    if (options.expectedVersion !== undefined && options.expectedVersion !== quote.version) {
      throw new VersionConflictError(options.expectedVersion, quote.version);
    }
    const canRevise = (user.role === 'buyer' && quote.buyerOrganizationId === user.organizationId) || user.role === 'admin';
    if (!canRevise) throw new ForbiddenDomainActionError('quote.revise');
    assertQuoteTransition(quote.status, 'revised');

    const requestedAt = nowIso();
    const rfq = this.data.rfqs.get(quote.rfqId);
    if (!rfq) throw new RecordNotFoundError('rfq', quote.rfqId);

    quote.status = 'revised';
    quote.version += 1;
    quote.updatedAt = requestedAt;
    quote.archivedAt = requestedAt;

    const draft: QuoteRecord = {
      ...quote,
      id: `${quote.id}_v${quote.version}`,
      status: 'draft',
      version: quote.version,
      createdAt: requestedAt,
      updatedAt: requestedAt,
      revisionNotes: input.notes,
      dispatchedAt: undefined,
      archivedAt: undefined,
      supersededById: undefined,
      acceptance: undefined,
      decline: undefined,
      snapshot: undefined,
      approvalNote: undefined,
      approvedByUserId: quote.approvedByUserId,
    };
    quote.supersededById = draft.id;
    this.data.quotes.set(draft.id, draft);

    if (rfq.status === 'quoted') {
      assertRfqTransition('quoted', 'quote_preparation');
      rfq.status = 'quote_preparation';
      rfq.version += 1;
      rfq.updatedAt = requestedAt;
      this.recordAudit(
        'rfq.status_changed',
        actor,
        {type: 'rfq', id: rfq.id, reference: rfq.reference, organizationId: 'org_karvan'},
        {action: 'REQUEST_REVISION', fromStatus: 'quoted', toStatus: 'quote_preparation'},
      );
    }

    this.recordAudit('quote.revised', actor, {
      type: 'quote',
      id: quote.id,
      reference: quote.quoteNumber,
      organizationId: 'org_karvan',
    }, {toStatus: 'revised'});
    this.notify({
      recipientOrganizationId: quote.sellerOrganizationId,
      area: 'crm',
      template: 'quoteRevised',
      params: {quoteNumber: quote.quoteNumber},
    });
    return {archived: quote, draft};
  }

  declineQuote(
    actor: ActorContext,
    quoteId: string,
    input: DeclineQuoteInput,
    options: {expectedVersion?: number} = {},
  ): QuoteRecord {
    const quote = this.requireQuote(quoteId);
    const user = authUserOf(actor);
    if (options.expectedVersion !== undefined && options.expectedVersion !== quote.version) {
      throw new VersionConflictError(options.expectedVersion, quote.version);
    }
    assertCanDeclineQuote(user, quoteEntityOf(quote));
    assertQuoteTransition(quote.status, 'declined');

    quote.status = 'declined';
    quote.version += 1;
    quote.updatedAt = nowIso();
    quote.decline = {
      reason: input.reason,
      comment: input.comment,
      declinedAt: quote.updatedAt,
    };

    this.recordAudit('quote.declined', actor, {
      type: 'quote',
      id: quote.id,
      reference: quote.quoteNumber,
      organizationId: 'org_karvan',
    }, {toStatus: 'declined'});
    this.notify({
      recipientOrganizationId: quote.sellerOrganizationId,
      area: 'crm',
      template: 'quoteDeclined',
      params: {quoteNumber: quote.quoteNumber},
    });
    return quote;
  }

  // ---- Trade cases ----

  listTradeCases(actor: ActorContext, filter: {status?: TradeCaseStatus} = {}): TradeCaseRecord[] {
    this.runSweep();
    const user = authUserOf(actor);
    return [...this.data.tradeCases.values()]
      .filter((record) => this.canViewTradeCase(user, record))
      .filter((record) => (filter.status ? record.status === filter.status : true))
      .sort((left, right) => left.reference.localeCompare(right.reference));
  }

  getTradeCase(actor: ActorContext, caseId: string): TradeCaseRecord {
    this.runSweep();
    const record = this.data.tradeCases.get(caseId);
    if (!record) throw new RecordNotFoundError('trade_case', caseId);
    const user = authUserOf(actor);
    if (!this.canViewTradeCase(user, record)) throw new ForbiddenDomainActionError('trade_case.access');
    return record;
  }

  advanceMilestone(
    actor: ActorContext,
    input: MilestoneAdvanceInput,
  ): TradeCaseRecord {
    const record = this.data.tradeCases.get(input.caseId);
    if (!record) throw new RecordNotFoundError('trade_case', input.caseId);
    const user = authUserOf(actor);
    if (!this.canViewTradeCase(user, record) || !CASE_WRITER_ROLES.has(user.role)) {
      throw new ForbiddenDomainActionError('trade_case.advance_milestone');
    }
    if (input.expectedVersion !== record.version) {
      throw new VersionConflictError(input.expectedVersion, record.version);
    }
    assertMilestoneAdvance(record.currentMilestone, input.targetMilestone);

    const completedAt = nowIso();
    if (record.status === 'confirmed') {
      assertTradeCaseTransition('confirmed', 'in_execution');
      record.status = 'in_execution';
    }

    const milestoneEntry: CaseMilestoneRecord = {
      milestone: input.targetMilestone,
      completedAt,
      location: input.location,
      vesselName: input.vesselName,
      billOfLading: input.billOfLading,
      notes: input.notes,
    };
    record.milestones.push(milestoneEntry);
    record.currentMilestone = input.targetMilestone;
    record.version += 1;
    record.updatedAt = completedAt;
    if (input.vesselName) record.vesselName = input.vesselName;
    if (input.billOfLading) record.billOfLading = input.billOfLading;

    this.recordAudit('trade_case.milestone_updated', actor, {
      type: 'trade_case',
      id: record.id,
      reference: record.reference,
      organizationId: 'org_karvan',
    }, {toStatus: input.targetMilestone});
    this.notify({
      recipientOrganizationId: record.buyerOrganizationId,
      area: 'portal',
      template: 'milestoneUpdated',
      params: {reference: record.reference, milestone: input.targetMilestone},
    });
    return record;
  }

  toggleChecklist(
    actor: ActorContext,
    input: {caseId: string; item: CaseChecklistItem; value: boolean},
  ): TradeCaseRecord {
    const record = this.data.tradeCases.get(input.caseId);
    if (!record) throw new RecordNotFoundError('trade_case', input.caseId);
    const user = authUserOf(actor);
    if (!this.canViewTradeCase(user, record) || !CASE_WRITER_ROLES.has(user.role)) {
      throw new ForbiddenDomainActionError('trade_case.toggle_checklist');
    }
    record.checklist[input.item] = {
      done: input.value,
      updatedAt: nowIso(),
      updatedByUserId: actor.userId,
    };
    record.updatedAt = nowIso();
    return record;
  }

  completeTradeCase(
    actor: ActorContext,
    caseId: string,
    options: {expectedVersion?: number} = {},
  ): TradeCaseRecord {
    const record = this.data.tradeCases.get(caseId);
    if (!record) throw new RecordNotFoundError('trade_case', caseId);
    const user = authUserOf(actor);
    if (!this.canViewTradeCase(user, record) || !CASE_WRITER_ROLES.has(user.role)) {
      throw new ForbiddenDomainActionError('trade_case.complete');
    }
    if (options.expectedVersion !== undefined && options.expectedVersion !== record.version) {
      throw new VersionConflictError(options.expectedVersion, record.version);
    }
    if (record.currentMilestone !== 'delivered') {
      throw new ForbiddenDomainActionError(
        'trade_case.complete',
        'A trade case can only be completed after the delivered milestone.',
      );
    }
    assertTradeCaseTransition(record.status, 'completed');

    record.status = 'completed';
    record.version += 1;
    record.updatedAt = nowIso();

    this.recordAudit('trade_case.completed', actor, {
      type: 'trade_case',
      id: record.id,
      reference: record.reference,
      organizationId: 'org_karvan',
    });
    this.notify({
      recipientOrganizationId: record.buyerOrganizationId,
      area: 'portal',
      template: 'caseCompleted',
      params: {reference: record.reference},
    });
    return record;
  }

  // ---- Documents ----

  listDocuments(actor: ActorContext): TradeDocumentRecord[] {
    const user = authUserOf(actor);
    return [...this.data.documents.values()]
      .filter((document) => this.canViewDocument(user, document))
      .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
  }

  getDocument(actor: ActorContext, documentId: string): TradeDocumentRecord {
    const document = this.data.documents.get(documentId);
    if (!document) throw new RecordNotFoundError('document', documentId);
    const user = authUserOf(actor);
    if (!this.canViewDocument(user, document)) throw new ForbiddenDomainActionError('document.access');
    return document;
  }

  recordDocumentDownload(actor: ActorContext, documentId: string): DocumentDownloadTicket {
    const document = this.getDocument(actor, documentId);
    const token = `${document.id.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    this.data.documentTokens.set(token, {documentId, expiresAt});

    this.recordAudit('document.downloaded', actor, {
      type: 'document',
      id: document.id,
      reference: document.code,
      organizationId: 'org_karvan',
    });

    return {
      documentId: document.id,
      downloadToken: token,
      expiresAt,
      expiresInSeconds: 900,
    };
  }

  resolveDocumentToken(token: string): {documentId: string} | null {
    const entry = this.data.documentTokens.get(token);
    if (!entry) return null;
    if (isPast(entry.expiresAt, nowIso())) {
      this.data.documentTokens.delete(token);
      return null;
    }
    return {documentId: entry.documentId};
  }

  // ---- Notifications ----

  listNotifications(actor: ActorContext): {items: NotificationRecord[]; unreadCount: number} {
    const items = [...this.data.notifications.values()]
      .filter((notification) => this.matchesAudience(actor, notification))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    return {items, unreadCount: items.filter((notification) => !notification.read).length};
  }

  markNotificationsRead(actor: ActorContext, ids?: readonly string[]): number {
    let marked = 0;
    for (const notification of this.data.notifications.values()) {
      if (!this.matchesAudience(actor, notification) || notification.read) continue;
      if (ids && !ids.includes(notification.id)) continue;
      notification.read = true;
      marked += 1;
    }
    return marked;
  }

  // ---- Inquiries ----

  createInquiry(input: CreateInquiryInput): ContactInquiryRecord {
    const inquiry: ContactInquiryRecord = {
      id: `inq_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      receivedAt: nowIso(),
      name: input.name,
      email: input.email,
      company: input.company,
      phone: input.phone && input.phone.length > 0 ? input.phone : undefined,
      topic: input.topic,
      subject: input.subject,
      message: input.message,
      consent: input.consent,
      status: 'new',
    };
    this.data.inquiries.set(inquiry.id, inquiry);

    this.recordAudit('inquiry.received', {userId: `external_${slugToken(input.name)}`, role: 'visitor', organizationId: ''}, {
      type: 'inquiry',
      id: inquiry.id,
      organizationId: 'org_karvan',
    });
    this.notify({
      recipientOrganizationId: 'org_karvan',
      area: 'crm',
      template: 'inquiryReceived',
      params: {name: inquiry.name},
    });
    return inquiry;
  }

  listInquiries(actor: ActorContext): ContactInquiryRecord[] {
    const user = authUserOf(actor);
    if (!STAFF_RFQ_ROLES.has(user.role)) throw new ForbiddenDomainActionError('inquiry.list');
    return [...this.data.inquiries.values()].sort((left, right) => right.receivedAt.localeCompare(left.receivedAt));
  }

  // ---- Tracking ----

  trackRequest(reference: string, email?: string): TrackResult {
    this.runSweep();
    const needle = reference.trim().toUpperCase();

    const rfq = [...this.data.rfqs.values()].find((record) => record.reference.toUpperCase() === needle);
    if (rfq) {
      if (email && !this.emailMatches(email, rfq.contact.email, rfq.buyerOrganizationId)) {
        throw new RecordNotFoundError('track', reference);
      }
      const buyerOrganization = this.data.organizations.get(rfq.buyerOrganizationId);
      return {
        kind: 'rfq',
        reference: rfq.reference,
        status: rfq.status,
        lastUpdate: rfq.updatedAt,
        buyerOrganizationId: rfq.buyerOrganizationId,
        buyerName: buyerOrganization?.name.en ?? rfq.company.name,
        commodity: {fa: rfq.lines[0]?.description ?? '', en: rfq.lines[0]?.description ?? ''},
        incoterm: rfq.incoterm,
      };
    }

    const quote = [...this.data.quotes.values()].find((record) => record.quoteNumber.toUpperCase() === needle);
    if (quote) {
      if (email && !this.emailMatches(email, undefined, quote.buyerOrganizationId)) {
        throw new RecordNotFoundError('track', reference);
      }
      const rfqOfQuote = this.data.rfqs.get(quote.rfqId);
      return {
        kind: 'quote',
        reference: quote.quoteNumber,
        status: quote.status,
        lastUpdate: quote.updatedAt,
        buyerOrganizationId: quote.buyerOrganizationId,
        buyerName: this.data.organizations.get(quote.buyerOrganizationId)?.name.en ?? '',
        commodity: {fa: rfqOfQuote?.lines[0]?.description ?? '', en: rfqOfQuote?.lines[0]?.description ?? ''},
        incoterm: quote.incoterm,
      };
    }

    const tradeCase = [...this.data.tradeCases.values()].find((record) => record.reference.toUpperCase() === needle);
    if (tradeCase) {
      if (email && !this.emailMatches(email, undefined, tradeCase.buyerOrganizationId)) {
        throw new RecordNotFoundError('track', reference);
      }
      return {
        kind: 'trade_case',
        reference: tradeCase.reference,
        status: tradeCase.status,
        currentMilestone: tradeCase.currentMilestone,
        lastUpdate: tradeCase.updatedAt,
        buyerOrganizationId: tradeCase.buyerOrganizationId,
        buyerName: this.data.organizations.get(tradeCase.buyerOrganizationId)?.name.en ?? '',
        commodity: tradeCase.commodity,
      };
    }

    throw new RecordNotFoundError('track', reference);
  }

  // ---- Sweep and audit ----

  runSweep(): SweepSummary {
    const now = nowIso();
    const summary: SweepSummary = {expiredRfqs: 0, expiredQuotes: 0};
    const sweeper: ActorContext = {userId: 'system_sweep', role: 'admin', organizationId: 'org_karvan'};

    for (const rfq of this.data.rfqs.values()) {
      if (rfq.status === 'needs_information' && isPast(rfq.slaDeadline, now)) {
        assertRfqTransition('needs_information', 'expired');
        rfq.status = 'expired';
        rfq.version += 1;
        rfq.updatedAt = now;
        summary.expiredRfqs += 1;
        this.recordAudit(
          'rfq.status_changed',
          sweeper,
          {type: 'rfq', id: rfq.id, reference: rfq.reference, organizationId: 'org_karvan'},
          {action: 'EXPIRE_RFQ', fromStatus: 'needs_information', toStatus: 'expired'},
        );
      }
    }

    for (const quote of this.data.quotes.values()) {
      if (quote.status === 'sent' && isPast(quote.validUntil, now)) {
        assertQuoteTransition('sent', 'expired');
        quote.status = 'expired';
        quote.version += 1;
        quote.updatedAt = now;
        summary.expiredQuotes += 1;
        this.recordAudit('quote.expired', sweeper, {
          type: 'quote',
          id: quote.id,
          reference: quote.quoteNumber,
          organizationId: 'org_karvan',
        }, {action: 'EXPIRE_QUOTE', toStatus: 'expired'});
      }
    }

    return summary;
  }

  getAuditEvents(
    actor: ActorContext,
    filter: {type?: AuditEventType; resourceType?: string} = {},
  ): AuditEvent[] {
    const user = authUserOf(actor);
    if (!STAFF_RFQ_ROLES.has(user.role)) throw new ForbiddenDomainActionError('audit.list');
    return [...this.data.auditEvents]
      .filter((event) => (filter.type ? event.type === filter.type : true))
      .filter((event) => (filter.resourceType ? event.resource.type === filter.resourceType : true))
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  }

  // ---- internals ----

  private requireQuote(quoteId: string): QuoteRecord {
    const quote = this.data.quotes.get(quoteId);
    if (!quote) throw new RecordNotFoundError('quote', quoteId);
    return quote;
  }

  private canViewRfq(user: AuthUser, rfq: RfqRecord): boolean {
    switch (user.role) {
      case 'trade_manager':
      case 'admin':
        return true;
      case 'sales_rep':
        return rfq.assignedToUserId === user.id || (rfq.assignedToUserId === null && rfq.status !== 'draft');
      case 'buyer':
        return rfq.buyerOrganizationId === user.organizationId;
      case 'procurement':
      case 'logistics':
      case 'finance':
        return rfq.status !== 'draft' && rfq.sellerOrganizationId === user.organizationId;
      default:
        return false;
    }
  }

  private canViewQuote(user: AuthUser, quote: QuoteRecord): boolean {
    switch (user.role) {
      case 'sales_rep':
      case 'trade_manager':
      case 'procurement':
      case 'logistics':
      case 'finance':
      case 'admin':
        return true;
      case 'buyer':
        return (
          quote.buyerOrganizationId === user.organizationId
          && quote.status !== 'draft'
          && quote.status !== 'internal_review'
        );
      default:
        return false;
    }
  }

  private canViewTradeCase(user: AuthUser, record: TradeCaseRecord): boolean {
    if (user.role === 'admin') return true;
    if (user.role === 'buyer') return record.buyerOrganizationId === user.organizationId;
    const sellerStaff
      = STAFF_RFQ_ROLES.has(user.role) || user.role === 'logistics' || user.role === 'finance';
    return sellerStaff && record.sellerOrganizationId === user.organizationId;
  }

  private canViewDocument(user: AuthUser, document: TradeDocumentRecord): boolean {
    if (STAFF_RFQ_ROLES.has(user.role) || user.role === 'logistics' || user.role === 'finance') {
      return user.organizationId === 'org_karvan';
    }
    if (user.role === 'buyer') return document.buyerOrganizationId === user.organizationId;
    return false;
  }

  private matchesAudience(actor: ActorContext, notification: NotificationRecord): boolean {
    if (notification.recipientUserId && notification.recipientUserId !== actor.userId) return false;
    if (notification.recipientOrganizationId !== actor.organizationId) return false;
    const staffArea: boolean = actor.role !== 'buyer' && actor.role !== 'visitor';
    return notification.area === (staffArea ? 'crm' : 'portal');
  }

  private emailMatches(email: string, rfqContactEmail: string | undefined, buyerOrganizationId: string): boolean {
    const needle = email.trim().toLowerCase();
    const organization = this.data.organizations.get(buyerOrganizationId);
    const candidates = [rfqContactEmail, organization?.contactEmail].filter(
      (candidate): candidate is string => Boolean(candidate),
    );
    return candidates.some((candidate) => candidate.toLowerCase() === needle);
  }

  private assertRfqTransitionPermission(actor: ActorContext, rfq: RfqRecord, action: string): void {
    const user = authUserOf(actor);
    const buyerActions = new Set(['CANCEL_RFQ', 'PROVIDE_INFO', 'SUBMIT_RFQ']);
    if (user.role === 'buyer') {
      if (!buyerActions.has(action) || rfq.buyerOrganizationId !== user.organizationId) {
        throw new ForbiddenDomainActionError(`rfq.${action.toLowerCase()}`);
      }
      return;
    }
    if (!STAFF_RFQ_ROLES.has(user.role)) {
      throw new ForbiddenDomainActionError(`rfq.${action.toLowerCase()}`);
    }
    if (user.role === 'sales_rep') {
      const isOwner = rfq.assignedToUserId === user.id;
      const isFreshLead = rfq.assignedToUserId === null;
      if (!isOwner && !isFreshLead) {
        throw new ForbiddenDomainActionError(`rfq.${action.toLowerCase()}`);
      }
    }
  }

  private recordAudit(
    type: AuditEventType,
    actor: ActorContext,
    resource: {type: 'rfq' | 'quote' | 'trade_case' | 'document' | 'inquiry' | 'user'; id: string; reference?: string; organizationId?: string},
    extra: {action?: string; fromStatus?: string; toStatus?: string} = {},
  ): void {
    const event = buildRedactedAuditRecord({
      type,
      actor: {id: actor.userId, role: actor.role, organizationId: actor.organizationId},
      resource,
      action: extra.action,
      fromStatus: extra.fromStatus,
      toStatus: extra.toStatus,
    });
    this.data.auditEvents.push(event);
  }

  private notify(input: NotificationInput): void {
    const notification: NotificationRecord = {
      id: `notif_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      recipientOrganizationId: input.recipientOrganizationId,
      recipientUserId: input.recipientUserId ?? null,
      area: input.area,
      template: input.template,
      params: input.params,
      createdAt: nowIso(),
      read: false,
    };
    this.data.notifications.set(notification.id, notification);
  }
}

function actionForTransition(from: RfqStatus, to: RfqStatus): string {
  const table: Record<string, string> = {
    'draft>submitted': 'SUBMIT_RFQ',
    'submitted>under_review': 'ASSIGN_LEAD',
    'submitted>rejected': 'REJECT_LEAD',
    'submitted>cancelled': 'CANCEL_RFQ',
    'under_review>needs_information': 'REQUEST_INFO',
    'under_review>qualified': 'QUALIFY_RFQ',
    'under_review>rejected': 'REJECT_RFQ',
    'under_review>cancelled': 'CANCEL_RFQ',
    'needs_information>under_review': 'PROVIDE_INFO',
    'needs_information>expired': 'EXPIRE_RFQ',
    'needs_information>cancelled': 'CANCEL_RFQ',
    'qualified>quote_preparation': 'START_PRICING',
    'qualified>rejected': 'REJECT_RFQ',
    'qualified>cancelled': 'CANCEL_RFQ',
    'quote_preparation>quoted': 'DISPATCH_QUOTE',
    'quote_preparation>rejected': 'REJECT_RFQ',
    'quote_preparation>cancelled': 'CANCEL_RFQ',
    'quoted>accepted': 'ACCEPT_DEAL',
    'quoted>quote_preparation': 'REQUEST_REVISION',
    'quoted>rejected': 'REJECT_RFQ',
    'quoted>expired': 'EXPIRE_RFQ',
    'quoted>cancelled': 'CANCEL_RFQ',
  };
  const action = table[`${from}>${to}`];
  // assertRfqTransition runs before this helper, so an unknown pair is impossible.
  if (action === undefined) {
    throw new Error(`No action mapped for RFQ transition ${from} to ${to}.`);
  }
  return action;
}

function quoteEntityOf(quote: QuoteRecord) {
  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    status: quote.status,
    rfqId: quote.rfqId,
    sellerOrganizationId: quote.sellerOrganizationId,
    buyerOrganizationId: quote.buyerOrganizationId,
    createdById: quote.createdById,
    assignedToUserId: quote.assignedToUserId,
    createdAt: quote.createdAt,
  };
}

function nameSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function slugToken(name: string): string {
  return nameSlug(name).replace(/_/g, '') || 'contact';
}

function actorFromInput(input: CreateRfqInput): ActorContext {
  return {
    userId: `external_${slugToken(input.contact.name)}`,
    role: 'visitor',
    organizationId: '',
  };
}

export function createFreshStore(): Store {
  return new Store(createSeedData());
}

const STORE_KEY = '__karvan_store__';

interface StoreGlobal {
  [STORE_KEY]?: Store;
}

export function getStore(): Store {
  const globalRef = globalThis as typeof globalThis & StoreGlobal;
  const existing = globalRef[STORE_KEY];
  if (existing) return existing;
  const store = createFreshStore();
  globalRef[STORE_KEY] = store;
  return store;
}

export type {
  ActorContext,
  QuoteSnapshot,
  RfqRecord,
  QuoteRecord,
  TradeCaseRecord,
  TradeDocumentRecord,
  NotificationRecord,
  ContactInquiryRecord,
  ProductRecord,
  Organization,
  UserRecord,
  AuditEvent,
  StoreData,
};
