import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Application, ApplicationInput, ApplicationStatus, ApplicationSource, ResumeVariant } from '../../types'

const STATUSES: ApplicationStatus[] = ['APPLIED','SCREENING','INTERVIEWING','OFFER','REJECTED','WITHDRAWN','GHOSTED']
const SOURCES: ApplicationSource[] = ['COLD','REFERRAL','RECRUITER','EVENT','INTERNAL']
const RESUME_VARIANTS: ResumeVariant[] = ['VARIANT_A_DEFENSE','VARIANT_B_COMMERCIAL','VARIANT_C_CACI_SPECIFIC']

function toFormState(a?: Application): ApplicationInput {
    return {
        company: a?.company ?? '', role: a?.role ?? '',
        applicationDate: a?.applicationDate ?? new Date().toISOString().slice(0, 10),
        status: a?.status ?? 'APPLIED', source: a?.source ?? 'COLD',
        resumeVariant: a?.resumeVariant ?? 'VARIANT_B_COMMERCIAL',
        location: a?.location ?? '', requisitionId: a?.requisitionId ?? '', jobUrl: a?.jobUrl ?? '',
        salaryRangeMin: a?.salaryRangeMin ?? null, salaryRangeMax: a?.salaryRangeMax ?? null,
        notes: a?.notes ?? '',
    }
}

type Props = {
    initial?: Application
    onSubmit: (input: ApplicationInput) => void
    onCancel: () => void
    isSaving?: boolean
    error?: Error | null
}

const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm'

export default function ApplicationForm({ initial, onSubmit, onCancel, isSaving, error }: Props) {
    const [form, setForm] = useState<ApplicationInput>(toFormState(initial))

    function update<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
        setForm((f) => ({ ...f, [key]: value }))
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        onSubmit({
            ...form,
            location: form.location || null,
            requisitionId: form.requisitionId || null,
            jobUrl: form.jobUrl || null,
            notes: form.notes || null,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{initial ? 'Edit application' : 'Add application'}</h2>

            {/* PATTERN: required text */}
            <div>
                <label className={labelClass}>Company *</label>
                <input className={inputClass} value={form.company} onChange={(e) => update('company', e.target.value)} required />
            </div>

            {/* FILL IN — Role *: identical to Company, bound to form.role */}
            <div>
                <label className={labelClass}>Role *</label>
                <input className={inputClass} value={form.role} onChange={(e) => update('role', e.target.value)} required />
            </div>

            {/* PATTERN: date */}
            <div>
                <label className={labelClass}>Application date *</label>
                <input type="date" className={inputClass} value={form.applicationDate} onChange={(e) => update('applicationDate', e.target.value)} required />
            </div>

            {/* PATTERN: enum select */}
            <div>
                <label className={labelClass}>Status *</label>
                <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value as ApplicationStatus)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* FILL IN — Source *: like Status, map over SOURCES, cast `as ApplicationSource` */}
            <div>
                <label className={labelClass}>Source *</label>
                <select className={inputClass} value={form.source} onChange={(e) => update('source', e.target.value as ApplicationSource)}>
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* FILL IN — Resume variant *: like Status, map over RESUME_VARIANTS, cast `as ResumeVariant` */}
            <div>
                <label className={labelClass}>Resume variant *</label>
                <select className={inputClass} value={form.resumeVariant} onChange={(e) => update('resumeVariant', e.target.value as ResumeVariant)}>
                    {RESUME_VARIANTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* PATTERN: number (note the '' <-> null bridge) */}
            <div>
                <label className={labelClass}>Salary min</label>
                <input type="number" className={inputClass} value={form.salaryRangeMin ?? ''}
                       onChange={(e) => update('salaryRangeMin', e.target.value === '' ? null : Number(e.target.value))} />
            </div>

            {/* FILL IN — Salary max: identical to Salary min, bound to form.salaryRangeMax */}
            <div>
                <label className={labelClass}>Salary max</label>
                <input type="number" className={inputClass} value={form.salaryRangeMax ?? ''}
                       onChange={(e) => update('salaryRangeMax', e.target.value === '' ? null : Number(e.target.value))} />
            </div>

            {/* FILL IN — Location, Requisition ID, Job URL: like Company but optional (drop `required`) */}
            <div>
                <label className={labelClass}>Location *</label>
                <input className={inputClass} value={form.location ?? ''} onChange={(e) => update('location', e.target.value)} />
            </div>

            {/* Requisition ID (optional) */}
            <div>
                <label className={labelClass}>Requisition ID</label>
                <input className={inputClass} value={form.requisitionId ?? ''} onChange={(e) => update('requisitionId', e.target.value)} />
            </div>

            {/* Job URL (optional) */}
            <div>
                <label className={labelClass}>Job URL</label>
                <input className={inputClass} value={form.jobUrl ?? ''} onChange={(e) => update('jobUrl', e.target.value)} />
            </div>

            {/* PATTERN: textarea */}
            <div>
                <label className={labelClass}>Notes</label>
                <textarea className={inputClass} rows={3} value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
            </div>

            {error && <p className="text-sm text-red-600">{error.message}</p>}

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                    {isSaving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    )
}