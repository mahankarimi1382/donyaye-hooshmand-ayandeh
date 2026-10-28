'use server';

import {cookies} from 'next/headers';
import {revalidatePath} from 'next/cache';

import {normalizeTheme, THEME_COOKIE_NAME} from '@/lib/theme';

export async function toggleTheme(): Promise<void> {
  const jar = await cookies();
  const current = normalizeTheme(jar.get(THEME_COOKIE_NAME)?.value);
  jar.set(THEME_COOKIE_NAME, current === 'dark' ? 'light' : 'dark', {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/', 'layout');
}
