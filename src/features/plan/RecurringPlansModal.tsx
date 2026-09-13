import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { recurringPlansApi } from '../../api/resources'
import { planItems } from '../../hooks/resources'
import { useReferenceOptions } from './references'
import Field, { inputClass } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import Pill from '../../components/ui/Pill'
import { ApiError } from '../../api/client'
import { EmptyState } from '../../components/ui/Page'
import {
    DAYS_OF_WEEK, PLAN_INTENTS, REFERENCE_PICKER_TYPES, label,
    type DayOfWeek, type PlanIntent, type RecurringPlan, type RecurringPlanInput, type ReferenceEntityType,
} from '../../types'

const KEY = ['recurring-plans'] as const
const DAY_SHORT: Record<DayOfWeek, string> = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' }

function toForm(p?: RecurringPlan): RecurringPlanInput {
    return {
        title: p?.title ?? '',
        intent: p?.intent ?? 'EXERCISE',
        days: p?.days ?? [],
        referenceEntityType: p?.referenceEntityType ?? null,
        referenceEntityId: p?.referenceEntityId ?? null,
        notes: p?.notes ?? '',
        active: p?.active ?? true,
    }
}

/**
 * Routines: "Workout B every Mon/Wed/Fri". Generate turns them into ordinary plan items for the
 * coming days; running it again never duplicates a day.
 */
export default function RecurringPlansModal({ onClose }: { onClose: () => void }) {
    const qc = useQueryClient()
    const plans = useQuery({ queryKey: KEY, queryFn: recurringPlansApi.list })
    const { optionsFor } = useReferenceOptions()
    const [editing, setEditing] = useState<RecurringPlan | 'new' | null>(null)
    const [form, setForm] = useState<RecurringPlanInput>(toForm())
    const [generated, setGenerated] = useState<number | null>(null)

    const invalidate = () => qc.invalidateQueries({ queryKey: KEY })
    const createMut = useMutation({ mutationFn: (b: RecurringPlanInput) => recurringPlansApi.create(b), onSuccess: () => { invalidate(); setEditing(null) } })
    const updateMut = useMutation({ mutationFn: (v: { id: number; body: RecurringPlanInput }) => recurringPlansApi.update(v.id, v.body), onSuccess: () => { invalidate(); setEditing(null) } })
    const removeMut = useMutation({ mutationFn: (id: number) => recurringPlansApi.remove(id), onSuccess: invalidate })
    const generateMut = useMutation({
        mutationFn: () => recurringPlansApi.generate(14),
        onSuccess: (items) => { setGenerated(items.length); qc.invalidateQueries({ queryKey: planItems.queryKey }) },
    })
    const error = createMut.error || updateMut.error
    const fieldErrors = error instanceof ApiError ? error.fieldErrors ?? {} : {}

    function startEdit(p?: RecurringPlan) {
        setForm(toForm(p))
        setEditing(p ?? 'new')
        createMut.reset(); updateMut.reset()
    }
    function update<K extends keyof RecurringPlanInput>(k: K, v: RecurringPlanInput[K]) { setForm((f) => ({ ...f, [k]: v })) }
    function toggleDay(d: DayOfWeek) {
        update('days', form.days.includes(d) ? form.days.filter((x) => x !== d) : DAYS_OF_WEEK.filter((x) => x === d || form.days.includes(x)))
    }
    function submit(e: FormEvent) {
        e.preventDefault()
        const body: RecurringPlanInput = { ...form, title: form.title.trim(), notes: form.notes?.trim() || null, referenceEntityId: form.referenceEntityType ? form.referenceEntityId : null }
        if (editing && editing !== 'new') updateMut.mutate({ id: editing.id, body })
        else createMut.mutate(body)
    }

    const refType = form.referenceEntityType
    // An item saved with a link type no longer offered (a session) still shows it, so nothing is silently dropped.
    const pickerTypes = refType && !REFERENCE_PICKER_TYPES.includes(refType) ? [...REFERENCE_PICKER_TYPES, refType] : REFERENCE_PICKER_TYPES
    const refOptions = refType ? optionsFor(refType) : []

    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Routines</h2>
                    <p className="mt-0.5 text-xs text-gray-500">Things you intend to do on the same days every week. Generate creates the plan items for the next two weeks.</p>
                </div>
                <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">✕</button>
            </div>

            {editing ? (
                <form onSubmit={submit} className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Title" required className="sm:col-span-2" error={fieldErrors.title}>
                            <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} required autoFocus placeholder="Workout B, evening study block, …" />
                        </Field>
                        <Field label="Intent" required>
                            <select className={inputClass} value={form.intent} onChange={(e) => update('intent', e.target.value as PlanIntent)}>
                                {PLAN_INTENTS.map((i) => <option key={i} value={i}>{label(i)}</option>)}
                            </select>
                        </Field>
                        <Field label="Active">
                            <select className={inputClass} value={form.active ? 'yes' : 'no'} onChange={(e) => update('active', e.target.value === 'yes')}>
                                <option value="yes">Yes, generate items</option>
                                <option value="no">Paused</option>
                            </select>
                        </Field>
                        <Field label="Days" required className="sm:col-span-2" error={fieldErrors.days}>
                            <div className="flex flex-wrap gap-1.5">
                                {DAYS_OF_WEEK.map((d) => (
                                    <button key={d} type="button" onClick={() => toggleDay(d)} aria-pressed={form.days.includes(d)}
                                            className={`rounded-md border px-2.5 py-1 text-sm ${form.days.includes(d) ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                                        {DAY_SHORT[d]}
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Field label="Relates to">
                            <select className={inputClass} value={refType ?? ''} onChange={(e) => { update('referenceEntityType', (e.target.value || null) as ReferenceEntityType | null); update('referenceEntityId', null) }}>
                                <option value="">— Nothing —</option>
                                {pickerTypes.map((t) => <option key={t} value={t}>{label(t)}</option>)}
                            </select>
                        </Field>
                        {refType && (
                            <Field label={`Which ${label(refType).toLowerCase()}?`} hint={refOptions.length === 0 ? 'Nothing to choose from yet.' : undefined}>
                                <select className={inputClass} value={form.referenceEntityId ?? ''} disabled={refOptions.length === 0} onChange={(e) => update('referenceEntityId', e.target.value === '' ? null : Number(e.target.value))}>
                                    <option value="">— Choose —</option>
                                    {refOptions.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
                                </select>
                            </Field>
                        )}
                        <Field label="Notes" className="sm:col-span-2">
                            <textarea className={inputClass} rows={2} value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
                        </Field>
                    </div>
                    {error && Object.keys(fieldErrors).length === 0 && <p className="text-sm text-red-600">{error.message}</p>}
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button type="submit" disabled={createMut.isPending || updateMut.isPending || form.days.length === 0}>Save</Button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <Button variant="secondary" onClick={() => startEdit()}>+ New routine</Button>
                        <div className="flex items-center gap-3">
                            {generated != null && <span className="text-xs text-gray-500">{generated === 0 ? 'Nothing new to add.' : `${generated} item${generated === 1 ? '' : 's'} added to the plan.`}</span>}
                            <Button onClick={() => generateMut.mutate()} disabled={generateMut.isPending || !(plans.data ?? []).some((p) => p.active)}>
                                {generateMut.isPending ? 'Generating…' : 'Generate next 2 weeks'}
                            </Button>
                        </div>
                    </div>
                    {generateMut.isError && <p className="mt-2 text-sm text-red-600">{generateMut.error.message}</p>}
                    {plans.isPending ? (
                        <p className="mt-4 text-sm text-gray-500">Loading…</p>
                    ) : (plans.data ?? []).length === 0 ? (
                        <div className="mt-4"><EmptyState title="No routines yet." hint="Add the things you do every week, then Generate fills the calendar." /></div>
                    ) : (
                        <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
                            {(plans.data ?? []).map((p) => (
                                <li key={p.id} className={`flex items-center gap-3 px-3 py-2.5 text-sm ${p.active ? '' : 'opacity-60'}`}>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-medium text-gray-900">{p.title}</span>
                                            <Pill value={p.intent} />
                                            {!p.active && <span className="text-xs text-gray-500">paused</span>}
                                        </div>
                                        <div className="mt-0.5 text-xs text-gray-500">{DAYS_OF_WEEK.filter((d) => p.days.includes(d)).map((d) => DAY_SHORT[d]).join(' · ')}</div>
                                    </div>
                                    <button type="button" onClick={() => startEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                                    <button type="button" onClick={() => removeMut.mutate(p.id)} className="text-red-600 hover:underline">Delete</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    )
}
