export const THEME_COOKIE_NAME = 'kv_theme';

export type ThemeName = 'light' | 'dark';

export function normalizeTheme(value: string | undefined | null): ThemeName {
  return value === 'dark' ? 'dark' : 'light';
}
