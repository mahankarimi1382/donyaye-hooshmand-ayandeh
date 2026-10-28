'use server';

import {revalidatePath} from 'next/cache';
import {cookies} from 'next/headers';

import {redirect} from '@/i18n/navigation';

import {
  SESSION_COOKIE_NAME,
  encodeSession,
  findDemoIdentity,
  sessionForIdentity,
  type SessionArea,
} from '@/lib/session';

export async function switchView(area: SessionArea, formData: FormData): Promise<void> {
  const key = String(formData.get('key') ?? '');
  const locale = String(formData.get('locale') ?? 'fa');
  const identity = findDemoIdentity(key);
  if (!identity || identity.area !== area) {
    return;
  }

  const payload = sessionForIdentity(identity);

  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, encodeSession(payload), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath('/', 'layout');
  redirect({href: area === 'crm' ? '/crm' : '/portal', locale});
}
