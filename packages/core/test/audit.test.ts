import { describe, expect, it } from 'vitest';
import {
  AUDIT_EVENT_TYPES,
  REDACTED_MARKER,
  SENSITIVE_KEY_PATTERNS,
  buildRedactedAuditRecord,
  redactSensitiveData,
  verifyAuditEventIntegrity,
} from '../src';
import type { CreateAuditEventInput } from '../src';

const REPRESENTATIVE_KEYS: ReadonlyArray<readonly [RegExp, string]> = [
  [/password/i, 'password'],
  [/passwd/i, 'passwd'],
  [/secret/i, 'clientSecret'],
  [/token/i, 'accessToken'],
  [/authorization/i, 'Authorization'],
  [/bearer/i, 'bearer'],
  [/credit[-_ ]?card/i, 'credit-card'],
  [/card[-_ ]?number/i, 'card_number'],
  [/cvv/i, 'cvv'],
  [/cvc/i, 'cvc'],
  [/tax[-_ ]?(number|id)/i, 'taxNumber'],
  [/national[-_ ]?id/i, 'nationalId'],
  [/ssn/i, 'ssn'],
  [/api[-_ ]?key/i, 'apiKey'],
  [/cookie/i, 'cookie'],
  [/session[-_ ]?id/i, 'sessionId'],
  [/iban/i, 'iban'],
  [/private[-_ ]?key/i, 'privateKey'],
];

describe('Sensitive key patterns', () => {
  it('declares eighteen patterns covering the documented keys', () => {
    expect(SENSITIVE_KEY_PATTERNS).toHaveLength(18);
    for (const [pattern, key] of REPRESENTATIVE_KEYS) {
      expect(pattern.test(key)).toBe(true);
      expect(SENSITIVE_KEY_PATTERNS.some((candidate) => candidate.test(key))).toBe(true);
    }
  });
});

describe('redactSensitiveData', () => {
  it('redacts nested sensitive keys deeply', () => {
    const redacted = redactSensitiveData({
      note: 'margin check passed',
      credentials: { apiKey: 'key-123', region: 'ae' },
      payment: { cardNumber: '4111 1111 1111 1111', holder: 'A. Karimi' },
      list: [{ token: 't-1' }, 'plain'],
    }) as Record<string, unknown>;
    expect(redacted.note).toBe('margin check passed');
    expect((redacted.credentials as Record<string, unknown>).apiKey).toBe(REDACTED_MARKER);
    expect((redacted.credentials as Record<string, unknown>).region).toBe('ae');
    expect((redacted.payment as Record<string, unknown>).cardNumber).toBe(REDACTED_MARKER);
    expect((redacted.payment as Record<string, unknown>).holder).toBe('A. Karimi');
    expect((redacted.list as unknown[])[0]).toEqual({ token: REDACTED_MARKER });
    expect((redacted.list as unknown[])[1]).toBe('plain');
  });

  it('scrubs Bearer tokens and JWT strings in values', () => {
    const redacted = redactSensitiveData({
      header: 'Authorization: Bearer abc.def.ghi123',
      session: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.sflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5c',
      prose: 'The quote was dispatched after review.',
    }) as Record<string, string>;
    expect(redacted.header).toBe('Authorization: Bearer [REDACTED]');
    expect(redacted.session).toBe(REDACTED_MARKER);
    expect(redacted.prose).toBe('The quote was dispatched after review.');
  });

  it('leaves non-string primitives and plain structures intact', () => {
    expect(redactSensitiveData(42)).toBe(42);
    expect(redactSensitiveData(null)).toBe(null);
    expect(redactSensitiveData(true)).toBe(true);
    expect(redactSensitiveData(['a', 1])).toEqual(['a', 1]);
    const at = new Date('2026-01-01T00:00:00.000Z');
    expect(redactSensitiveData(at)).toBe(at);
  });
});

describe('Audit event types', () => {
  it('declares every documented event type', () => {
    expect(AUDIT_EVENT_TYPES).toContain('rfq.created');
    expect(AUDIT_EVENT_TYPES).toContain('rfq.submitted');
    expect(AUDIT_EVENT_TYPES).toContain('rfq.assigned');
    expect(AUDIT_EVENT_TYPES).toContain('rfq.qualified');
    expect(AUDIT_EVENT_TYPES).toContain('rfq.rejected');
    expect(AUDIT_EVENT_TYPES).toContain('rfq.status_changed');
    expect(AUDIT_EVENT_TYPES).toContain('quote.created');
    expect(AUDIT_EVENT_TYPES).toContain('quote.approved');
    expect(AUDIT_EVENT_TYPES).toContain('quote.sent');
    expect(AUDIT_EVENT_TYPES).toContain('quote.accepted');
    expect(AUDIT_EVENT_TYPES).toContain('quote.revised');
    expect(AUDIT_EVENT_TYPES).toContain('quote.declined');
    expect(AUDIT_EVENT_TYPES).toContain('quote.expired');
    expect(AUDIT_EVENT_TYPES).toContain('trade_case.created');
    expect(AUDIT_EVENT_TYPES).toContain('trade_case.milestone_updated');
    expect(AUDIT_EVENT_TYPES).toContain('trade_case.completed');
    expect(AUDIT_EVENT_TYPES).toContain('document.downloaded');
    expect(AUDIT_EVENT_TYPES).toContain('inquiry.received');
    expect(AUDIT_EVENT_TYPES).toContain('permission.changed');
  });
});

describe('buildRedactedAuditRecord', () => {
  function auditInput(): CreateAuditEventInput {
    return {
      type: 'quote.approved',
      actor: { id: 'user_tm', role: 'trade_manager', organizationId: 'org_karvan', displayName: 'S. Farhadi' },
      resource: { type: 'quote', id: 'quote_1', reference: 'Q-1405-0001', organizationId: 'org_karvan' },
      action: 'APPROVE_QUOTE',
      fromStatus: 'internal_review',
      toStatus: 'approved',
      metadata: {
        password: 'hunter2',
        nested: { apiKey: 'key-123' },
        authorization: 'Bearer abc.def.ghi',
        jwt: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.sflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5c',
        note: 'approved after margin check',
      },
      occurredAt: '2026-01-20T10:00:00.000Z',
    };
  }

  it('builds an identified, redacted, checksummed record', () => {
    const event = buildRedactedAuditRecord(auditInput());
    expect(event.id).toMatch(/^audit_[0-9a-z]+_[0-9a-z]+$/);
    expect(event.type).toBe('quote.approved');
    expect(event.occurredAt).toBe('2026-01-20T10:00:00.000Z');
    expect(event.checksum).toMatch(/^[0-9a-f]{64}$/);
    expect(event.metadata?.password).toBe(REDACTED_MARKER);
    expect(event.metadata?.nested).toEqual({ apiKey: REDACTED_MARKER });
    expect(event.metadata?.authorization).toBe(REDACTED_MARKER);
    expect(event.metadata?.jwt).toBe(REDACTED_MARKER);
    expect(event.metadata?.note).toBe('approved after margin check');
    expect(event.actor.role).toBe('trade_manager');
    expect(Object.isFrozen(event)).toBe(true);
  });

  it('stamps the occurrence time when omitted', () => {
    const { occurredAt, ...input } = auditInput();
    const event = buildRedactedAuditRecord(input as CreateAuditEventInput);
    expect(event.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('passes integrity verification on the intact record', () => {
    const event = buildRedactedAuditRecord(auditInput());
    expect(verifyAuditEventIntegrity(event)).toBe(true);
    expect(verifyAuditEventIntegrity(buildRedactedAuditRecord(auditInput()))).toBe(true);
  });

  it('detects tampering with any field', () => {
    const event = buildRedactedAuditRecord(auditInput());
    expect(
      verifyAuditEventIntegrity({ ...event, metadata: { ...event.metadata, note: 'changed' } }),
    ).toBe(false);
    expect(verifyAuditEventIntegrity({ ...event, toStatus: 'sent' })).toBe(false);
    expect(verifyAuditEventIntegrity({ ...event, occurredAt: '2026-01-21T10:00:00.000Z' })).toBe(false);
    expect(verifyAuditEventIntegrity({ ...event, checksum: 'ff'.repeat(32) })).toBe(false);
  });

  it('rejects malformed events', () => {
    expect(verifyAuditEventIntegrity({} as never)).toBe(false);
    expect(verifyAuditEventIntegrity(null as never)).toBe(false);
  });
});
