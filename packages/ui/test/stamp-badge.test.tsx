import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CASE_STATUS_META, MILESTONE_META, QUOTE_STATUS_META, RFQ_STATUS_META } from '../src/meta';
import { StampBadge } from '../src/components/stamp-badge';

afterEach(cleanup);

describe('StampBadge', () => {
  it('carries the tone class from the meta entry', () => {
    render(<StampBadge status="qualified" label="واجد شرایط" meta={RFQ_STATUS_META.qualified} />);
    expect(screen.getByText('واجد شرایط').parentElement?.className).toContain('text-harbor');
  });

  it('maps seal statuses to the seal tone', () => {
    render(<StampBadge status="rejected" label="ردشده" meta={RFQ_STATUS_META.rejected} />);
    expect(screen.getByText('ردشده').parentElement?.className).toContain('text-seal');
  });

  it('maps harbor sent quotes to the harbor tone', () => {
    render(<StampBadge status="sent" label="ارسال‌شده به خریدار" meta={QUOTE_STATUS_META.sent} />);
    expect(screen.getByText('ارسال‌شده به خریدار').parentElement?.className).toContain('text-harbor');
  });

  it('maps the in-transit milestone to the observed tone', () => {
    render(<StampBadge status="in_transit" label="در حال حمل" meta={MILESTONE_META.in_transit} />);
    expect(screen.getByText('در حال حمل').parentElement?.className).toContain('text-observed');
  });

  it('maps completed trade cases to the clear tone', () => {
    render(<StampBadge status="completed" label="تکمیل‌شده" meta={CASE_STATUS_META.completed} />);
    expect(screen.getByText('تکمیل‌شده').parentElement?.className).toContain('text-clear');
  });

  it('falls back to ink-faint for unknown statuses', () => {
    render(<StampBadge status="mystery_state" label="نامشخص" />);
    expect(screen.getByText('نامشخص').parentElement?.className).toContain('text-ink-faint');
  });

  it('renders the uppercase mono Latin code beside the Persian label', () => {
    render(<StampBadge status="quote_preparation" label="در حال قیمت‌گذاری" meta={RFQ_STATUS_META.quote_preparation} />);
    expect(screen.getByText('QUOTE PREPARATION').className).toContain('font-mono');
    expect(screen.getByText('QUOTE PREPARATION').closest('bdi')).not.toBeNull();
  });

  it('holds the rubber-stamp rotation', () => {
    render(<StampBadge status="draft" label="پیش‌نویس" meta={RFQ_STATUS_META.draft} />);
    expect(screen.getByText('پیش‌نویس').parentElement?.className).toContain('-rotate-2');
  });

  it('applies the stamp-land animation when justApplied', () => {
    render(<StampBadge status="accepted" label="پذیرفته‌شده" meta={RFQ_STATUS_META.accepted} justApplied />);
    expect(screen.getByText('پذیرفته‌شده').parentElement?.className).toContain('kv-stamp-land');
  });

  it('does not animate by default', () => {
    render(<StampBadge status="accepted" label="پذیرفته‌شده" meta={RFQ_STATUS_META.accepted} />);
    expect(screen.getByText('پذیرفته‌شده').parentElement?.className).not.toContain('kv-stamp-land');
  });
});
