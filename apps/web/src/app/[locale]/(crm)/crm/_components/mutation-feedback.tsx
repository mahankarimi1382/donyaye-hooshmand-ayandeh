'use client';

import { Button, Notice } from '@karvan/ui';
import type { ApiFailure } from './api-client';

/*
 * Shared Persian feedback for failed mutations. 409 version conflicts get a
 * refresh affordance because the rendered expectedVersion is stale; every
 * other envelope surfaces as a stamped notice with the failing code in mono.
 */

export interface MutationErrorLabels {
  versionConflict: string;
  forbidden: string;
  sessionExpired: string;
  invalidTransition: string;
  genericError: string;
  refresh: string;
}

export function MutationErrorNotice({
  failure,
  labels,
  onRefresh,
}: {
  failure: ApiFailure;
  labels: MutationErrorLabels;
  onRefresh?: () => void;
}) {
  const text = messageFor(failure, labels);
  return (
    <Notice variant={failure.status === 409 && failure.code === 'version_conflict' ? 'warning' : 'danger'} tag={failure.code}>
      <div className="flex flex-wrap items-center gap-3">
        <span>{text}</span>
        {failure.code === 'version_conflict' && onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onRefresh();
            }}
          >
            {labels.refresh}
          </Button>
        )}
      </div>
    </Notice>
  );
}

function messageFor(failure: ApiFailure, labels: MutationErrorLabels): string {
  if (failure.code === 'version_conflict') return labels.versionConflict;
  if (failure.status === 401) return labels.sessionExpired;
  if (failure.status === 403 || failure.code === 'forbidden') return labels.forbidden;
  if (failure.code === 'invalid_transition') return labels.invalidTransition;
  return labels.genericError;
}
