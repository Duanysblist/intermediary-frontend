import { useMemo, useState } from 'react'
import { certifications, studySessions } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import CertificationForm from './CertificationForm'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, RowActions } from '../../components/ui/Page'
import { formatDate, formatMinutes, relativeDay } from '../../lib/format'
import { CERTIFICATION_STATUSES, type Certification, type CertificationInput } from '../../types'

export default function CertificationsPage() {
    const { data, isPending, isError, error } = certifications.useList()
    const sessionsQuery = studySessions.useList()
    const createMut = certifications.useCreate()
    const updateMut = certifications.useUpdate()
    const deleteMut = certifications.useRemove()

    const [adding, setAdding] = useState(false)
    const [editing, setEditing] = useState<Certification | null>(null)
    const [deleting, setDeleting] = useState<Certification | null>(null)

    // Minutes logged per certification, from the reality side of the model.
    const loggedMinutes = useMemo(() => {
        const m = new Map<number, number>()
        for (const s of sessionsQuery.data ?? []) {
            if (s.certificationId != null) m.set(s.certificationId, (m.get(s.certificationId) ?? 0) + s.durationMinutes)
        }
        return m
    }, [sessionsQuery.data])

    const sorted = useMemo(() => {
        const order = new Map(CERTIFICATION_STATUSES.map((s, i) => [s, i]))
        return [...(data ?? [])].sort((a, b) => {
            const byStatus = (order.get(a.status) ?? 0) - (order.get(b.status) ?? 0)
            if (byStatus !== 0) return byStatus
            return (a.examDate ?? '9999').localeCompare(b.examDate ?? '9999')
        })
    }, [data])

    function close() { setAdding(false); setEditing(null); createMut.reset(); updateMut.reset() }
    function handleSubmit(input: CertificationInput) {
        if (editing) updateMut.mutate({ id: editing.id, body: input }, { onSuccess: close })
        else createMut.mutate(input, { onSuccess: close })
    }

    if (isPending) return <LoadingState what="certifications" />
    if (isError) return <ErrorState what="certifications" error={error} />

    return (
        <div>
            <PageHeader
                title="Certifications"
                subtitle="What you're studying for, and the exams on the calendar."
                actions={<Button onClick={() => setAdding(true)}>+ Add</Button>}
            />

            {sorted.length === 0 ? (
                <EmptyState
                    title="No certifications yet."
                    hint="Add one, then log study sessions against it to see real hours accumulate."
                    action={<Button onClick={() => setAdding(true)}>Add a certification</Button>}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sorted.map((c) => {
                        const logged = loggedMinutes.get(c.id)
                        return (
                            <Card key={c.id} className="flex flex-col">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="truncate font-medium text-gray-900" title={c.name}>{c.name}</h3>
                                        <p className="text-sm text-gray-500">{c.vendor}</p>
                                    </div>
                                    <Pill value={c.status} />
                                </div>
                                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                                    <dt className="text-gray-500">Exam</dt>
                                    <dd className="text-gray-900">
                                        {c.examDate ? (
                                            <>
                                                {formatDate(c.examDate)}
                                                <span className="ml-1 text-xs text-gray-500">({relativeDay(c.examDate)})</span>
                                            </>
                                        ) : '—'}
                                    </dd>
                                    <dt className="text-gray-500">Hours studied</dt>
                                    <dd className="text-gray-900">{c.hoursStudied ?? '—'}</dd>
                                    <dt className="text-gray-500">Logged sessions</dt>
                                    <dd className="text-gray-900">{logged ? formatMinutes(logged) : '—'}</dd>
                                </dl>
                                {c.notes && <p className="mt-3 line-clamp-3 text-sm text-gray-600">{c.notes}</p>}
                                <div className="mt-auto pt-4 text-right">
                                    <RowActions onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} />
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Modal open={adding || editing !== null} onClose={close}>
                <CertificationForm
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
                title="Delete certification?"
                message={deleting ? `This permanently removes ${deleting.name}. Study sessions that reference it keep their id but lose the link.` : undefined}
                isWorking={deleteMut.isPending}
                error={deleteMut.error}
                onConfirm={() => deleting && deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
                onCancel={() => { setDeleting(null); deleteMut.reset() }}
            />
        </div>
    )
}
