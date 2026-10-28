import { Moon, Sun } from 'lucide-react';

import { toggleTheme } from '@/app/actions/theme';
import type { ThemeName } from '@/lib/theme';

interface ThemeToggleProps {
  theme: ThemeName;
  label: string;
}

export function ThemeToggle({ theme, label }: ThemeToggleProps) {
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <form action={toggleTheme}>
      <button
        type="submit"
        aria-label={label}
        title={label}
        className="inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-rule bg-sheet text-ink-soft shadow-register hover:bg-well hover:text-ink"
      >
        <Icon size={15} aria-hidden />
      </button>
    </form>
  );
}
