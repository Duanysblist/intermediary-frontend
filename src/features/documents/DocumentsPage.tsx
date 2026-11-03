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
import Icon from '../../components/ui/Icon'

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
                <button type="button" onClick={() => sortBy(key)} className={`inline-flex items-center gap-1 hover:text-ink ${active ? 'text-ink' : ''}`}>
                    {text}
                    <Icon name={descending ? 'chevronDown' : 'chevronUp'} className={`h-3.5 w-3.5 ${active ? '' : 'invisible'}`} strokeWidth={2.4} />
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
                actions={<Button onClick={() => setAdding(true)}><Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />Add</Button>}
            />

            {rows.length === 0 ? (
                <EmptyState
                    title="No documents yet."
                    hint="Register the files you work on so plan items can point at them."
                    action={<Button onClick={() => setAdding(true)}>Add a document</Button>}
                />
            ) : (
                <>
                <div className="mb-2 flex items-center justify-end gap-2 md:hidden">
                    <label htmlFor="doc-sort" className="text-sm text-muted">Sort</label>
                    <select id="doc-sort" className="min-h-11 rounded-[10px] border border-rule-strong bg-surface px-2.5 text-base"
                            value={`${sort.key}:${sort.reversed}`}
                            onChange={(e) => { const [key, reversed] = e.target.value.split(':'); setSort({ key: key as SortKey, reversed: reversed === 'true' }) }}>
                        <option value="type:false">Type</option>
                        <option value="title:false">Title, A to Z</option>
                        <option value="title:true">Title, Z to A</option>
                        <option value="updated:false">Newest first</option>
                        <option value="updated:true">Oldest first</option>
                    </select>
                </div>
                <ul className="divide-y divide-rule rounded-xl bg-surface md:hidden">
                    {rows.map((d) => (
                        <li key={d.id} className="flex items-center gap-1">
                            {isLink(d.path) ? (
                                <a href={d.path} target="_blank" rel="noreferrer" className="min-w-0 flex-1 px-4 py-3 focus-visible:-outline-offset-2">
                                    <span className="block font-medium text-ink">{d.title}</span>
                                    <span className="mt-0.5 flex items-center gap-2 text-xs text-muted"><Pill value={d.type} />{d.version && <span>{d.version}</span>}</span>
                                </a>
                            ) : (
                                <div className="min-w-0 flex-1 px-4 py-3">
                                    <span className="block font-medium text-ink">{d.title}</span>
                                    <span className="mt-0.5 block truncate font-mono text-xs text-muted">{d.path}</span>
                                </div>
                            )}
                            <button type="button" onClick={() => setEditing(d)} className="shrink-0 px-4 py-3 text-sm text-accent">Edit</button>
                        </li>
                    ))}
                </ul>
                <div className="hidden overflow-x-auto rounded-xl bg-surface md:block">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-rule bg-page text-left text-xs text-muted">
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
                            <tr key={d.id} className="border-b border-rule last:border-0 hover:bg-page/60">
                                <td className="px-4 py-2.5 font-medium text-ink">
                                    {d.title}
                                    {d.notes && <div className="max-w-xs truncate text-xs font-normal text-muted" title={d.notes}>{d.notes}</div>}
                                </td>
                                <td className="px-4 py-2.5"><Pill value={d.type} /></td>
                                <td className="px-4 py-2.5 text-ink-2">{d.version ?? '—'}</td>
                                <td className="max-w-xs truncate px-4 py-2.5 font-mono text-xs text-ink-2" title={d.path}>
                                    {isLink(d.path) ? <a href={d.path} target="_blank" rel="noreferrer" className="text-accent hover:underline">{d.path}</a> : d.path}
                                </td>
                                <td className="px-4 py-2.5 text-ink-2">{formatDate(d.updatedAt)}</td>
                                <td className="px-4 py-2.5 text-right">
                                    <RowActions onEdit={() => setEditing(d)} onDelete={() => setDeleting(d)} />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </>
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
                {editing && (
                    <button type="button" onClick={() => { const target = editing; close(); setDeleting(target) }}
                            className="mt-4 min-h-11 text-sm text-danger hover:underline md:hidden">Delete this document</button>
                )}
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
