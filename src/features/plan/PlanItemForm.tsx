import { useState, type FormEvent } from 'react'
import Field, { inputClass } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { ApiError } from '../../api/client'
import { useReferenceOptions } from './references'
import {
    PLAN_INTENTS, PLAN_STATUSES, REFERENCE_PICKER_TYPES, label,
    type PlanIntent, type PlanItem, type PlanItemInput, type PlanItemStatus, type ReferenceEntityType,
} from '../../types'

type Props = {
    initial?: PlanItem
    defaults?: Partial<PlanItemInput>
    onSubmit: (input: PlanItemInput) => void
    onCancel: () => void
    isSaving?: boolean
    error?: Error | null
}

function toFormState(p?: PlanItem, defaults?: Partial<PlanItemInput>): PlanItemInput {
    return {
        title: p?.title ?? '',
        intent: p?.intent ?? defaults?.intent ?? 'STUDY',
        targetDate: p?.targetDate ?? defaults?.targetDate ?? '',
        status: p?.status ?? defaults?.status ?? 'PLANNED',
        referenceEntityType: p?.referenceEntityType ?? null,
        referenceEntityId: p?.referenceEntityId ?? null,
        recurringPlanId: p?.recurringPlanId ?? null,
        notes: p?.notes ?? '',
    }
}

const REFERENCE_HINT: Record<ReferenceEntityType, string> = {
    CERTIFICATION: 'certification',
    APPLICATION: 'application',
    DOCUMENT: 'document',
    STUDY_SESSION: 'study session',
    FITNESS_SESSION: 'workout',
    PLAN_ITEM: 'plan item',
}

export default function PlanItemForm({ initial, defaults, onSubmit, onCancel, isSaving, error }: Props) {
    const [form, setForm] = useState<PlanItemInput>(toFormState(initial, defaults))
    const fieldErrors = error instanceof ApiError ? error.fieldErrors ?? {} : {}
    const { optionsFor } = useReferenceOptions()

    function update<K extends keyof PlanItemInput>(key: K, value: PlanItemInput[K]) {
        setForm((f) => ({ ...f, [key]: value }))
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        const hasReference = form.referenceEntityType != null && form.referenceEntityId != null
        onSubmit({
            ...form,
            title: form.title.trim(),
            targetDate: form.targetDate || null,
            referenceEntityType: hasReference ? form.referenceEntityType : null,
            referenceEntityId: hasReference ? form.referenceEntityId : null,
            notes: form.notes?.trim() || null,
        })
    }

    const refType = form.referenceEntityType
    // An item saved with a link type no longer offered (a session) still shows it, so nothing is silently dropped.
    const pickerTypes = refType && !REFERENCE_PICKER_TYPES.includes(refType) ? [...REFERENCE_PICKER_TYPES, refType] : REFERENCE_PICKER_TYPES
    const refOptions = refType ? optionsFor(refType, initial?.id) : []

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{initial ? 'Edit plan item' : 'New plan item'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title" required className="sm:col-span-2" error={fieldErrors.title}>
                    <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} required autoFocus
                           placeholder="Finish chapter 4, apply to Acme, 5k run…" />
                </Field>
                <Field label="Intent" required error={fieldErrors.intent}>
                    <select className={inputClass} value={form.intent} onChange={(e) => update('intent', e.target.value as PlanIntent)}>
                        {PLAN_INTENTS.map((i) => <option key={i} value={i}>{label(i)}</option>)}
                    </select>
                </Field>
                <Field label="Status">
                    <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value as PlanItemStatus)}>
                        {PLAN_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                </Field>
                <Field label="Target date" error={fieldErrors.targetDate}>
                    <input type="date" className={inputClass} value={form.targetDate ?? ''} onChange={(e) => update('targetDate', e.target.value)} />
                </Field>
                <Field label="Relates to" hint="Optional. Ties this intention to something you're tracking.">
                    <select className={inputClass} value={refType ?? ''}
                            onChange={(e) => { update('referenceEntityType', (e.target.value || null) as ReferenceEntityType | null); update('referenceEntityId', null) }}>
                        <option value="">— Nothing —</option>
                        {pickerTypes.map((t) => <option key={t} value={t}>{label(t)}</option>)}
                    </select>
                </Field>
                {refType && (
                    <Field label={`Which ${REFERENCE_HINT[refType]}?`} className="sm:col-span-2"
                           hint={refOptions.length === 0 ? `You haven't added any ${REFERENCE_HINT[refType]}s yet.` : undefined}>
                        <select className={inputClass} value={form.referenceEntityId ?? ''} disabled={refOptions.length === 0}
                                onChange={(e) => update('referenceEntityId', e.target.value === '' ? null : Number(e.target.value))}>
                            <option value="">— Choose —</option>
                            {refOptions.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
                        </select>
                    </Field>
                )}
                <Field label="Notes" className="sm:col-span-2" error={fieldErrors.notes}>
                    <textarea className={inputClass} rows={3} value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
                </Field>
            </div>
            {error && Object.keys(fieldErrors).length === 0 && <p className="text-sm text-red-600">{error.message}</p>}
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
            </div>
        </form>
    )
}
