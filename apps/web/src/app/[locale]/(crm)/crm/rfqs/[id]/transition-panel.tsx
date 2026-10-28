'use client';

import { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';

import { Button, FormField, Notice, StampBadge, Textarea } from '@karvan/ui';
import { RFQ_STATUS_META } from '@karvan/ui';
import type { RfqStatus } from '@karvan/core';

import { postJson } from '../../_components/api-client';
import { MutationErrorNotice } from '../../_components/mutation-feedback';
import { BUYER_SIDE_RFQ_ACTIONS } from '../../_components/rfq-console';
import type { RfqTransitionOption } from '../../_components/rfq-console';

/*
 * «کنترل وضعیت» — the RFQ state-machine console. For the current status the
 * server passes the legal transitions (core machine) with their dictionary
 * labels; each action opens an inline form. Reason is required for rejects,
 * a ≥20 char question for REQUEST_INFO; expectedVersion is always rendered
 * from the record and a 409 version_conflict offers a refresh.
 */

export interface TransitionPanelLabels {
  reasonLabel: string;
  reasonRequired: string;
  questionLabel: string;
  questionRequired: string;
  commentLabel: string;
  applyAction: string;
  actionApplied: string;
  buyerSideHint: string;
  quotePageLabel: string;
  cancelLabel: string;
  versionConflict: string;
  refresh: string;
  forbidden: string;
  sessionExpired: string;
  invalidTransition: string;
  genericError: string;
  status: string;
}

const REASON_ACTIONS: ReadonlySet<string> = new Set(['REJECT_LEAD', 'REJECT_RFQ']);

export function TransitionPanel({
  rfqId,
  version,
  status,
  statusLabel,
  options,
  actionLabels,
  quoteHref,
  labels,
}: {
  rfqId: string;
  version: number;
  status: RfqStatus;
  statusLabel: string;
  options: readonly RfqTransitionOption[];
  actionLabels: Record<string, string>;
  quoteHref: string;
  labels: TransitionPanelLabels;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<RfqTransitionOption | null>(null);
  const [pending, setPending] = useState(false);
  const [applied, setApplied] = useState(false);
  const [failure, setFailure] = useState<{status: number; code: string; message: string} | null>(null);
  const [reason, setReason] = useState('');
  const [question, setQuestion] = useState('');
  const [comment, setComment] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const closeForm = () => {
    setSelected(null);
    setReason('');
    setQuestion('');
    setComment('');
    setFieldError(null);
  };

  const submit = async () => {
    if (!selected) return;
    if (REASON_ACTIONS.has(selected.action) && reason.trim().length === 0) {
      setFieldError(labels.reasonRequired);
      return;
    }
    if (selected.action === 'REQUEST_INFO' && question.trim().length < 20) {
      setFieldError(labels.questionRequired);
      return;
    }

    setPending(true);
    setFailure(null);
    setApplied(false);
    const result = await postJson<unknown>(`/api/v1/rfqs/${rfqId}/transition`, {
      targetStatus: selected.to,
      ...(REASON_ACTIONS.has(selected.action) ? {reason: reason.trim()} : {}),
      ...(selected.action === 'REQUEST_INFO' ? {comment: question.trim()} : comment.trim().length > 0 ? {comment: comment.trim()} : {}),
      expectedVersion: version,
    });
    setPending(false);

    if (result.ok) {
      closeForm();
      setApplied(true);
      router.refresh();
      return;
    }
    setFailure(result.failure);
  };

  const requiresReason = selected !== null && REASON_ACTIONS.has(selected.action);
  const requiresQuestion = selected?.action === 'REQUEST_INFO';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <StampBadge status={status} label={statusLabel} meta={RFQ_STATUS_META[status]} />
        <span className="font-mono text-[11px] text-ink-faint">
          <bdi>{status.toUpperCase()}</bdi>
        </span>
      </div>

      {options.length === 0 ? (
        <p className="text-sm text-ink-soft">{labels.invalidTransition}</p>
      ) : (
        <div className="flex flex-wrap gap-2" role="group" aria-label={labels.status}>
          {options.map((option) => {
            const buyerSide = BUYER_SIDE_RFQ_ACTIONS.has(option.action);
            const active = selected?.action === option.action;
            if (option.action === 'DISPATCH_QUOTE') {
              return (
                <Link
                  key={option.action}
                  href={quoteHref}
                  className="inline-flex h-8 items-center justify-center rounded-[2px] border border-harbor bg-harbor px-3 text-sm font-medium text-sheet shadow-register transition-colors hover:bg-harbor-deep"
                >
                  {actionLabels[option.action] ?? option.action}
                </Link>
              );
            }
            return (
              <span key={option.action} title={buyerSide ? labels.buyerSideHint : undefined}>
                <Button
                  variant={active ? 'ink' : 'outline'}
                  size="sm"
                  disabled={buyerSide || pending}
                  aria-pressed={active}
                  onClick={() => {
                    if (active) {
                      closeForm();
                    } else {
                      setSelected(option);
                      setApplied(false);
                      setFailure(null);
                      setFieldError(null);
                    }
                  }}
                >
                  {actionLabels[option.action] ?? option.action}
                </Button>
              </span>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="flex flex-col gap-3 rounded-[2px] border border-rule bg-well p-4">
          <p className="font-mono text-[13px] text-ink-soft">
            <bdi>{selected.action}</bdi>
            {' → '}
            <bdi>{selected.to.toUpperCase()}</bdi>
          </p>
          {requiresReason && (
            <FormField label={labels.reasonLabel} required error={fieldError ?? undefined}>
              <Textarea
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </FormField>
          )}
          {requiresQuestion && (
            <FormField label={labels.questionLabel} required error={fieldError ?? undefined}>
              <Textarea
                rows={3}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
            </FormField>
          )}
          {!requiresReason && !requiresQuestion && (
            <FormField label={labels.commentLabel}>
              <Textarea
                rows={2}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </FormField>
          )}
          <div className="flex items-center gap-2">
            <Button variant="harbor" size="sm" isLoading={pending} onClick={() => void submit()}>
              {labels.applyAction}
            </Button>
            <Button variant="ghost" size="sm" onClick={closeForm}>
              {labels.cancelLabel}
            </Button>
          </div>
          <p className="font-mono text-[11px] text-ink-faint">
            expectedVersion: <bdi>{version}</bdi>
          </p>
        </div>
      )}

      {applied && (
        <Notice variant="success" tag="OK">
          {labels.actionApplied}
        </Notice>
      )}
      {failure && (
        <MutationErrorNotice
          failure={failure}
          labels={{
            versionConflict: labels.versionConflict,
            forbidden: labels.forbidden,
            sessionExpired: labels.sessionExpired,
            invalidTransition: labels.invalidTransition,
            genericError: labels.genericError,
            refresh: labels.refresh,
          }}
          onRefresh={() => router.refresh()}
        />
      )}
    </div>
  );
}
