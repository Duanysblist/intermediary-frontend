import { useState } from 'react'
import { Link } from 'react-router'
import { applications, certifications, fitnessSessions, planItems, studySessions, usePlanEvents } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Card, ErrorState, LoadingState, PageHeader, SectionTitle } from '../../components/ui/Page'
import PlanItemSheet from '../plan/PlanItemSheet'
import { useMovePlanItem } from '../plan/usePlanBoard'
import { useReferenceOptions } from '../plan/references'
import { FitnessSessionForm, StudySessionForm } from '../sessions/SessionForms'
import { formatDateTime, formatMinutes, isBefore, isInWeek, parseLocal, relativeDay, startOfWeek, toLocalISO, todayISO } from '../../lib/format'
import { isOpenPlanItem, label, type PlanItem, type PlanItemStatus } from '../../types'

// Today reads top to bottom as work order: what is under way, what is next, then what is finished or dropped.
const TODAY_ORDER: PlanItemStatus[] = ['IN_PROGRESS', 'PLANNED', 'DONE', 'DEFERRED', 'CANCELED']
function byTodayOrder(a: PlanItem, b: PlanItem) {
    const unplaced = Number.MAX_SAFE_INTEGER
    return TODAY_ORDER.indexOf(a.status) - TODAY_ORDER.indexOf(b.status) || (a.position ?? unplaced) - (b.position ?? unplaced) || a.id - b.id
}

function TaskRow({ item, meta, late, onOpen, onToggle }: { item: PlanItem; meta: string | null; late?: boolean; onOpen: () => void; onToggle: () => void }) {
    const done = item.status === 'DONE'
    const dropped = item.status === 'CANCELED' || item.status === 'DEFERRED'
    return (
        <li className="flex items-center gap-1">
            <button type="button" onClick={onOpen} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 pl-4 text-left focus-visible:-outline-offset-2">
                <span className="min-w-0 flex-1">
                    <span className={`block text-base font-medium leading-snug sm:text-sm ${done || dropped ? 'text-muted line-through' : 'text-ink'}`}>{item.title}</span>
                    <span className={`mt-0.5 block truncate text-xs ${late ? 'font-medium text-danger' : 'text-muted'}`}>
                        {[late ? `Due ${relativeDay(item.targetDate)}` : item.status === 'PLANNED' ? null : label(item.status), meta].filter(Boolean).join(' · ') || label(item.intent)}
                    </span>
                </span>
                <Pill value={item.intent} className="shrink-0" />
            </button>
            <button
                type="button"
                onClick={onToggle}
                aria-pressed={done}
                aria-label={done ? `Mark “${item.title}” not done` : `Mark “${item.title}” done`}
                className="grid h-14 w-14 shrink-0 place-items-center focus-visible:-outline-offset-4"
            >
                <span className={`grid h-7 w-7 place-items-center rounded-md border-2 transition-colors ${done ? 'border-ok bg-ok text-surface' : 'border-rule-strong text-transparent'}`}>
                    <Icon name="check" className="h-4 w-4" strokeWidth={3} />
                </span>
            </button>
        </li>
    )
}

function Stat({ label: text, value, sub, to, tone }: { label: string; value: string | number; sub?: string; to: string; tone?: 'danger' | 'ok' | 'accent' }) {
    const color = tone === 'danger' ? 'text-danger' : tone === 'ok' ? 'text-ok' : tone === 'accent' ? 'text-accent' : 'text-ink'
    return (
        <Link to={to} className="block rounded-xl border border-rule bg-surface p-3 shadow-xs transition-colors hover:border-rule-strong sm:p-4">
            <p className="text-xs text-muted">{text}</p>
            <p className={`mt-0.5 text-xl font-semibold tabular-nums sm:text-2xl ${color}`}>{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
        </Link>
    )
}

export default function TodayPage() {
    const plan = planItems.useList()
    const study = studySessions.useList()
    const fitness = fitnessSessions.useList()
    const apps = applications.useList()
    const certs = certifications.useList()
    const events = usePlanEvents()
    const moveMut = useMovePlanItem()
    const createStudy = studySessions.useCreate()
    const createFitness = fitnessSessions.useCreate()
    const { labelFor } = useReferenceOptions()
    const [selected, setSelected] = useState<PlanItem | null>(null)
    const [logging, setLogging] = useState<'study' | 'fitness' | null>(null)

    const queries = [plan, study, fitness, apps, certs, events]
    const failed = queries.find((q) => q.isError)
    if (failed?.isError) return <ErrorState what="today" error={failed.error} />
    if (queries.some((q) => q.isPending) || !plan.data || !study.data || !fitness.data || !apps.data || !certs.data || !events.data) {
        return <LoadingState what="today" />
    }

    const today = todayISO()
    const monday = startOfWeek(today)
    const inThisWeek = (iso: string | null) => isInWeek(iso, monday)

    const open = plan.data.filter(isOpenPlanItem)
    const overdue = open.filter((p) => p.targetDate != null && isBefore(p.targetDate, today)).sort((a, b) => a.targetDate!.localeCompare(b.targetDate!))
    const todays = plan.data.filter((p) => p.targetDate === today).sort(byTodayOrder)
    const left = todays.filter(isOpenPlanItem).length
    const doneToday = todays.filter((p) => p.status === 'DONE').length
    const upcoming = open
        .filter((p) => p.targetDate != null && p.targetDate > today)
        .sort((a, b) => a.targetDate!.localeCompare(b.targetDate!))
        .slice(0, 6)

    const studyToday = study.data.filter((s) => s.sessionDate.startsWith(today)).reduce((n, s) => n + s.durationMinutes, 0)
    const fitnessToday = fitness.data.filter((s) => s.sessionDate.startsWith(today)).reduce((n, s) => n + s.durationMinutes, 0)
    const dueThisWeek = open.filter((p) => inThisWeek(p.targetDate))
    const doneThisWeek = events.data.filter((e) => e.toStatus === 'DONE' && inThisWeek(toLocalISO(e.eventTime)))
    const studyWeek = study.data.filter((s) => inThisWeek(s.sessionDate))
    const fitnessWeek = fitness.data.filter((s) => inThisWeek(s.sessionDate))
    const plannedStudy = plan.data.filter((p) => p.intent === 'STUDY' && inThisWeek(p.targetDate)).length
    const plannedExercise = plan.data.filter((p) => p.intent === 'EXERCISE' && inThisWeek(p.targetDate)).length
    const activeApps = apps.data.filter((a) => !['REJECTED', 'WITHDRAWN', 'GHOSTED'].includes(a.status))
    const interviewing = activeApps.filter((a) => a.status === 'INTERVIEWING' || a.status === 'OFFER')
    const nextExam = [...certs.data]
        .filter((c) => c.examDate != null && !isBefore(c.examDate, today) && c.status !== 'PASSED')
        .sort((a, b) => a.examDate!.localeCompare(b.examDate!))[0]

    const titleOf = new Map(plan.data.map((p) => [p.id, p.title]))
    const recent = [...events.data].sort((a, b) => b.eventTime.localeCompare(a.eventTime)).slice(0, 6)
    const meta = (p: PlanItem) => labelFor(p.referenceEntityType, p.referenceEntityId)
    const toggle = (p: PlanItem) => moveMut.mutate({ item: p, patch: { status: p.status === 'DONE' ? 'PLANNED' : 'DONE' } })

    const logged = [studyToday && `${formatMinutes(studyToday)} studied`, fitnessToday && `${formatMinutes(fitnessToday)} trained`].filter(Boolean)
    const summary = todays.length === 0 ? 'Nothing planned for today' : [`${left} to go`, `${doneToday} done`, ...logged].join(' · ')

    return (
        <div>
            <PageHeader
                title="Today"
                subtitle={`${parseLocal(today).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · ${summary}`}
            />

            {moveMut.isError && (
                <p className="mb-3 rounded-lg border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger" role="alert">
                    Couldn't save that: {moveMut.error.message}
                </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <div className="min-w-0 space-y-6">
                    {overdue.length > 0 && (
                        <section>
                            <SectionTitle><span className="text-danger">Running late</span></SectionTitle>
                            <ul className="divide-y divide-rule rounded-xl border border-danger/30 bg-surface shadow-xs">
                                {overdue.map((p) => (
                                    <TaskRow key={p.id} item={p} meta={meta(p)} late onOpen={() => setSelected(p)} onToggle={() => toggle(p)} />
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <SectionTitle aside={<Link to="/plan?view=week" className="py-1 text-xs text-accent hover:underline">Week view</Link>}>Today</SectionTitle>
                        {todays.length === 0 ? (
                            <Card><p className="text-sm text-muted">Nothing is dated today. Items you give today's date on the <Link to="/plan" className="text-accent underline">Plan</Link> land here.</p></Card>
                        ) : (
                            <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface shadow-xs">
                                {todays.map((p) => (
                                    <TaskRow key={p.id} item={p} meta={meta(p)} onOpen={() => setSelected(p)} onToggle={() => toggle(p)} />
                                ))}
                            </ul>
                        )}
                    </section>

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" onClick={() => setLogging('study')}><Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />Log study</Button>
                        <Button variant="secondary" onClick={() => setLogging('fitness')}><Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />Log workout</Button>
                    </div>

                    {upcoming.length > 0 && (
                        <section>
                            <SectionTitle>Coming up</SectionTitle>
                            <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface shadow-xs">
                                {upcoming.map((p) => (
                                    <li key={p.id}>
                                        <button type="button" onClick={() => setSelected(p)} className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm focus-visible:-outline-offset-2">
                                            <span className="w-20 shrink-0 text-xs text-muted">{relativeDay(p.targetDate)}</span>
                                            <span className="min-w-0 flex-1 truncate text-ink">{p.title}</span>
                                            <Pill value={p.intent} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <div className="min-w-0 space-y-6">
                    <section>
                        <SectionTitle>This week</SectionTitle>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <Stat label="Due this week" value={dueThisWeek.length} sub={`${open.length} open in all`} to="/plan" />
                            <Stat label="Done this week" value={doneThisWeek.length} tone={doneThisWeek.length ? 'ok' : undefined} sub="marked done" to="/review" />
                            <Stat label="Study" value={formatMinutes(studyWeek.reduce((n, s) => n + s.durationMinutes, 0))} sub={`${studyWeek.length} logged · ${plannedStudy} planned`} to="/sessions" tone="accent" />
                            <Stat label="Fitness" value={formatMinutes(fitnessWeek.reduce((n, s) => n + s.durationMinutes, 0))} sub={`${fitnessWeek.length} logged · ${plannedExercise} planned`} to="/sessions?kind=fitness" tone="accent" />
                            <Stat label="Applications" value={activeApps.length} sub={`${interviewing.length} interviewing or offer`} to="/applications" />
                            <Stat label="Next exam" value={nextExam ? relativeDay(nextExam.examDate) : '—'} sub={nextExam ? nextExam.name : 'none scheduled'} to="/certifications" />
                        </div>
                    </section>

                    <section>
                        <SectionTitle>Recent changes</SectionTitle>
                        {recent.length === 0 ? (
                            <Card><p className="text-sm text-muted">Status changes on plan items are recorded here automatically.</p></Card>
                        ) : (
                            <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface shadow-xs">
                                {recent.map((e) => (
                                    <li key={e.id} className="px-4 py-2.5 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="min-w-0 truncate text-ink">{titleOf.get(e.planItemId) ?? `Plan item #${e.planItemId}`}</span>
                                            <span className="shrink-0 text-xs text-muted">{formatDateTime(e.eventTime)}</span>
                                        </div>
                                        <div className="mt-0.5 text-xs text-muted">
                                            {e.fromStatus ? label(e.fromStatus) : 'Created'} → <span className="font-medium text-ink-2">{label(e.toStatus)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            {selected && <PlanItemSheet key={selected.id} item={selected} onClose={() => setSelected(null)} />}

            <Modal open={logging !== null} onClose={() => { setLogging(null); createStudy.reset(); createFitness.reset() }}>
                {logging === 'study' && (
                    <StudySessionForm onSubmit={(input) => createStudy.mutate(input, { onSuccess: () => setLogging(null) })} onCancel={() => setLogging(null)}
                                      isSaving={createStudy.isPending} error={createStudy.error} />
                )}
                {logging === 'fitness' && (
                    <FitnessSessionForm onSubmit={(input) => createFitness.mutate(input, { onSuccess: () => setLogging(null) })} onCancel={() => setLogging(null)}
                                        isSaving={createFitness.isPending} error={createFitness.error} />
                )}
            </Modal>
        </div>
    )
}
