'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Dictionary } from '@karvan/i18n';
import { Button, FormField, Input, Notice, Select, Textarea } from '@karvan/ui';

import { Link } from '@/i18n/navigation';

/*
 * Contact intake — fields mirror CreateInquirySchema (@karvan/contracts):
 * honeypot websiteUrlHp + literal-true consent. Client-side validation uses
 * dictionary messages; API error details are mapped back onto fields.
 */

const TOPICS = ['sales', 'procurement', 'logistics', 'compliance', 'partnership'] as const;
type Topic = (typeof TOPICS)[number];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

interface ContactFormProps {
  dictionary: Dictionary;
}

interface ApiErrorDetail {
  path: string;
  code: string;
  message: string;
}

const INITIAL = {
  name: '',
  email: '',
  company: '',
  phone: '',
  topic: '' as Topic | '',
  subject: '',
  message: '',
  websiteUrlHp: '',
  consent: false,
};

type FormValues = typeof INITIAL;
type FormErrors = Partial<Record<keyof FormValues | 'form', string>>;

export function ContactForm({ dictionary }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const labels = dictionary.contact.form;
    const messages = dictionary.contact.errors;
    if (values.name.trim().length < 2) {
      next.name = values.name.trim().length === 0 ? messages.required : messages.nameMin;
    }
    if (values.email.trim().length === 0) next.email = messages.required;
    else if (!EMAIL_PATTERN.test(values.email.trim())) next.email = messages.emailInvalid;
    if (values.phone.trim().length > 0 && !PHONE_PATTERN.test(values.phone.trim())) {
      next.phone = messages.phoneInvalid;
    }
    if (!values.topic) next.topic = messages.required;
    if (values.subject.trim().length < 4) {
      next.subject = values.subject.trim().length === 0 ? messages.required : messages.subjectMin;
    }
    if (values.message.trim().length < 20) {
      next.message = values.message.trim().length === 0 ? messages.required : messages.messageMin;
    }
    if (!values.consent) next.consent = messages.consentRequired;
    if (values.websiteUrlHp.trim().length > 0) next.form = messages.generic;
    return next;
  };

  const applyApiErrors = (details: readonly ApiErrorDetail[]) => {
    const next: FormErrors = {};
    const messages = dictionary.contact.errors;
    for (const detail of details) {
      const field = detail.path.split('.')[0] ?? detail.path;
      switch (field) {
        case 'name':
          next.name = detail.code === 'too_small' ? messages.nameMin : messages.required;
          break;
        case 'email':
          next.email = messages.emailInvalid;
          break;
        case 'phone':
          next.phone = messages.phoneInvalid;
          break;
        case 'subject':
          next.subject = detail.code === 'too_small' ? messages.subjectMin : messages.required;
          break;
        case 'message':
          next.message = detail.code === 'too_small' ? messages.messageMin : messages.required;
          break;
        case 'consent':
          next.consent = messages.consentRequired;
          break;
        case 'websiteUrlHp':
          next.form = messages.generic;
          break;
        default:
          next.form = messages.generic;
      }
    }
    if (!next.form && Object.keys(next).length === 0) next.form = messages.generic;
    setErrors(next);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const key = (idempotencyKeyRef.current ??= crypto.randomUUID());
      const response = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          ...(values.company.trim() ? { company: values.company.trim() } : {}),
          ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
          topic: values.topic,
          subject: values.subject.trim(),
          message: values.message.trim(),
          websiteUrlHp: values.websiteUrlHp,
          ...(values.consent ? { consent: true } : {}),
        }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (response.ok && body && typeof body === 'object' && 'data' in body) {
        const data = (body as { data: { id?: string } }).data;
        setReference(typeof data.id === 'string' ? data.id : '—');
      } else if (
        body
        && typeof body === 'object'
        && 'error' in body
        && body !== null
        && typeof (body as { error: unknown }).error === 'object'
        && body !== null
        && Array.isArray((body as { error: { details?: ApiErrorDetail[] } }).error.details)
      ) {
        applyApiErrors((body as { error: { details: ApiErrorDetail[] } }).error.details);
      } else {
        setErrors({ form: dictionary.contact.errors.generic });
      }
    } catch {
      setErrors({ form: dictionary.contact.errors.generic });
    } finally {
      setSubmitting(false);
    }
  };

  if (reference !== null) {
    return (
      <div className="flex flex-col gap-4">
        <Notice variant="success" tag={dictionary.contact.success.referenceLabel}>
          <span className="block">
            <bdi className="font-mono text-base text-ink">{reference}</bdi>
          </span>
        </Notice>
        <p className="text-sm leading-7 text-ink-soft">
          <span className="font-medium text-ink">{dictionary.contact.success.title}</span>{' '}
          {dictionary.contact.success.description}
        </p>
      </div>
    );
  }

  const labels = dictionary.contact.form;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {errors.form && (
        <Notice variant="danger" role="alert">
          {errors.form}
        </Notice>
      )}

      {/* honeypot — hidden from humans, present for bots */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="kv-contact-hp">{labels.honeypot}</label>
        <input
          id="kv-contact-hp"
          name="websiteUrlHp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.websiteUrlHp}
          onChange={(event) => set('websiteUrlHp', event.target.value)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label={labels.name} required error={errors.name}>
          <Input
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => set('name', event.target.value)}
          />
        </FormField>
        <FormField label={labels.email} required error={errors.email}>
          <Input
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={values.email}
            onChange={(event) => set('email', event.target.value)}
          />
        </FormField>
        <FormField label={labels.company} error={errors.company}>
          <Input
            name="company"
            autoComplete="organization"
            value={values.company}
            onChange={(event) => set('company', event.target.value)}
          />
        </FormField>
        <FormField
          label={labels.phone}
          error={errors.phone}
          hint={dictionary.common.actions.optional}
        >
          <Input
            name="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="+971501234567"
            value={values.phone}
            onChange={(event) => set('phone', event.target.value)}
          />
        </FormField>
        <FormField label={labels.topic} required error={errors.topic}>
          <Select
            name="topic"
            value={values.topic}
            onChange={(event) => set('topic', event.target.value as Topic | '')}
          >
            <option value="" disabled>
              {dictionary.contact.topicsPlaceholder}
            </option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {dictionary.contact.topics[topic]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={labels.subject} required error={errors.subject}>
          <Input
            name="subject"
            value={values.subject}
            onChange={(event) => set('subject', event.target.value)}
          />
        </FormField>
      </div>

      <FormField label={labels.message} required error={errors.message}>
        <Textarea
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => set('message', event.target.value)}
        />
      </FormField>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="kv-contact-consent" className="flex items-start gap-2 text-sm text-ink">
          <input
            id="kv-contact-consent"
            name="consent"
            type="checkbox"
            className="mt-1.5 size-4 accent-harbor"
            checked={values.consent}
            onChange={(event) => set('consent', event.target.checked)}
          />
          <span>
            {labels.consent} (
            <Link href="/terms" className="text-harbor hover:text-harbor-deep">
              {dictionary.footer.legal.terms}
            </Link>
            {' / '}
            <Link href="/privacy" className="text-harbor hover:text-harbor-deep">
              {dictionary.footer.legal.privacy}
            </Link>
            )
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="font-mono text-[13px] text-seal">
            {errors.consent}
          </p>
        )}
      </div>

      <div>
        <Button
          type="submit"
          variant="harbor"
          size="lg"
          isLoading={submitting}
          className="rounded-full shadow-terracotta px-8 py-3.5 text-sm font-bold hover:bg-primary-container transition-all"
        >
          {submitting ? dictionary.common.actions.loading : labels.submit}
        </Button>
      </div>
    </form>
  );
}
