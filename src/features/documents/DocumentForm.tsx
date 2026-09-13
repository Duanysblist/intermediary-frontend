import { useState, type FormEvent } from 'react'
import Field, { inputClass } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { ApiError } from '../../api/client'
import { DOCUMENT_TYPES, label, type Document, type DocumentInput, type DocumentType } from '../../types'

function toFormState(d?: Document): DocumentInput {
    return {
        title: d?.title ?? '',
        path: d?.path ?? '',
        type: d?.type ?? 'OTHER',
        version: d?.version ?? '',
        notes: d?.notes ?? '',
    }
}

type Props = {
    initial?: Document
    onSubmit: (input: DocumentInput) => void
    onCancel: () => void
    isSaving?: boolean
    error?: Error | null
}

export default function DocumentForm({ initial, onSubmit, onCancel, isSaving, error }: Props) {
    const [form, setForm] = useState<DocumentInput>(toFormState(initial))
    const fieldErrors = error instanceof ApiError ? error.fieldErrors ?? {} : {}

    function update<K extends keyof DocumentInput>(key: K, value: DocumentInput[K]) {
        setForm((f) => ({ ...f, [key]: value }))
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        onSubmit({
            ...form,
            title: form.title.trim(),
            path: form.path.trim(),
            version: form.version?.trim() || null,
            notes: form.notes?.trim() || null,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{initial ? 'Edit document' : 'Add document'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title" required className="sm:col-span-2" error={fieldErrors.title}>
                    <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} required autoFocus />
                </Field>
                <Field label="Path or URL" required className="sm:col-span-2" error={fieldErrors.path} hint="Where the document lives: a file path, Drive link, or repo URL.">
                    <input className={inputClass} value={form.path} onChange={(e) => update('path', e.target.value)} required />
                </Field>
                <Field label="Type">
                    <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value as DocumentType)}>
                        {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
                    </select>
                </Field>
                <Field label="Version" error={fieldErrors.version}>
                    <input className={inputClass} value={form.version ?? ''} onChange={(e) => update('version', e.target.value)} placeholder="v3, 2026-09, …" />
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
