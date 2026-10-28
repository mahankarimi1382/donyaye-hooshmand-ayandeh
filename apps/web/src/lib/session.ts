import {createHmac, timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import {cache} from 'react';
import {redirect} from 'next/navigation';

import {getDictionary, type Dictionary} from '@karvan/i18n';

import {isUserRole, type UserRole} from '@karvan/core';

import type {ActorContext} from './types';

export const SESSION_COOKIE_NAME = 'kv_session';

export type {ActorContext};

export type SessionArea = 'crm' | 'portal';

export interface SessionPayload {
  userId: string;
  role: UserRole;
  organizationId: string;
  name: string;
  area: SessionArea;
}

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? 'karvan-demo-secret';
}

function signBody(body: string): string {
  return createHmac('sha256', sessionSecret()).update(body).digest('base64url');
}

export function encodeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${signBody(body)}`;
}

export function decodeSession(raw: string | undefined | null): SessionPayload | null {
  if (!raw) return null;
  const separatorIndex = raw.indexOf('.');
  if (separatorIndex <= 0) return null;
  const body = raw.slice(0, separatorIndex);
  const signature = raw.slice(separatorIndex + 1);
  const expected = signBody(body);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (parsed === null || typeof parsed !== 'object') return null;
    const candidate = parsed as Record<string, unknown>;
    if (
      typeof candidate.userId !== 'string'
      || typeof candidate.organizationId !== 'string'
      || typeof candidate.name !== 'string'
      || (candidate.area !== 'crm' && candidate.area !== 'portal')
      || !isUserRole(candidate.role)
    ) {
      return null;
    }
    return {
      userId: candidate.userId,
      role: candidate.role,
      organizationId: candidate.organizationId,
      name: candidate.name,
      area: candidate.area,
    };
  } catch {
    return null;
  }
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE_NAME)?.value);
});

export async function requireRole(...roles: readonly UserRole[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    redirect('/');
  }
  return session;
}

export async function requireArea(area: SessionArea): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.area !== area) {
    redirect('/');
  }
  return session;
}

export function actorFromSession(session: SessionPayload): ActorContext {
  return {
    userId: session.userId,
    role: session.role,
    organizationId: session.organizationId,
  };
}

export interface DemoIdentity {
  key: 'sales_rep' | 'trade_manager' | 'buyer';
  userId: string;
  role: UserRole;
  organizationId: string;
  area: SessionArea;
}

export const DEMO_IDENTITIES: readonly DemoIdentity[] = [
  {
    key: 'sales_rep',
    userId: 'usr_sales_rep_karvan',
    role: 'sales_rep',
    organizationId: 'org_karvan',
    area: 'crm',
  },
  {
    key: 'trade_manager',
    userId: 'usr_trade_manager_karvan',
    role: 'trade_manager',
    organizationId: 'org_karvan',
    area: 'crm',
  },
  {
    key: 'buyer',
    userId: 'usr_buyer_arya',
    role: 'buyer',
    organizationId: 'org_arya_polymer',
    area: 'portal',
  },
];

export const DEMO_IDENTITY_LABEL_KEYS = {
  sales_rep: 'salesRep',
  trade_manager: 'tradeManager',
  buyer: 'buyer',
} as const satisfies Record<DemoIdentity['key'], keyof Dictionary['session']['labels']>;

export function findDemoIdentity(key: string): DemoIdentity | null {
  return DEMO_IDENTITIES.find((identity) => identity.key === key) ?? null;
}

function demoSessionOf(identity: DemoIdentity): SessionPayload {
  const dictionary = getDictionary('fa');
  return {
    userId: identity.userId,
    role: identity.role,
    organizationId: identity.organizationId,
    name: dictionary.session.labels[DEMO_IDENTITY_LABEL_KEYS[identity.key]],
    area: identity.area,
  };
}

export function sessionForIdentity(identity: DemoIdentity): SessionPayload {
  return demoSessionOf(identity);
}

// Demo platform: an area without an explicit session falls back to its default
// identity (CRM: sales representative of the trading house, portal: seeded buyer).
export function demoSessionForArea(area: SessionArea): SessionPayload {
  const identity = DEMO_IDENTITIES.find((candidate) => candidate.area === area) ?? DEMO_IDENTITIES[0];
  return demoSessionOf(identity);
}

export async function getEffectiveSession(area: SessionArea): Promise<SessionPayload> {
  return (await getSession()) ?? demoSessionForArea(area);
}
