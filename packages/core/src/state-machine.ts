export interface StatusTransition<S extends string> {
  readonly from: S;
  readonly to: S;
  readonly action: string;
  readonly description: string;
}

export interface StatusMachine<S extends string> {
  readonly statuses: readonly S[];
  readonly statusSet: ReadonlySet<string>;
  readonly terminalStatuses: readonly S[];
  readonly transitions: readonly StatusTransition<S>[];
  readonly transitionsFrom: ReadonlyMap<S, readonly StatusTransition<S>[]>;
  allowedTransitionsFrom(status: S): readonly S[];
  canTransition(from: S, to: S): boolean;
}

export function defineStatusMachine<S extends string>(
  statuses: readonly S[],
  transitions: readonly StatusTransition<S>[],
): StatusMachine<S> {
  const statusSet = new Set<string>(statuses);
  const outgoing = new Map<S, StatusTransition<S>[]>();
  for (const status of statuses) outgoing.set(status, []);
  for (const transition of transitions) outgoing.get(transition.from)?.push(transition);
  const terminalStatuses = statuses.filter((status) => (outgoing.get(status)?.length ?? 0) === 0);

  return {
    statuses,
    statusSet,
    terminalStatuses,
    transitions,
    transitionsFrom: outgoing,
    allowedTransitionsFrom(status) {
      return (outgoing.get(status) ?? []).map((transition) => transition.to);
    },
    canTransition(from, to) {
      return (outgoing.get(from) ?? []).some((transition) => transition.to === to);
    },
  };
}
