import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormField, Input, Select, Textarea } from '../src/components/form-field';

afterEach(cleanup);

describe('FormField', () => {
  it('associates the label with the control inside it', () => {
    render(
      <FormField label="کد کالا">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('کد کالا');
    expect(input.tagName).toBe('INPUT');
  });

  it('marks required fields with a screen-reader note', () => {
    render(
      <FormField label="کد کالا" required>
        <Input />
      </FormField>,
    );
    expect(screen.getByText('(required)')).toBeTruthy();
  });

  it('wires aria-invalid and role=alert when an error is present', () => {
    render(
      <FormField label="کد کالا" error="کد نامعتبر است">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('کد کالا');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('کد نامعتبر است');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
    expect(input.className).toContain('border-seal');
  });

  it('includes both hint and error ids in aria-describedby', () => {
    render(
      <FormField label="کد کالا" hint="ده رقم، بدون فاصله" error="کد نامعتبر است">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('کد کالا');
    const hintId = screen.getByText('ده رقم، بدون فاصله').id;
    const errorId = screen.getByRole('alert').id;
    expect(input.getAttribute('aria-describedby')).toBe(`${hintId} ${errorId}`);
  });

  it('leaves aria-invalid unset without an error', () => {
    render(
      <FormField label="کد کالا">
        <Input />
      </FormField>,
    );
    expect(screen.getByLabelText('کد کالا').getAttribute('aria-invalid')).toBeNull();
  });

  it('exposes Select and Textarea through the same wiring', () => {
    render(
      <FormField label="واحد شمارش">
        <Select>
          <option value="kg">کیلوگرم</option>
        </Select>
      </FormField>,
    );
    expect(screen.getByLabelText('واحد شمارش').tagName).toBe('SELECT');

    render(
      <FormField label="توضیحات">
        <Textarea />
      </FormField>,
    );
    expect(screen.getByLabelText('توضیحات').tagName).toBe('TEXTAREA');
  });
});
