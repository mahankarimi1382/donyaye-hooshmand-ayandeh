'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import { Button, FormField, Input, Notice, Select, Textarea } from '@karvan/ui';

import { postJson } from '../../_components/api-client';
import { MutationErrorNotice } from '../../_components/mutation-feedback';

/*
 * Milestone advance form: forward-only options come from the core machine
 * (canAdvanceMilestone); every POST carries the Idempotency-Key and the
 * rendered expectedVersion, with the shared 409 refresh affordance.
 */

export interface MilestoneOption {
  value: string;
  label: string;
}

export interface MilestonePanelLabels {
  milestoneTarget: string;
  milestoneTargetHint: string;
  recordMilestone: string;
  milestonesComplete: string;
  location: string;
  vessel: string;
  billOfLading: string;
  notes: string;
  versionConflict: string;
  refresh: string;
  forbidden: string;
  sessionExpired: string;
  invalidTransition: string;
  genericError: string;
}

export function MilestonePanel({
  caseId,
  version,
  options,
  labels,
}: {
  caseId: string;
  version: number;
  options: readonly MilestoneOption[];
  labels: MilestonePanelLabels;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<string>(options[0]?.value ?? '');
  const [location, setLocation] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [billOfLading, setBillOfLading] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<{status: number; code: string; message: string} | null>(null);
  const [applied, setApplied] = useState(false);

  if (options.length === 0) {
    return (
      <p className="text-sm text-ink-soft" role="status">
        {labels.milestonesComplete}
      </p>
    );
  }

  const submit = async () => {
    if (target.length === 0) return;
    setPending(true);
    setFailure(null);
    setApplied(false);
    const result = await postJson<unknown>(`/api/v1/cases/${caseId}/milestone`, {
      targetMilestone: target,
      ...(location.trim().length > 0 ? {location: location.trim()} : {}),
      ...(vesselName.trim().length > 0 ? {vesselName: vesselName.trim()} : {}),
      ...(billOfLading.trim().length > 0 ? {billOfLading: billOfLading.trim()} : {}),
      ...(notes.trim().length > 0 ? {notes: notes.trim()} : {}),
      expectedVersion: version,
    });
    setPending(false);
    if (result.ok) {
      setApplied(true);
      setLocation('');
      setVesselName('');
      setBillOfLading('');
      setNotes('');
      router.refresh();
      return;
    }
    setFailure(result.failure);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label={labels.milestoneTarget} hint={labels.milestoneTargetHint} required>
          <Select value={target} onChange={(event) => setTarget(event.target.value)}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={labels.location}>
          <Input value={location} onChange={(event) => setLocation(event.target.value)} />
        </FormField>
        <FormField label={labels.vessel}>
          <Input value={vesselName} onChange={(event) => setVesselName(event.target.value)} />
        </FormField>
        <FormField label={labels.billOfLading}>
          <Input value={billOfLading} onChange={(event) => setBillOfLading(event.target.value)} />
        </FormField>
        <FormField label={labels.notes} className="md:col-span-2">
          <Textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </FormField>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="harbor" size="sm" isLoading={pending} onClick={() => void submit()}>
          {labels.recordMilestone}
        </Button>
        <p className="font-mono text-[11px] text-ink-faint">
          expectedVersion: <bdi>{version}</bdi>
        </p>
      </div>
      {applied && (
        <Notice variant="success" tag="OK">
          {labels.recordMilestone}
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
