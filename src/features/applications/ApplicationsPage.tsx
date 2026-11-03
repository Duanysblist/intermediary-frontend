import { useMemo, useState } from 'react'
import { applications } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ApplicationForm from './ApplicationForm'
import { EmptyState, ErrorState, LoadingState, PageHeader, RowActions } from '../../components/ui/Page'
import { formatDate, formatDateTime, formatSalary, isLink, todayISO } from '../../lib/format'
import { APPLICATION_STATUSES, label, type Application, type ApplicationInput, type ApplicationStatus } from '../../types'
import Icon from '../../components/ui/Icon'

const CLOSED: ApplicationStatus[] = ['REJECTED', 'WITHDRAWN', 'GHOSTED']

export default function ApplicationsPage() {
    const { data, isPending, isError, error } = applications.useList()
    const createMut = applications.useCreate()
    const updateMut = applications.useUpdate()
    const deleteMut = applications.useRemove()

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
    const today = todayISO()

    return (
        <div>
            <PageHeader
                title="Applications"
                subtitle={`${activeCount} active · ${data.length} total`}
                actions={
                    <>
                        <select
                            aria-label="Filter by status"
                            className="min-h-11 rounded-[10px] border border-rule-strong bg-surface px-2.5 text-base sm:min-h-0 sm:py-1.5 sm:text-sm"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as typeof filter)}
                        >
                            <option value="active">Active</option>
                            <option value="all">All</option>
                            {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                        </select>
                        <Button onClick={() => setAdding(true)}><Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />Add</Button>
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
                <>
                <ul className="divide-y divide-rule rounded-xl bg-surface md:hidden">
                    {rows.map((app) => {
                        const late = !CLOSED.includes(app.status) && app.nextActionDate != null && app.nextActionDate < today
                        return (
                            <li key={app.id}>
                                <button type="button" onClick={() => setEditing(app)} className="block w-full px-4 py-3 text-left focus-visible:-outline-offset-2">
                                    <span className="flex items-start justify-between gap-3">
                                        <span className="min-w-0">
                                            <span className="block font-medium text-ink">{app.company}</span>
                                            <span className="block text-sm text-ink-2">{app.role}</span>
                                        </span>
                                        <Pill value={app.status} className="shrink-0" />
                                    </span>
                                    <span className="mt-1 block text-xs text-muted">
                                        {app.interviewAt ? <span className="text-ink">Interview {formatDateTime(app.interviewAt)} · </span> : null}
                                        {app.nextActionDate ? <span className={late ? 'font-medium text-danger' : ''}>Next {formatDate(app.nextActionDate)}{late ? ', overdue' : ''} · </span> : null}
                                        Applied {formatDate(app.applicationDate)}
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
                <div className="hidden overflow-x-auto rounded-xl bg-surface md:block">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-rule bg-page text-left text-xs text-muted">
                            <th className="px-4 py-2.5 font-medium">Company</th>
                            <th className="px-4 py-2.5 font-medium">Role</th>
                            <th className="px-4 py-2.5 font-medium">Status</th>
                            <th className="px-4 py-2.5 font-medium">Next step</th>
                            <th className="px-4 py-2.5 font-medium">Source</th>
                            <th className="px-4 py-2.5 font-medium">Salary</th>
                            <th className="px-4 py-2.5 font-medium">Applied</th>
                            <th className="px-4 py-2.5 font-medium"><span className="sr-only">Actions</span></th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((app) => (
                            <tr key={app.id} className="border-b border-rule last:border-0 hover:bg-page/60">
                                <td className="px-4 py-2.5 font-medium text-ink">
                                    {app.jobUrl && isLink(app.jobUrl) ? (
                                        <a href={app.jobUrl} target="_blank" rel="noreferrer" className="hover:underline">{app.company}</a>
                                    ) : app.company}
                                    {app.location && <div className="text-xs font-normal text-muted">{app.location}</div>}
                                </td>
                                <td className="px-4 py-2.5">
                                    {app.role}
                                    {app.contactName && <div className="text-xs text-muted">Contact: {app.contactName}</div>}
                                </td>
                                <td className="px-4 py-2.5"><Pill value={app.status} /></td>
                                <td className="px-4 py-2.5 text-ink-2">
                                    {app.interviewAt && <div className="text-ink">Interview {formatDateTime(app.interviewAt)}</div>}
                                    {app.nextActionDate && (
                                        <div className={!CLOSED.includes(app.status) && app.nextActionDate < today ? 'font-medium text-danger' : ''}>
                                            {formatDate(app.nextActionDate)}{!CLOSED.includes(app.status) && app.nextActionDate < today ? ' · overdue' : ''}
                                        </div>
                                    )}
                                    {!app.interviewAt && !app.nextActionDate && '—'}
                                </td>
                                <td className="px-4 py-2.5 text-ink-2">{label(app.source)}</td>
                                <td className="px-4 py-2.5 text-ink-2">{formatSalary(app.salaryRangeMin, app.salaryRangeMax)}</td>
                                <td className="px-4 py-2.5 text-ink-2">{formatDate(app.applicationDate)}</td>
                                <td className="px-4 py-2.5 text-right">
                                    <RowActions onEdit={() => setEditing(app)} onDelete={() => setDeleting(app)} />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </>
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
                {editing && (
                    <button type="button" onClick={() => { const target = editing; close(); setDeleting(target) }}
                            className="mt-4 min-h-11 text-sm text-danger hover:underline md:hidden">Delete this application</button>
                )}
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
