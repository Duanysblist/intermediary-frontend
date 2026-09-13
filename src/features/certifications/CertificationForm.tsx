import { useState, type FormEvent } from 'react'
import Field, { inputClass } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { ApiError } from '../../api/client'
import { CERTIFICATION_STATUSES, label, type Certification, type CertificationInput, type CertificationStatus } from '../../types'

function toFormState(c?: Certification): CertificationInput {
    return {
        name: c?.name ?? '',
        vendor: c?.vendor ?? '',
        status: c?.status ?? 'PLANNING',
        examDate: c?.examDate ?? '',
        hoursStudied: c?.hoursStudied ?? null,
        notes: c?.notes ?? '',
    }
}

type Props = {
    initial?: Certification
    onSubmit: (input: CertificationInput) => void
    onCancel: () => void
    isSaving?: boolean
    error?: Error | null
}

export default function CertificationForm({ initial, onSubmit, onCancel, isSaving, error }: Props) {
    const [form, setForm] = useState<CertificationInput>(toFormState(initial))
    const fieldErrors = error instanceof ApiError ? error.fieldErrors ?? {} : {}

    function update<K extends keyof CertificationInput>(key: K, value: CertificationInput[K]) {
        setForm((f) => ({ ...f, [key]: value }))
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        onSubmit({
            ...form,
            name: form.name.trim(),
            vendor: form.vendor.trim(),
            examDate: form.examDate || null,
            notes: form.notes?.trim() || null,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{initial ? 'Edit certification' : 'Add certification'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" required className="sm:col-span-2" error={fieldErrors.name}>
                    <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} required autoFocus placeholder="AWS Solutions Architect – Associate" />
                </Field>
                <Field label="Vendor" required error={fieldErrors.vendor}>
                    <input className={inputClass} value={form.vendor} onChange={(e) => update('vendor', e.target.value)} required placeholder="Amazon" />
                </Field>
                <Field label="Status">
                    <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value as CertificationStatus)}>
                        {CERTIFICATION_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                </Field>
                <Field label="Exam date" error={fieldErrors.examDate}>
                    <input type="date" className={inputClass} value={form.examDate ?? ''} onChange={(e) => update('examDate', e.target.value)} />
                </Field>
                <Field label="Hours studied" error={fieldErrors.hoursStudied} hint="Study sessions are tracked separately; this is a manual total.">
                    <input type="number" min={0} className={inputClass} value={form.hoursStudied ?? ''}
                           onChange={(e) => update('hoursStudied', e.target.value === '' ? null : Number(e.target.value))} />
                </Field>
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
