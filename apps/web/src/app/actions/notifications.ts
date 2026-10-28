'use server';

import {revalidatePath} from 'next/cache';

import {actorFromSession, getEffectiveSession, type SessionArea} from '@/lib/session';
import {getStore} from '@/lib/store';

export async function markAllNotificationsRead(area: SessionArea): Promise<void> {
  const session = await getEffectiveSession(area);
  getStore().markNotificationsRead(actorFromSession(session));
  revalidatePath('/', 'layout');
}
