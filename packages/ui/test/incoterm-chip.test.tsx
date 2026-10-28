import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { IncotermChip } from '../src/components/incoterm-chip';

afterEach(cleanup);

describe('IncotermChip', () => {
  it('isolates the mixed-direction content in a bdi element', () => {
    const { container } = render(<IncotermChip term="FOB" namedPlace="بندرعباس" />);
    const isolated = container.querySelector('bdi');
    expect(isolated).not.toBeNull();
    expect(isolated?.textContent).toBe('FOB / بندرعباس');
  });

  it('renders the term alone when no named place is given', () => {
    const { container } = render(<IncotermChip term="CIF" />);
    expect(container.querySelector('bdi')?.textContent).toBe('CIF');
  });

  it('tints known terms from the status palette', () => {
    const tints = [
      { term: 'FOB', signature: 'border-harbor' },
      { term: 'CIF', signature: 'border-clear' },
      { term: 'EXW', signature: 'border-ochre' },
      { term: 'DAP', signature: 'border-observed' },
      { term: 'CFR', signature: 'text-ink-soft' },
    ];
    for (const { term, signature } of tints) {
      const { unmount } = render(<IncotermChip term={term} />);
      expect(screen.getByText(term).parentElement?.className).toContain(signature);
      unmount();
    }
  });

  it('falls back to the default tint for other terms', () => {
    render(<IncotermChip term="FCA" namedPlace="تهران" />);
    expect(screen.getByText('FCA / تهران').parentElement?.className).toContain('border-rule');
  });
});
