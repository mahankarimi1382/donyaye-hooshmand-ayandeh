import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Notice } from '../src/components/notice';

afterEach(cleanup);

describe('Notice', () => {
  it('uses role status for informational and success notices', () => {
    const { unmount } = render(<Notice variant="info" tag="یادداشت">زمان تحویل ۱۴ روز کاری است.</Notice>);
    expect(screen.getByRole('status')).toBeTruthy();
    unmount();
    render(<Notice variant="success" tag="تأیید">پیش‌فاکتور صادر شد.</Notice>);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('uses role alert for warning and danger notices', () => {
    const { unmount } = render(<Notice variant="warning" tag="هشدار">مهلت پاسخ در حال پایان است.</Notice>);
    expect(screen.getByRole('alert')).toBeTruthy();
    unmount();
    render(<Notice variant="danger" tag="ممنوع">اصلاحیه پس از ارسال مجاز نیست.</Notice>);
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('renders the mono tag and body text', () => {
    render(<Notice variant="info" tag="یادداشت">زمان تحویل ۱۴ روز کاری است.</Notice>);
    expect(screen.getByText('یادداشت').className).toContain('font-mono');
    expect(screen.getByText('زمان تحویل ۱۴ روز کاری است.')).toBeTruthy();
  });

  it('renders a dismiss control with a label', () => {
    const onDismiss = vi.fn();
    render(
      <Notice variant="info" tag="یادداشت" onDismiss={onDismiss}>
        زمان تحویل ۱۴ روز کاری است.
      </Notice>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'بستن' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
