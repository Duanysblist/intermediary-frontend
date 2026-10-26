import { useState, type FormEvent } from 'react'
import Field, { inputClass } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { ApiError } from '../../api/client'
import {
    APPLICATION_SOURCES, APPLICATION_STATUSES, label,
    type Application, type ApplicationInput, type ApplicationSource, type ApplicationStatus,
} from '../../types'
import { todayISO } from '../../lib/format'

// The API stores the interview as a UTC instant; <input type="datetime-local"> speaks browser-local wall-clock.
const pad = (n: number) => String(n).padStart(2, '0')
function toLocalInput(iso: string | null): string {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const fromLocalInput = (value: string): string | null => (value ? new Date(value).toISOString() : null)

function toFormState(a?: Application): ApplicationInput {
    return {
        company: a?.company ?? '',
        role: a?.role ?? '',
        applicationDate: a?.applicationDate ?? todayISO(),
        status: a?.status ?? 'APPLIED',
        source: a?.source ?? 'COLD',
        resumeFile: a?.resumeFile ?? '',
        location: a?.location ?? '',
        requisitionId: a?.requisitionId ?? '',
        jobUrl: a?.jobUrl ?? '',
        salaryRangeMin: a?.salaryRangeMin ?? null,
        salaryRangeMax: a?.salaryRangeMax ?? null,
        notes: a?.notes ?? '',
        contactName: a?.contactName ?? '',
        nextActionDate: a?.nextActionDate ?? null,
        interviewAt: a?.interviewAt ?? null,
    }
}

type Props = {
    initial?: Application
    onSubmit: (input: ApplicationInput) => void
    onCancel: () => void
    isSaving?: boolean
    error?: Error | null
}

export default function ApplicationForm({ initial, onSubmit, onCancel, isSaving, error }: Props) {
    const [form, setForm] = useState<ApplicationInput>(toFormState(initial))
    const fieldErrors = error instanceof ApiError ? error.fieldErrors ?? {} : {}

    function update<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
        setForm((f) => ({ ...f, [key]: value }))
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        onSubmit({
            ...form,
            company: form.company.trim(),
            role: form.role.trim(),
            resumeFile: form.resumeFile.trim(),
            contactName: form.contactName?.trim() || null,
            location: form.location?.trim() || null,
            requisitionId: form.requisitionId?.trim() || null,
            jobUrl: form.jobUrl?.trim() || null,
            notes: form.notes?.trim() || null,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{initial ? 'Edit application' : 'Add application'}</h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company" required error={fieldErrors.company}>
                    <input className={inputClass} value={form.company} onChange={(e) => update('company', e.target.value)} required autoFocus />
                </Field>
                <Field label="Role" required error={fieldErrors.role}>
                    <input className={inputClass} value={form.role} onChange={(e) => update('role', e.target.value)} required />
                </Field>
                <Field label="Application date" required error={fieldErrors.applicationDate}>
                    <input type="date" className={inputClass} value={form.applicationDate} onChange={(e) => update('applicationDate', e.target.value)} required />
                </Field>
                <Field label="Status" required>
                    <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value as ApplicationStatus)}>
                        {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                </Field>
                <Field label="Source" required>
                    <select className={inputClass} value={form.source} onChange={(e) => update('source', e.target.value as ApplicationSource)}>
                        {APPLICATION_SOURCES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                </Field>
                <Field label="Resume file" required error={fieldErrors.resumeFile}>
                    <input className={inputClass} placeholder="Daniel_Duany_Resume_MASTER" value={form.resumeFile}
                           onChange={(e) => update('resumeFile', e.target.value)} required />
                </Field>
                <Field label="Contact" error={fieldErrors.contactName}>
                    <input className={inputClass} placeholder="Who to follow up with" value={form.contactName ?? ''}
                           onChange={(e) => update('contactName', e.target.value)} />
                </Field>
                <Field label="Next action date" error={fieldErrors.nextActionDate}>
                    <input type="date" className={inputClass} value={form.nextActionDate ?? ''}
                           onChange={(e) => update('nextActionDate', e.target.value || null)} />
                </Field>
                <Field label="Interview" error={fieldErrors.interviewAt}>
                    <input type="datetime-local" className={inputClass} value={toLocalInput(form.interviewAt)}
                           onChange={(e) => update('interviewAt', fromLocalInput(e.target.value))} />
                </Field>
                <Field label="Salary min" error={fieldErrors.salaryRangeMin}>
                    <input type="number" min={0} step={1000} className={inputClass} value={form.salaryRangeMin ?? ''}
                           onChange={(e) => update('salaryRangeMin', e.target.value === '' ? null : Number(e.target.value))} />
                </Field>
                <Field label="Salary max" error={fieldErrors.salaryRangeMax}>
                    <input type="number" min={0} step={1000} className={inputClass} value={form.salaryRangeMax ?? ''}
                           onChange={(e) => update('salaryRangeMax', e.target.value === '' ? null : Number(e.target.value))} />
                </Field>
                <Field label="Location" error={fieldErrors.location}>
                    <input className={inputClass} value={form.location ?? ''} onChange={(e) => update('location', e.target.value)} />
                </Field>
                <Field label="Requisition ID" error={fieldErrors.requisitionId}>
                    <input className={inputClass} value={form.requisitionId ?? ''} onChange={(e) => update('requisitionId', e.target.value)} />
                </Field>
                <Field label="Job URL" className="sm:col-span-2" error={fieldErrors.jobUrl}>
                    <input type="url" className={inputClass} placeholder="https://" value={form.jobUrl ?? ''} onChange={(e) => update('jobUrl', e.target.value)} />
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
