import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { planItemsApi } from '../../api/resources'
import { PLAN_EVENTS_KEY, planItems } from '../../hooks/resources'
import { toInput } from '../plan/usePlanBoard'
import Pill from '../../components/ui/Pill'
import Button from '../../components/ui/Button'
import { formatDate } from '../../lib/format'
import { label, type PlanItem } from '../../types'
import type { Change, ChangeSet, PlanItemFields } from './changeSet'
import { recordBatch, type AppliedEntry } from './appliedBatches'

type Props = {
    source: string
    changeSet: ChangeSet
    onClose: () => void
    /** Called once after Apply finishes, e.g. to mark a server-side proposal as applied. */
    onApplied?: (applied: number, failed: number) => void
}

type Outcome = { ok: true } | { ok: false; error: string }

function describeField(key: keyof PlanItemFields, value: string | null | undefined): string {
    if (value === null) return key === 'targetDate' ? 'no date' : 'cleared'
    if (value === undefined) return '—'
    if (key === 'targetDate') return formatDate(value)
    if (key === 'status' || key === 'intent') return label(value)
    return value
}

const FIELD_LABEL: Record<keyof PlanItemFields, string> = { title: 'Title', intent: 'Intent', status: 'Status', targetDate: 'Target date', notes: 'Notes' }

/**
 * Shows each proposed change with its before/after, lets the user tick the ones to accept, then
 * applies them through the normal plan-item API so audit events are written as usual. What was
 * applied is remembered so the batch can be reverted from the Prompt page.
 */
export default function ReviewChanges({ source, changeSet, onClose, onApplied }: Props) {
    const qc = useQueryClient()
    const items = planItems.useList()
    const byId = useMemo(() => new Map((items.data ?? []).map((p) => [p.id, p])), [items.data])

    const [selected, setSelected] = useState<boolean[]>(() => changeSet.changes.map(() => true))
    const [outcomes, setOutcomes] = useState<(Outcome | null)[]>(() => changeSet.changes.map(() => null))
    const [applying, setApplying] = useState(false)
    const done = outcomes.some((o) => o !== null)

    async function apply() {
        setApplying(true)
        const results: (Outcome | null)[] = [...outcomes]
        const entries: AppliedEntry[] = []
        for (let i = 0; i < changeSet.changes.length; i++) {
            if (!selected[i] || results[i]?.ok) continue
            const ch = changeSet.changes[i]
            try {
                if (ch.op === 'create') {
                    const created = await planItemsApi.create({
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
                    const current = byId.get(ch.id!)
                    if (!current) throw new Error(`Plan item #${ch.id} no longer exists.`)
                    const before = toInput(current)
                    const next = { ...before }
                    if (ch.fields.title) next.title = ch.fields.title
                    if (ch.fields.intent) next.intent = ch.fields.intent
                    if (ch.fields.status) next.status = ch.fields.status
                    if (ch.fields.targetDate !== undefined) next.targetDate = ch.fields.targetDate
                    if (ch.fields.notes !== undefined) next.notes = ch.fields.notes
                    await planItemsApi.update(ch.id!, next)
                    entries.push({ op: 'update', id: ch.id!, title: current.title, before })
                }
                results[i] = { ok: true }
            } catch (err) {
                results[i] = { ok: false, error: err instanceof Error ? err.message : 'Failed' }
            }
            setOutcomes([...results])
        }
        setApplying(false)
        if (entries.length > 0) recordBatch({ source, summary: changeSet.summary, entries })
        qc.invalidateQueries({ queryKey: planItems.queryKey })
        qc.invalidateQueries({ queryKey: [PLAN_EVENTS_KEY] })
        onApplied?.(results.filter((r) => r?.ok).length, results.filter((r) => r && !r.ok).length)
    }

    const acceptedCount = selected.filter((s, i) => s && !outcomes[i]?.ok).length
    const appliedCount = outcomes.filter((o) => o?.ok).length

    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Review suggested changes</h2>
                    <p className="mt-0.5 text-xs text-gray-500">From {source}. Nothing is applied until you click Apply; applied batches can be reverted from the Prompt page.</p>
                </div>
                <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">✕</button>
            </div>

            {changeSet.summary && <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-gray-800">{changeSet.summary}</p>}

            {changeSet.changes.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">No changes were proposed.</p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {changeSet.changes.map((ch, i) => (
                        <ChangeRow
                            key={i}
                            change={ch}
                            current={ch.id != null ? byId.get(ch.id) : undefined}
                            checked={selected[i]}
                            outcome={outcomes[i]}
                            disabled={applying || outcomes[i]?.ok === true}
                            onToggle={(v) => setSelected((s) => s.map((x, j) => (j === i ? v : x)))}
                        />
                    ))}
                </ul>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                    {appliedCount > 0 ? `${appliedCount} applied · ` : ''}{acceptedCount} selected
                </span>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={onClose}>{done ? 'Close' : 'Cancel'}</Button>
                    <Button onClick={apply} disabled={applying || acceptedCount === 0}>
                        {applying ? 'Applying…' : `Apply ${acceptedCount} change${acceptedCount === 1 ? '' : 's'}`}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ChangeRow({ change, current, checked, outcome, disabled, onToggle }: {
    change: Change; current?: PlanItem; checked: boolean; outcome: Outcome | null; disabled: boolean; onToggle: (v: boolean) => void
}) {
    const fields = (Object.keys(change.fields) as (keyof PlanItemFields)[]).filter((k) => change.fields[k] !== undefined)
    const missing = change.op === 'update' && !current
    return (
        <li className={`rounded-lg border p-3 ${outcome?.ok ? 'border-green-200 bg-green-50/40' : outcome && !outcome.ok ? 'border-red-200 bg-red-50/40' : 'border-gray-200 bg-white'}`}>
            <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" checked={checked && !missing} disabled={disabled || missing} onChange={(e) => onToggle(e.target.checked)} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Pill value={change.op === 'create' ? 'CREATE' : 'UPDATE'} tone={change.op === 'create' ? 'green' : 'blue'} />
                        <span className="font-medium text-gray-900">
                            {change.op === 'create' ? change.fields.title : current ? current.title : `Plan item #${change.id}`}
                        </span>
                        {missing && <span className="text-xs text-red-600">not found</span>}
                    </div>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                        {fields.map((k) => (
                            <FieldChange key={k} label={FIELD_LABEL[k]} before={change.op === 'update' && current ? describeField(k, current[k] as string | null) : null} after={describeField(k, change.fields[k])} />
                        ))}
                    </dl>
                    {change.reason && <p className="mt-2 text-xs text-gray-600">{change.reason}</p>}
                    {outcome && !outcome.ok && <p className="mt-2 text-xs text-red-600">{outcome.error}</p>}
                    {outcome?.ok && <p className="mt-2 text-xs text-green-700">Applied</p>}
                </div>
            </label>
        </li>
    )
}

function FieldChange({ label: text, before, after }: { label: string; before: string | null; after: string }) {
    return (
        <>
            <dt className="text-gray-500">{text}</dt>
            <dd className="text-gray-900">
                {before != null && before !== after && <span className="mr-1 text-gray-400 line-through">{before}</span>}
                {before != null && before !== after && <span className="mr-1 text-gray-400" aria-hidden="true">→</span>}
                <span className={before != null && before !== after ? 'font-medium' : ''}>{after}</span>
            </dd>
        </>
    )
}
