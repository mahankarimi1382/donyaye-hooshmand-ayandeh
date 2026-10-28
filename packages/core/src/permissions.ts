import type { QuoteStatus } from './quote-status';
import type { RfqStatus } from './rfq-status';

export const USER_ROLES = [
  'visitor',
  'buyer',
  'sales_rep',
  'trade_manager',
  'procurement',
  'logistics',
  'finance',
  'admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
}

export interface RfqEntity {
  id: string;
  reference: string;
  status: RfqStatus;
  buyerOrganizationId: string;
  sellerOrganizationId: string;
  assignedToUserId: string | null;
  createdAt: string;
}

export interface QuoteEntity {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  rfqId: string;
  sellerOrganizationId: string;
  buyerOrganizationId: string;
  createdById: string;
  assignedToUserId: string | null;
  createdAt: string;
}

export class ForbiddenDomainActionError extends Error {
  readonly code = 'forbidden_domain_action';
  readonly action: string;

  constructor(action: string, message?: string) {
    super(message ?? `Actor is not permitted to perform ${action}.`);
    this.name = 'ForbiddenDomainActionError';
    this.action = action;
  }
}

const STAFF_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  'sales_rep',
  'trade_manager',
  'procurement',
  'logistics',
  'finance',
  'admin',
]);

const QUOTE_CREATING_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  'sales_rep',
  'trade_manager',
  'admin',
]);

const QUOTE_APPROVING_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  'trade_manager',
  'finance',
  'admin',
]);

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

// buyer: tenant match only; sales_rep: own leads plus unassigned non-draft;
// trade_manager and admin: everything; procurement, logistics, finance:
// non-draft read-only.
export function canAccessRfq(user: AuthUser, rfq: RfqEntity): boolean {
  if (!user.isActive) return false;
  switch (user.role) {
    case 'trade_manager':
    case 'admin':
      return true;
    case 'sales_rep':
      if (rfq.assignedToUserId === user.id) return true;
      return rfq.assignedToUserId === null && rfq.status !== 'draft';
    case 'buyer':
      return rfq.buyerOrganizationId === user.organizationId;
    case 'procurement':
    case 'logistics':
    case 'finance':
      return rfq.status !== 'draft';
    default:
      return false;
  }
}

// buyer: tenant match and the quote must be past internal states; every staff
// role sees all quotes.
export function canAccessQuote(user: AuthUser, quote: QuoteEntity): boolean {
  if (!user.isActive) return false;
  if (STAFF_ROLES.has(user.role)) return true;
  if (user.role === 'buyer') {
    return (
      quote.buyerOrganizationId === user.organizationId
      && quote.status !== 'draft'
      && quote.status !== 'internal_review'
    );
  }
  return false;
}

export function canCreateQuote(user: AuthUser): boolean {
  if (!user.isActive) return false;
  return QUOTE_CREATING_ROLES.has(user.role);
}

export interface QuoteDispatchOptions {
  autoApprove?: boolean;
}

// Dispatch requires the approved status, or draft while the quote is below the
// approval thresholds. Managers and admins may dispatch any quote; a
// sales_rep only the quotes they created or own.
export function canDispatchQuote(user: AuthUser, quote: QuoteEntity, options?: QuoteDispatchOptions): boolean {
  if (!user.isActive) return false;
  const statusAllows = quote.status === 'approved' || (quote.status === 'draft' && (options?.autoApprove ?? false));
  if (!statusAllows) return false;
  if (user.role === 'trade_manager' || user.role === 'admin') return true;
  return (
    user.role === 'sales_rep'
    && (quote.createdById === user.id || quote.assignedToUserId === user.id)
  );
}

// Four-eyes: an approver may never approve their own quote; admin is exempt.
export function canApproveQuote(user: AuthUser, quote: QuoteEntity): boolean {
  if (!user.isActive) return false;
  if (user.role === 'admin') return true;
  if (!QUOTE_APPROVING_ROLES.has(user.role)) return false;
  return quote.createdById !== user.id;
}

export function canAcceptQuote(user: AuthUser, quote: QuoteEntity): boolean {
  if (!user.isActive) return false;
  if (quote.status !== 'sent') return false;
  if (user.role === 'admin') return true;
  return user.role === 'buyer' && quote.buyerOrganizationId === user.organizationId;
}

export function canDeclineQuote(user: AuthUser, quote: QuoteEntity): boolean {
  if (!user.isActive) return false;
  if (quote.status !== 'sent') return false;
  if (user.role === 'admin') return true;
  return user.role === 'buyer' && quote.buyerOrganizationId === user.organizationId;
}

export function assertCanAccessRfq(user: AuthUser, rfq: RfqEntity): void {
  if (!canAccessRfq(user, rfq)) throw new ForbiddenDomainActionError('rfq.access');
}

export function assertCanAccessQuote(user: AuthUser, quote: QuoteEntity): void {
  if (!canAccessQuote(user, quote)) throw new ForbiddenDomainActionError('quote.access');
}

export function assertCanCreateQuote(user: AuthUser): void {
  if (!canCreateQuote(user)) throw new ForbiddenDomainActionError('quote.create');
}

export function assertCanDispatchQuote(user: AuthUser, quote: QuoteEntity, options?: QuoteDispatchOptions): void {
  if (!canDispatchQuote(user, quote, options)) throw new ForbiddenDomainActionError('quote.dispatch');
}

export function assertCanApproveQuote(user: AuthUser, quote: QuoteEntity): void {
  if (!canApproveQuote(user, quote)) throw new ForbiddenDomainActionError('quote.approve');
}

export function assertCanAcceptQuote(user: AuthUser, quote: QuoteEntity): void {
  if (!canAcceptQuote(user, quote)) throw new ForbiddenDomainActionError('quote.accept');
}

export function assertCanDeclineQuote(user: AuthUser, quote: QuoteEntity): void {
  if (!canDeclineQuote(user, quote)) throw new ForbiddenDomainActionError('quote.decline');
}
