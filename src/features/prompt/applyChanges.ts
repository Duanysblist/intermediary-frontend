import type { Resource } from '../../api/resources'
import { toInput, type PlanItem, type PlanItemInput } from '../../types'
import type { Change, PlanItemFields } from './changeSet'
import type { AppliedEntry } from './appliedBatches'

// Plain functions, no React: the review and revert screens call these, and the tests pass in a fake API.

/** The plan-item calls this module needs. The real API and the demo store both satisfy it. */
export type PlanItemApi = Pick<Resource<PlanItem, PlanItemInput>, 'get' | 'create' | 'update' | 'remove'>

export type Outcome = { ok: true } | { ok: false; error: string }

function patchFor(current: PlanItem, f: PlanItemFields): PlanItemInput {
    const next = toInput(current)
    if (f.title) next.title = f.title
    if (f.intent) next.intent = f.intent
    if (f.status) next.status = f.status
    if (f.targetDate !== undefined) next.targetDate = f.targetDate
    if (f.notes !== undefined) next.notes = f.notes
    return next
}

/** The current values of just the fields a change names, so revert can put back only those. */
function snapshotOf(current: PlanItem, f: PlanItemFields): Partial<PlanItemInput> {
    const now = toInput(current) as Record<string, unknown>
    const before: Record<string, unknown> = {}
    for (const key of Object.keys(f)) before[key] = now[key]
    return before as Partial<PlanItemInput>
}

/**
 * Applies the changes at `indexes`, in order. A failure (including an update whose plan item is no
 * longer there) is recorded against its change and the rest still run. `lookup` gives the current
 * item for an update; `onResult` reports each outcome as it lands.
 */
export async function applyChanges(
    api: PlanItemApi,
    changes: Change[],
    indexes: number[],
    lookup: (id: number) => PlanItem | undefined,
    onResult?: (index: number, outcome: Outcome) => void,
): Promise<{ results: (Outcome | null)[]; entries: AppliedEntry[] }> {
    const results: (Outcome | null)[] = changes.map(() => null)
    const entries: AppliedEntry[] = []
    for (const i of indexes) {
        const ch = changes[i]
        try {
            if (ch.op === 'create') {
                const created = await api.create({
                    title: ch.fields.title ?? 'Untitled',
                    intent: ch.fields.intent ?? 'OTHER',
                    status: ch.fields.status ?? 'PLANNED',
                    targetDate: ch.fields.targetDate ?? null,
                    referenceEntityType: null,
                    referenceEntityId: null,
                    recurringPlanId: null,
                    notes: ch.fields.notes ?? null,
                })
                entries.push({ op: 'create', id: created.id, title: created.title })
            } else {
                const current = lookup(ch.id!)
                if (!current) throw new Error(`Plan item #${ch.id} no longer exists.`)
                await api.update(ch.id!, patchFor(current, ch.fields))
                entries.push({ op: 'update', id: ch.id!, title: current.title, before: snapshotOf(current, ch.fields) })
            }
            results[i] = { ok: true }
        } catch (err) {
            results[i] = { ok: false, error: err instanceof Error ? err.message : 'Failed' }
        }
        onResult?.(i, results[i]!)
    }
    return { results, entries }
}

/** The changes whose outcome is a failure, in their original order. A partly applied proposal re-files these. */
export function failedChanges(changes: Change[], outcomes: (Outcome | null)[]): Change[] {
    return changes.filter((_, i) => outcomes[i]?.ok === false)
}

/**
 * Undoes a batch, newest entry first. A created item is deleted. An update writes its touched fields
 * back onto the item's current record, so edits made since to other fields survive. Returns one
 * message per entry that could not be reverted.
 */
export async function revertEntries(api: PlanItemApi, entries: AppliedEntry[]): Promise<string[]> {
    const failures: string[] = []
    for (const entry of [...entries].reverse()) {
        try {
            if (entry.op === 'create') {
                await api.remove(entry.id)
            } else {
                const current = await api.get(entry.id)
                await api.update(entry.id, { ...toInput(current), ...entry.before })
            }
        } catch (err) {
            failures.push(`${entry.title}: ${err instanceof Error ? err.message : 'failed'}`)
        }
    }
    return failures
}
