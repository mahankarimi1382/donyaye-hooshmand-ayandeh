import type {
  CaseChecklistItem,
  ContactPerson,
  CompanyProfile,
  CountryCode,
  DocumentClassification,
  DocumentType,
  Incoterm,
  QuoteLineItem,
  RfqLineItem,
  ShipmentMilestone,
  TradeCaseStatus,
} from '@karvan/contracts';
import type {AuditEvent, QuoteSnapshot, UserRole} from '@karvan/core';

export interface ActorContext {
  userId: string;
  role: UserRole;
  organizationId: string;
}

export type Bilingual = {readonly fa: string; readonly en: string};

export type OrgKind = 'seller' | 'buyer';

export interface Organization {
  id: string;
  kind: OrgKind;
  name: Bilingual;
  country: CountryCode;
  city: Bilingual;
  contactEmail: string;
  nameSlug: string;
}

export interface UserRecord {
  id: string;
  organizationId: string;
  role: UserRole;
  name: string;
  email: string;
  area: 'crm' | 'portal';
}

export interface ProductRecord {
  id: string;
  category: 'polymer' | 'fertilizer' | 'metals' | 'agri' | 'construction';
  name: Bilingual;
  hsCode: string;
  moqQuantity: string;
  moqUnit: 'metric_ton' | 'kg';
  unit: 'metric_ton' | 'kg';
  currency: 'USD';
  priceIndication: Bilingual;
  leadTimeDays: number;
  specs: Bilingual[];
  packaging: Bilingual;
  originPort: Bilingual;
  featured: boolean;
}

export interface RfqRecord {
  id: string;
  reference: string;
  status: import('@karvan/contracts').RfqStatus;
  version: number;
  buyerOrganizationId: string;
  sellerOrganizationId: string;
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  company: CompanyProfile;
  contact: ContactPerson;
  destinationCountry: CountryCode;
  destinationCity: string;
  incoterm: Incoterm;
  incotermNamedPlace?: string;
  targetDeliveryDate: string;
  lines: RfqLineItem[];
  notes?: string;
  question?: string;
  rejectionReason?: string;
}

export interface QuoteAcceptance {
  acceptedAt: string;
  signature: {name: string; companyRole: string; consentAccepted: true};
  poNumber: string;
}

export interface QuoteDeclineRecord {
  reason: import('@karvan/contracts').QuoteDeclineReason;
  comment?: string;
  declinedAt: string;
}

export interface QuoteRecord {
  id: string;
  quoteNumber: string;
  rfqId: string;
  status: import('@karvan/contracts').QuoteStatus;
  version: number;
  sellerOrganizationId: string;
  buyerOrganizationId: string;
  createdById: string;
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string;
  currency: import('@karvan/contracts').CurrencyCode;
  lines: QuoteLineItem[];
  shippingAmount: string;
  insuranceAmount: string;
  taxAmount: string;
  discountPercentage: number;
  subtotal: string;
  discountAmount: string;
  total: string;
  approvalRequired: boolean;
  incoterm: Incoterm;
  incotermNamedPlace?: string;
  paymentTerms: string;
  leadTimeDays: number;
  productionDays?: number;
  transitDays?: number;
  validUntil: string;
  notes?: string;
  revisionNotes?: string;
  approvalNote?: string;
  approvedByUserId?: string | null;
  dispatchedAt?: string;
  archivedAt?: string;
  supersededById?: string;
  snapshot?: QuoteSnapshot;
  acceptance?: QuoteAcceptance;
  decline?: QuoteDeclineRecord;
}

export interface CaseMilestoneRecord {
  milestone: ShipmentMilestone;
  completedAt: string;
  location?: string;
  vesselName?: string;
  billOfLading?: string;
  notes?: string;
}

export interface CaseChecklistState {
  done: boolean;
  updatedAt?: string;
  updatedByUserId?: string;
}

export interface TradeCaseRecord {
  id: string;
  reference: string;
  quoteId: string;
  rfqId: string;
  sellerOrganizationId: string;
  buyerOrganizationId: string;
  status: TradeCaseStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  currentMilestone: ShipmentMilestone;
  milestones: CaseMilestoneRecord[];
  checklist: Record<CaseChecklistItem, CaseChecklistState>;
  quoteChecksum: string;
  transportMode: 'sea' | 'air';
  vesselName?: string;
  billOfLading?: string;
  commodity: Bilingual;
}

export interface TradeDocumentRecord {
  id: string;
  code: string;
  type: DocumentType;
  classification: DocumentClassification;
  mimeType: string;
  sizeBytes: number;
  fileName: string;
  relatedEntityType: 'quote' | 'trade_case';
  relatedEntityId: string;
  buyerOrganizationId: string;
  verifiedChecksum: string;
  uploadedAt: string;
  uploadedByUserId: string;
}

export interface NotificationRecord {
  id: string;
  recipientOrganizationId: string;
  recipientUserId: string | null;
  area: 'crm' | 'portal';
  template: keyof import('@karvan/i18n').Dictionary['notifications'];
  params: Record<string, string>;
  createdAt: string;
  read: boolean;
}

export interface ContactInquiryRecord {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  topic: import('@karvan/contracts').InquiryTopic;
  subject: string;
  message: string;
  consent: true;
  status: 'new' | 'answered';
}

export interface IdempotentEntry {
  status: number;
  body: unknown;
}

export interface StoreCounters {
  rfq: number;
  quote: number;
  case: number;
}

export interface StoreData {
  organizations: Map<string, Organization>;
  users: Map<string, UserRecord>;
  products: Map<string, ProductRecord>;
  rfqs: Map<string, RfqRecord>;
  quotes: Map<string, QuoteRecord>;
  tradeCases: Map<string, TradeCaseRecord>;
  documents: Map<string, TradeDocumentRecord>;
  notifications: Map<string, NotificationRecord>;
  inquiries: Map<string, ContactInquiryRecord>;
  auditEvents: AuditEvent[];
  idempotency: Map<string, IdempotentEntry>;
  documentTokens: Map<string, {documentId: string; expiresAt: string}>;
  counters: StoreCounters;
}

export type {AuditEvent};
