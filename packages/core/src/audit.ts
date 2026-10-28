import { canonicalJsonStringify, sha256 } from './hashing';
import type { UserRole } from './permissions';

// Event types enumerated in ARCHITECTURE 2.8.
export const AUDIT_EVENT_TYPES = [
  'rfq.created',
  'rfq.submitted',
  'rfq.assigned',
  'rfq.qualified',
  'rfq.rejected',
  'rfq.status_changed',
  'quote.created',
  'quote.approved',
  'quote.sent',
  'quote.accepted',
  'quote.revised',
  'quote.declined',
  'quote.expired',
  'trade_case.created',
  'trade_case.milestone_updated',
  'trade_case.completed',
  'document.downloaded',
  'inquiry.received',
  'permission.changed',
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export const AUDIT_EVENT_TYPE_SET: ReadonlySet<string> = new Set<string>(AUDIT_EVENT_TYPES);

export const REDACTED_MARKER = '[REDACTED]';

// Eighteen patterns; a record key matching any of them redacts the whole value.
export const SENSITIVE_KEY_PATTERNS: readonly RegExp[] = [
  /password/i,
  /passwd/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /bearer/i,
  /credit[-_ ]?card/i,
  /card[-_ ]?number/i,
  /cvv/i,
  /cvc/i,
  /tax[-_ ]?(number|id)/i,
  /national[-_ ]?id/i,
  /ssn/i,
  /api[-_ ]?key/i,
  /cookie/i,
  /session[-_ ]?id/i,
  /iban/i,
  /private[-_ ]?key/i,
];

const BEARER_TOKEN_PATTERN = /Bearer\s+\S+/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

export interface AuditActor {
  id: string;
  role: UserRole;
  organizationId: string;
  displayName?: string;
}

export interface AuditResource {
  type: 'rfq' | 'quote' | 'trade_case' | 'document' | 'inquiry' | 'user';
  id: string;
  reference?: string;
  organizationId?: string;
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actor: AuditActor;
  resource: AuditResource;
  action?: string;
  fromStatus?: string;
  toStatus?: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  checksum: string;
}

export interface CreateAuditEventInput {
  type: AuditEventType;
  actor: AuditActor;
  resource: AuditResource;
  action?: string;
  fromStatus?: string;
  toStatus?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function scrubSensitiveText(text: string): string {
  return text.replace(BEARER_TOKEN_PATTERN, `Bearer ${REDACTED_MARKER}`).replace(JWT_PATTERN, REDACTED_MARKER);
}

export function redactSensitiveData(value: unknown): unknown {
  if (typeof value === 'string') return scrubSensitiveText(value);
  if (Array.isArray(value)) return value.map((item) => redactSensitiveData(item));
  if (value !== null && typeof value === 'object' && isPlainObject(value)) {
    const redacted: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      redacted[key] = isSensitiveKey(key) ? REDACTED_MARKER : redactSensitiveData(item);
    }
    return redacted;
  }
  return value;
}

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function createAuditEventId(): string {
  let random = '';
  while (random.length < 8) random += Math.random().toString(36).slice(2);
  return `audit_${Date.now().toString(36)}_${random.slice(0, 8)}`;
}

function computeAuditChecksum(event: Omit<AuditEvent, 'checksum'>): string {
  return sha256(canonicalJsonStringify(event));
}

export function buildRedactedAuditRecord(input: CreateAuditEventInput): AuditEvent {
  const record: Omit<AuditEvent, 'checksum'> = {
    id: createAuditEventId(),
    type: input.type,
    actor: redactSensitiveData(input.actor) as AuditActor,
    resource: redactSensitiveData(input.resource) as AuditResource,
    action: input.action,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    metadata: input.metadata === undefined ? undefined : (redactSensitiveData(input.metadata) as Record<string, unknown>),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };
  const event: AuditEvent = { ...record, checksum: computeAuditChecksum(record) };
  return Object.freeze(event);
}

export function verifyAuditEventIntegrity(event: AuditEvent): boolean {
  if (event === null || typeof event !== 'object' || typeof event.checksum !== 'string') return false;
  const { checksum, ...payload } = event;
  return sha256(canonicalJsonStringify(payload)) === checksum;
}
