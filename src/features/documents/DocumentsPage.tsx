import { useMemo, useState } from 'react'
import { documents } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DocumentForm from './DocumentForm'
import { EmptyState, ErrorState, LoadingState, PageHeader, RowActions } from '../../components/ui/Page'
import { formatDate, isLink } from '../../lib/format'
import { DOCUMENT_TYPES, type Document, type DocumentInput } from '../../types'

type SortKey = 'title' | 'type' | 'updated'

const byTitle = (a: Document, b: Document) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
// Each key's natural direction: titles A to Z ("Week 2" before "Week 10"), types in menu order then by title, newest first.
const SORTS: Record<SortKey, (a: Document, b: Document) => number> = {
    title: byTitle,
    type: (a, b) => DOCUMENT_TYPES.indexOf(a.type) - DOCUMENT_TYPES.indexOf(b.type) || byTitle(a, b),
    updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
}

export default function DocumentsPage() {
    const { data, isPending, isError, error } = documents.useList()
    const createMut = documents.useCreate()
    const updateMut = documents.useUpdate()
    const deleteMut = documents.useRemove()

    const [adding, setAdding] = useState(false)
    const [editing, setEditing] = useState<Document | null>(null)
    const [deleting, setDeleting] = useState<Document | null>(null)

    const [sort, setSort] = useState<{ key: SortKey; reversed: boolean }>({ key: 'type', reversed: false })
    const rows = useMemo(() => {
        const sorted = [...(data ?? [])].sort(SORTS[sort.key])
        return sort.reversed ? sorted.reverse() : sorted
    }, [data, sort])
    // Clicking the sorted column flips it; clicking another column sorts by it in its natural direction.
    function sortBy(key: SortKey) { setSort((s) => ({ key, reversed: s.key === key && !s.reversed })) }
    function header(key: SortKey, text: string) {
        const active = sort.key === key
        const descending = sort.reversed !== (key === 'updated')
        return (
            <th className="px-4 py-2.5 font-medium" aria-sort={active ? (descending ? 'descending' : 'ascending') : 'none'}>
                <button type="button" onClick={() => sortBy(key)} className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-gray-800 ${active ? 'text-gray-800' : ''}`}>
                    {text}
                    <span aria-hidden="true" className={active ? '' : 'invisible'}>{descending ? '▼' : '▲'}</span>
                </button>
            </th>
        )
    }

    function close() { setAdding(false); setEditing(null); createMut.reset(); updateMut.reset() }
    function handleSubmit(input: DocumentInput) {
        if (editing) updateMut.mutate({ id: editing.id, body: input }, { onSuccess: close })
        else createMut.mutate(input, { onSuccess: close })
    }

    if (isPending) return <LoadingState what="documents" />
    if (isError) return <ErrorState what="documents" error={error} />

    return (
        <div>
            <PageHeader
                title="Documents"
                subtitle="Resumes, plans, and guides you're drafting or maintaining."
                actions={<Button onClick={() => setAdding(true)}>+ Add</Button>}
            />

            {rows.length === 0 ? (
                <EmptyState
                    title="No documents yet."
                    hint="Register the files you work on so plan items can point at them."
                    action={<Button onClick={() => setAdding(true)}>Add a document</Button>}
                />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            {header('title', 'Title')}
                            {header('type', 'Type')}
                            <th className="px-4 py-2.5 font-medium">Version</th>
                            <th className="px-4 py-2.5 font-medium">Location</th>
                            {header('updated', 'Updated')}
                            <th className="px-4 py-2.5 font-medium"><span className="sr-only">Actions</span></th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((d) => (
                            <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                                <td className="px-4 py-2.5 font-medium text-gray-900">
                                    {d.title}
                                    {d.notes && <div className="max-w-xs truncate text-xs font-normal text-gray-500" title={d.notes}>{d.notes}</div>}
                                </td>
                                <td className="px-4 py-2.5"><Pill value={d.type} /></td>
                                <td className="px-4 py-2.5 text-gray-600">{d.version ?? '—'}</td>
                                <td className="max-w-xs truncate px-4 py-2.5 font-mono text-xs text-gray-600" title={d.path}>
                                    {isLink(d.path) ? <a href={d.path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{d.path}</a> : d.path}
                                </td>
                                <td className="px-4 py-2.5 text-gray-600">{formatDate(d.updatedAt)}</td>
                                <td className="px-4 py-2.5 text-right">
                                    <RowActions onEdit={() => setEditing(d)} onDelete={() => setDeleting(d)} />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={adding || editing !== null} onClose={close}>
                <DocumentForm
                    key={editing?.id ?? 'new'}
                    initial={editing ?? undefined}
                    onSubmit={handleSubmit}
                    onCancel={close}
                    isSaving={createMut.isPending || updateMut.isPending}
                    error={createMut.error || updateMut.error}
                />
            </Modal>
            <ConfirmDialog
                open={deleting !== null}
                title="Delete document?"
                message={deleting ? `This removes the record for “${deleting.title}”. The file itself is not touched.` : undefined}
                isWorking={deleteMut.isPending}
                error={deleteMut.error}
                onConfirm={() => deleting && deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
                onCancel={() => { setDeleting(null); deleteMut.reset() }}
            />
        </div>
    )
}
