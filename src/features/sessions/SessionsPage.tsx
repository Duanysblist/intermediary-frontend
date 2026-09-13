import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { certifications, fitnessSessions, studySessions } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { FitnessSessionForm, StudySessionForm } from './SessionForms'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, RowActions } from '../../components/ui/Page'
import { addDays, formatDate, formatDateTime, formatMinutes, startOfWeek, todayISO } from '../../lib/format'
import type { FitnessSession, FitnessSessionInput, StudySession, StudySessionInput } from '../../types'

type Kind = 'study' | 'fitness'

function useKind(): [Kind, (k: Kind) => void] {
    const [params, setParams] = useSearchParams()
    const kind: Kind = params.get('kind') === 'fitness' ? 'fitness' : 'study'
    return [kind, (k) => setParams(k === 'study' ? {} : { kind: k })]
}

/** Group any dated list by calendar day, newest day first. */
function groupByDay<T extends { sessionDate: string }>(items: T[]): [string, T[]][] {
    const map = new Map<string, T[]>()
    for (const it of [...items].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))) {
        const day = it.sessionDate.slice(0, 10)
        map.set(day, [...(map.get(day) ?? []), it])
    }
    return [...map.entries()]
}

function WeekSummary({ items, kindLabel }: { items: { sessionDate: string; durationMinutes: number }[]; kindLabel: string }) {
    const monday = startOfWeek(todayISO())
    const nextMonday = addDays(monday, 7)
    const thisWeek = items.filter((s) => s.sessionDate >= monday && s.sessionDate < nextMonday)
    const minutes = thisWeek.reduce((sum, s) => sum + s.durationMinutes, 0)
    const lastWeek = items.filter((s) => s.sessionDate >= addDays(monday, -7) && s.sessionDate < monday)
    const lastMinutes = lastWeek.reduce((sum, s) => sum + s.durationMinutes, 0)
    return (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card><p className="text-xs uppercase tracking-wide text-gray-500">This week</p><p className="mt-1 text-2xl font-semibold">{formatMinutes(minutes)}</p></Card>
            <Card><p className="text-xs uppercase tracking-wide text-gray-500">Sessions</p><p className="mt-1 text-2xl font-semibold">{thisWeek.length}</p></Card>
            <Card><p className="text-xs uppercase tracking-wide text-gray-500">Last week</p><p className="mt-1 text-2xl font-semibold">{formatMinutes(lastMinutes)}</p></Card>
            <Card><p className="text-xs uppercase tracking-wide text-gray-500">All time</p><p className="mt-1 text-2xl font-semibold">{items.length} <span className="text-sm font-normal text-gray-500">{kindLabel}</span></p></Card>
        </div>
    )
}

export default function SessionsPage() {
    const [kind, setKind] = useKind()
    return (
        <div>
            <PageHeader
                title="Sessions"
                subtitle="What actually happened. Log it as it happens; the plan is compared against this."
            />
            <div className="mb-6 inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm shadow-xs" role="tablist">
                {(['study', 'fitness'] as Kind[]).map((k) => (
                    <button
                        key={k}
                        role="tab"
                        aria-selected={kind === k}
                        onClick={() => setKind(k)}
                        className={`rounded-md px-4 py-1.5 font-medium transition-colors ${kind === k ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {k === 'study' ? 'Study' : 'Fitness'}
                    </button>
                ))}
            </div>
            {kind === 'study' ? <StudyLog /> : <FitnessLog />}
        </div>
    )
}

function StudyLog() {
    const { data, isPending, isError, error } = studySessions.useList()
    const certs = certifications.useList()
    const createMut = studySessions.useCreate()
    const updateMut = studySessions.useUpdate()
    const deleteMut = studySessions.useRemove()
    const [adding, setAdding] = useState(false)
    const [editing, setEditing] = useState<StudySession | null>(null)
    const [deleting, setDeleting] = useState<StudySession | null>(null)

    const certName = useMemo(() => new Map((certs.data ?? []).map((c) => [c.id, c.name])), [certs.data])
    const groups = useMemo(() => groupByDay(data ?? []), [data])

    function close() { setAdding(false); setEditing(null); createMut.reset(); updateMut.reset() }
    function handleSubmit(input: StudySessionInput) {
        if (editing) updateMut.mutate({ id: editing.id, body: input }, { onSuccess: close })
        else createMut.mutate(input, { onSuccess: close })
    }

    if (isPending) return <LoadingState what="study sessions" />
    if (isError) return <ErrorState what="study sessions" error={error} />

    return (
        <div>
            <WeekSummary items={data} kindLabel="sessions" />
            <div className="mb-3 flex justify-end"><Button onClick={() => setAdding(true)}>+ Log study session</Button></div>
            {groups.length === 0 ? (
                <EmptyState title="No study sessions logged." hint="Log the first one; it takes ten seconds." />
            ) : (
                <div className="space-y-5">
                    {groups.map(([day, items]) => (
                        <section key={day}>
                            <h3 className="mb-2 text-sm font-medium text-gray-500">
                                {formatDate(day)} · {formatMinutes(items.reduce((s, i) => s + i.durationMinutes, 0))}
                            </h3>
                            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-xs">
                                {items.map((s) => (
                                    <li key={s.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                                        <span className="w-20 shrink-0 tabular-nums text-gray-500">{formatDateTime(s.sessionDate).split(', ').pop()}</span>
                                        <span className="w-16 shrink-0 font-medium">{formatMinutes(s.durationMinutes)}</span>
                                        <span className="min-w-0 flex-1 truncate text-gray-700">
                                            {s.certificationId != null && (
                                                <span className="mr-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">{certName.get(s.certificationId) ?? `Certification #${s.certificationId}`}</span>
                                            )}
                                            {s.notes ?? <span className="text-gray-400">No notes</span>}
                                        </span>
                                        <RowActions onEdit={() => setEditing(s)} onDelete={() => setDeleting(s)} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
            <Modal open={adding || editing !== null} onClose={close}>
                <StudySessionForm key={editing?.id ?? 'new'} initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={close}
                                  isSaving={createMut.isPending || updateMut.isPending} error={createMut.error || updateMut.error} />
            </Modal>
            <ConfirmDialog open={deleting !== null} title="Delete study session?" isWorking={deleteMut.isPending} error={deleteMut.error}
                           onConfirm={() => deleting && deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
                           onCancel={() => { setDeleting(null); deleteMut.reset() }} />
        </div>
    )
}

function FitnessLog() {
    const { data, isPending, isError, error } = fitnessSessions.useList()
    const createMut = fitnessSessions.useCreate()
    const updateMut = fitnessSessions.useUpdate()
    const deleteMut = fitnessSessions.useRemove()
    const [adding, setAdding] = useState(false)
    const [editing, setEditing] = useState<FitnessSession | null>(null)
    const [deleting, setDeleting] = useState<FitnessSession | null>(null)

    const groups = useMemo(() => groupByDay(data ?? []), [data])

    function close() { setAdding(false); setEditing(null); createMut.reset(); updateMut.reset() }
    function handleSubmit(input: FitnessSessionInput) {
        if (editing) updateMut.mutate({ id: editing.id, body: input }, { onSuccess: close })
        else createMut.mutate(input, { onSuccess: close })
    }

    if (isPending) return <LoadingState what="workouts" />
    if (isError) return <ErrorState what="workouts" error={error} />

    return (
        <div>
            <WeekSummary items={data} kindLabel="workouts" />
            <div className="mb-3 flex justify-end"><Button onClick={() => setAdding(true)}>+ Log workout</Button></div>
            {groups.length === 0 ? (
                <EmptyState title="No workouts logged." hint="Log the first one; it takes ten seconds." />
            ) : (
                <div className="space-y-5">
                    {groups.map(([day, items]) => (
                        <section key={day}>
                            <h3 className="mb-2 text-sm font-medium text-gray-500">
                                {formatDate(day)} · {formatMinutes(items.reduce((s, i) => s + i.durationMinutes, 0))}
                            </h3>
                            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-xs">
                                {items.map((s) => (
                                    <li key={s.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                                        <span className="w-20 shrink-0 tabular-nums text-gray-500">{formatDateTime(s.sessionDate).split(', ').pop()}</span>
                                        <span className="w-16 shrink-0 font-medium">{formatMinutes(s.durationMinutes)}</span>
                                        <Pill value={s.workoutType} />
                                        <span className="min-w-0 flex-1 truncate text-gray-700">{s.notes ?? <span className="text-gray-400">No notes</span>}</span>
                                        <RowActions onEdit={() => setEditing(s)} onDelete={() => setDeleting(s)} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
            <Modal open={adding || editing !== null} onClose={close}>
                <FitnessSessionForm key={editing?.id ?? 'new'} initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={close}
                                    isSaving={createMut.isPending || updateMut.isPending} error={createMut.error || updateMut.error} />
            </Modal>
            <ConfirmDialog open={deleting !== null} title="Delete workout?" isWorking={deleteMut.isPending} error={deleteMut.error}
                           onConfirm={() => deleting && deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
                           onCancel={() => { setDeleting(null); deleteMut.reset() }} />
        </div>
    )
}
