import { useState, type FormEvent } from 'react'
import Field, { inputClass } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { ApiError } from '../../api/client'
import { certifications } from '../../hooks/resources'
import { toDateTimeLocal } from '../../lib/format'
import {
    WORKOUT_TYPES, label,
    type FitnessSession, type FitnessSessionInput, type StudySession, type StudySessionInput, type WorkoutType,
} from '../../types'

type FormProps<T, TInput> = {
    initial?: T
    onSubmit: (input: TInput) => void
    onCancel: () => void
    isSaving?: boolean
    error?: Error | null
}

/** Round "now" down to the nearest 15 minutes for a sensible default session start. */
function defaultSessionDate(): string {
    const d = new Date()
    d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0)
    return toDateTimeLocal(d)
}

function Footer({ onCancel, isSaving }: { onCancel: () => void; isSaving?: boolean }) {
    return (
        <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
        </div>
    )
}

export function StudySessionForm({ initial, onSubmit, onCancel, isSaving, error }: FormProps<StudySession, StudySessionInput>) {
    const certs = certifications.useList()
    const [form, setForm] = useState<StudySessionInput>({
        sessionDate: initial?.sessionDate.slice(0, 16) ?? defaultSessionDate(),
        durationMinutes: initial?.durationMinutes ?? 60,
        certificationId: initial?.certificationId ?? null,
        planItemId: initial?.planItemId ?? null,
        notes: initial?.notes ?? '',
    })
    const fieldErrors = error instanceof ApiError ? error.fieldErrors ?? {} : {}

    function update<K extends keyof StudySessionInput>(key: K, value: StudySessionInput[K]) {
        setForm((f) => ({ ...f, [key]: value }))
    }
    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        onSubmit({ ...form, notes: form.notes?.trim() || null })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{initial ? 'Edit study session' : 'Log study session'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="When" required error={fieldErrors.sessionDate}>
                    <input type="datetime-local" className={inputClass} value={form.sessionDate} onChange={(e) => update('sessionDate', e.target.value)} required autoFocus />
                </Field>
                <Field label="Duration (minutes)" required error={fieldErrors.durationMinutes}>
                    <input type="number" min={1} className={inputClass} value={form.durationMinutes}
                           onChange={(e) => update('durationMinutes', Number(e.target.value))} required />
                </Field>
                <Field label="Certification" className="sm:col-span-2" hint="Optional. Links this session to what you were studying for.">
                    <select className={inputClass} value={form.certificationId ?? ''}
                            onChange={(e) => update('certificationId', e.target.value === '' ? null : Number(e.target.value))}>
                        <option value="">— None —</option>
                        {(certs.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </Field>
                <Field label="Notes" className="sm:col-span-2" error={fieldErrors.notes}>
                    <textarea className={inputClass} rows={3} value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} placeholder="What did you cover?" />
                </Field>
            </div>
            {error && Object.keys(fieldErrors).length === 0 && <p className="text-sm text-red-600">{error.message}</p>}
            <Footer onCancel={onCancel} isSaving={isSaving} />
        </form>
    )
}

export function FitnessSessionForm({ initial, onSubmit, onCancel, isSaving, error }: FormProps<FitnessSession, FitnessSessionInput>) {
    const [form, setForm] = useState<FitnessSessionInput>({
        sessionDate: initial?.sessionDate.slice(0, 16) ?? defaultSessionDate(),
        durationMinutes: initial?.durationMinutes ?? 45,
        workoutType: initial?.workoutType ?? 'WORKOUT_A',
        planItemId: initial?.planItemId ?? null,
        notes: initial?.notes ?? '',
    })
    const fieldErrors = error instanceof ApiError ? error.fieldErrors ?? {} : {}

    function update<K extends keyof FitnessSessionInput>(key: K, value: FitnessSessionInput[K]) {
        setForm((f) => ({ ...f, [key]: value }))
    }
    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        onSubmit({ ...form, notes: form.notes?.trim() || null })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{initial ? 'Edit workout' : 'Log workout'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="When" required error={fieldErrors.sessionDate}>
                    <input type="datetime-local" className={inputClass} value={form.sessionDate} onChange={(e) => update('sessionDate', e.target.value)} required autoFocus />
                </Field>
                <Field label="Duration (minutes)" required error={fieldErrors.durationMinutes}>
                    <input type="number" min={1} className={inputClass} value={form.durationMinutes}
                           onChange={(e) => update('durationMinutes', Number(e.target.value))} required />
                </Field>
                <Field label="Workout type" required className="sm:col-span-2">
                    <select className={inputClass} value={form.workoutType} onChange={(e) => update('workoutType', e.target.value as WorkoutType)}>
                        {WORKOUT_TYPES.map((w) => <option key={w} value={w}>{label(w)}</option>)}
                    </select>
                </Field>
                <Field label="Notes" className="sm:col-span-2" error={fieldErrors.notes}>
                    <textarea className={inputClass} rows={3} value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
                </Field>
            </div>
            {error && Object.keys(fieldErrors).length === 0 && <p className="text-sm text-red-600">{error.message}</p>}
            <Footer onCancel={onCancel} isSaving={isSaving} />
        </form>
    )
}
