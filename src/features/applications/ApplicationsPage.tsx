import { useMemo, useState } from 'react'
import { useApplications, useCreateApplication, useUpdateApplication, useDeleteApplication } from './useApplications'
import Pill from '../../components/ui/Pill'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ApplicationForm from './ApplicationForm'
import { EmptyState, ErrorState, LoadingState, PageHeader, RowActions } from '../../components/ui/Page'
import { formatDate, formatSalary } from '../../lib/format'
import { APPLICATION_STATUSES, label, type Application, type ApplicationInput, type ApplicationStatus } from '../../types'

const CLOSED: ApplicationStatus[] = ['REJECTED', 'WITHDRAWN', 'GHOSTED']

export default function ApplicationsPage() {
    const { data, isPending, isError, error } = useApplications()
    const createMut = useCreateApplication()
    const updateMut = useUpdateApplication()
    const deleteMut = useDeleteApplication()

    const [deleting, setDeleting] = useState<Application | null>(null)
    const [adding, setAdding] = useState(false)
    const [editing, setEditing] = useState<Application | null>(null)
    const [filter, setFilter] = useState<'active' | 'all' | ApplicationStatus>('active')
    const isOpen = adding || editing !== null

    const rows = useMemo(() => {
        const list = [...(data ?? [])].sort((a, b) => b.applicationDate.localeCompare(a.applicationDate))
        if (filter === 'all') return list
        if (filter === 'active') return list.filter((a) => !CLOSED.includes(a.status))
        return list.filter((a) => a.status === filter)
    }, [data, filter])

    function close() {
        setAdding(false); setEditing(null); createMut.reset(); updateMut.reset()
    }

    function handleSubmit(input: ApplicationInput) {
        if (editing) updateMut.mutate({ id: editing.id, body: input }, { onSuccess: close })
        else createMut.mutate(input, { onSuccess: close })
    }

    if (isPending) return <LoadingState what="applications" />
    if (isError) return <ErrorState what="applications" error={error} />

    const activeCount = data.filter((a) => !CLOSED.includes(a.status)).length

    return (
        <div>
            <PageHeader
                title="Applications"
                subtitle={`${activeCount} active · ${data.length} total`}
                actions={
                    <>
                        <select
                            aria-label="Filter by status"
                            className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as typeof filter)}
                        >
                            <option value="active">Active</option>
                            <option value="all">All</option>
                            {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                        </select>
                        <Button onClick={() => setAdding(true)}>+ Add</Button>
                    </>
                }
            />

            {rows.length === 0 ? (
                <EmptyState
                    title={data.length === 0 ? 'No applications yet.' : 'Nothing matches this filter.'}
                    hint={data.length === 0 ? 'Track every application here; plan items can reference them.' : undefined}
                    action={data.length === 0 ? <Button onClick={() => setAdding(true)}>Add your first application</Button> : undefined}
                />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <th className="px-4 py-2.5 font-medium">Company</th>
                            <th className="px-4 py-2.5 font-medium">Role</th>
                            <th className="px-4 py-2.5 font-medium">Status</th>
                            <th className="px-4 py-2.5 font-medium">Source</th>
                            <th className="px-4 py-2.5 font-medium">Salary</th>
                            <th className="px-4 py-2.5 font-medium">Applied</th>
                            <th className="px-4 py-2.5 font-medium"><span className="sr-only">Actions</span></th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((app) => (
                            <tr key={app.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                                <td className="px-4 py-2.5 font-medium text-gray-900">
                                    {app.jobUrl ? (
                                        <a href={app.jobUrl} target="_blank" rel="noreferrer" className="hover:underline">{app.company}</a>
                                    ) : app.company}
                                    {app.location && <div className="text-xs font-normal text-gray-500">{app.location}</div>}
                                </td>
                                <td className="px-4 py-2.5">{app.role}</td>
                                <td className="px-4 py-2.5"><Pill value={app.status} /></td>
                                <td className="px-4 py-2.5 text-gray-600">{label(app.source)}</td>
                                <td className="px-4 py-2.5 text-gray-600">{formatSalary(app.salaryRangeMin, app.salaryRangeMax)}</td>
                                <td className="px-4 py-2.5 text-gray-600">{formatDate(app.applicationDate)}</td>
                                <td className="px-4 py-2.5 text-right">
                                    <RowActions onEdit={() => setEditing(app)} onDelete={() => setDeleting(app)} />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={isOpen} onClose={close} wide>
                <ApplicationForm
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
                title="Delete application?"
                message={deleting ? `This permanently removes ${deleting.company} — ${deleting.role}.` : undefined}
                isWorking={deleteMut.isPending}
                error={deleteMut.error}
                onConfirm={() => deleting && deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
                onCancel={() => { setDeleting(null); deleteMut.reset() }}
            />
        </div>
    )
}
