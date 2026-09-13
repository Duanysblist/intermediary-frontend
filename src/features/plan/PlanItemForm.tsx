import { useState, type FormEvent } from 'react'
import Field, { inputClass } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { ApiError } from '../../api/client'
import { applications, certifications, documents } from '../../hooks/resources'
import {
    PLAN_INTENTS, PLAN_STATUSES, REFERENCE_TYPES, label,
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
        notes: p?.notes ?? '',
    }
}

export default function PlanItemForm({ initial, defaults, onSubmit, onCancel, isSaving, error }: Props) {
    const [form, setForm] = useState<PlanItemInput>(toFormState(initial, defaults))
    const fieldErrors = error instanceof ApiError ? error.fieldErrors ?? {} : {}
    const certs = certifications.useList()
    const apps = applications.useList()
    const docs = documents.useList()

    function update<K extends keyof PlanItemInput>(key: K, value: PlanItemInput[K]) {
        setForm((f) => ({ ...f, [key]: value }))
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        onSubmit({
            ...form,
            title: form.title.trim(),
            targetDate: form.targetDate || null,
            referenceEntityId: form.referenceEntityType ? form.referenceEntityId : null,
            notes: form.notes?.trim() || null,
        })
    }

    // Reference picker: a dropdown of real records for the types we have lists for, an id box otherwise.
    const refType = form.referenceEntityType
    const refOptions: { id: number; text: string }[] | null =
        refType === 'CERTIFICATION' ? (certs.data ?? []).map((c) => ({ id: c.id, text: c.name }))
        : refType === 'APPLICATION' ? (apps.data ?? []).map((a) => ({ id: a.id, text: `${a.company} · ${a.role}` }))
        : refType === 'DOCUMENT' ? (docs.data ?? []).map((d) => ({ id: d.id, text: d.title }))
        : null

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
                <Field label="Target date" error={fieldErrors.targetDate} hint={initial?.targetDate ? 'Dates can be moved but not cleared once set.' : undefined}>
                    <input type="date" className={inputClass} value={form.targetDate ?? ''} onChange={(e) => update('targetDate', e.target.value)} />
                </Field>
                <Field label="Relates to">
                    <select className={inputClass} value={refType ?? ''}
                            onChange={(e) => { update('referenceEntityType', (e.target.value || null) as ReferenceEntityType | null); update('referenceEntityId', null) }}>
                        <option value="">— Nothing —</option>
                        {REFERENCE_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
                    </select>
                </Field>
                {refType && (
                    <Field label={refOptions ? `Which ${label(refType).toLowerCase()}?` : 'Record id'} className="sm:col-span-2">
                        {refOptions ? (
                            <select className={inputClass} value={form.referenceEntityId ?? ''}
                                    onChange={(e) => update('referenceEntityId', e.target.value === '' ? null : Number(e.target.value))}>
                                <option value="">— Choose —</option>
                                {refOptions.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
                            </select>
                        ) : (
                            <input type="number" min={1} className={inputClass} value={form.referenceEntityId ?? ''}
                                   onChange={(e) => update('referenceEntityId', e.target.value === '' ? null : Number(e.target.value))} />
                        )}
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
