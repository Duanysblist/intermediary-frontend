import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { certifications, fitnessSessions, planItems, studySessions, usePlanEvents } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import Button from '../../components/ui/Button'
import { Card, ErrorState, LoadingState, PageHeader, SectionTitle } from '../../components/ui/Page'
import { addDays, formatDate, formatMinutes, isInWeek, startOfWeek, toLocalISO, todayISO } from '../../lib/format'
import { PLAN_INTENTS, isOpenPlanItem, type PlanIntent, type PlanItem } from '../../types'
import Icon from '../../components/ui/Icon'

/**
 * Weekly review: the "did reality match intention?" questions the data model exists to answer.
 * Everything here is derived from plan items, sessions and the audit log; nothing is stored.
 */
export default function ReviewPage() {
    const [params, setParams] = useSearchParams()
    const thisMonday = startOfWeek(todayISO())
    const monday = params.get('week') ?? thisMonday
    const setWeek = (m: string) => setParams(m === thisMonday ? {} : { week: m })

    const plan = planItems.useList()
    const study = studySessions.useList()
    const fitness = fitnessSessions.useList()
    const certs = certifications.useList()
    const events = usePlanEvents()

    const stats = useMemo(() => {
        if (!plan.data || !study.data || !fitness.data || !certs.data || !events.data) return null
        const inWeek = (iso: string | null | undefined) => isInWeek(iso, monday)
        const weekEvents = events.data.filter((e) => inWeek(toLocalISO(e.eventTime)))
        const titleOf = new Map(plan.data.map((p) => [p.id, p]))

        // Intended for this week: dated in the week, or completed in the week regardless of date.
        const doneIds = new Set(weekEvents.filter((e) => e.toStatus === 'DONE').map((e) => e.planItemId))
        const intended = plan.data.filter((p) => inWeek(p.targetDate) || doneIds.has(p.id))
        const done = intended.filter((p) => p.status === 'DONE' || doneIds.has(p.id))
        const deferred = weekEvents.filter((e) => e.toStatus === 'DEFERRED').map((e) => titleOf.get(e.planItemId)).filter((p): p is PlanItem => !!p)
        const canceled = weekEvents.filter((e) => e.toStatus === 'CANCELED').map((e) => titleOf.get(e.planItemId)).filter((p): p is PlanItem => !!p)
        const carried = intended.filter((p) => isOpenPlanItem(p) && p.targetDate != null && p.targetDate < todayISO())

        const byIntent = PLAN_INTENTS.map((intent) => ({
            intent,
            planned: intended.filter((p) => p.intent === intent).length,
            done: done.filter((p) => p.intent === intent).length,
        })).filter((r) => r.planned > 0 || r.done > 0)

        const studyWeek = study.data.filter((s) => inWeek(s.sessionDate))
        const fitnessWeek = fitness.data.filter((s) => inWeek(s.sessionDate))
        const studyMinutes = studyWeek.reduce((n, s) => n + s.durationMinutes, 0)
        const fitnessMinutes = fitnessWeek.reduce((n, s) => n + s.durationMinutes, 0)
        const perCert = certs.data
            .map((c) => ({ cert: c, minutes: studyWeek.filter((s) => s.certificationId === c.id).reduce((n, s) => n + s.durationMinutes, 0) }))
            .filter((r) => r.minutes > 0)
            .sort((a, b) => b.minutes - a.minutes)

        // All-time: which intentions keep getting pushed?
        const deferCounts = new Map<number, number>()
        for (const e of events.data) if (e.toStatus === 'DEFERRED') deferCounts.set(e.planItemId, (deferCounts.get(e.planItemId) ?? 0) + 1)
        const mostDeferred = [...deferCounts.entries()]
            .map(([id, n]) => ({ item: titleOf.get(id), n }))
            .filter((r): r is { item: PlanItem; n: number } => !!r.item)
            .sort((a, b) => b.n - a.n)
            .slice(0, 5)

        const completion = intended.length === 0 ? null : Math.round((done.length / intended.length) * 100)
        return { intended, done, deferred, canceled, carried, byIntent, studyWeek, fitnessWeek, studyMinutes, fitnessMinutes, perCert, mostDeferred, completion }
    }, [plan.data, study.data, fitness.data, certs.data, events.data, monday])

    const failed = [plan, study, fitness, certs, events].find((q) => q.isError)
    if (failed?.isError) return <ErrorState what="the review" error={failed.error} />
    if (!stats) return <LoadingState what="review" />

    const intentPlanned = (i: PlanIntent) => stats.byIntent.find((r) => r.intent === i)

    return (
        <div>
            <PageHeader
                title="Weekly review"
                subtitle={`${formatDate(monday)} – ${formatDate(addDays(monday, 6))} · what you meant to do versus what happened`}
                actions={
                    <div className="flex gap-1">
                        <Button variant="secondary" size="sm" onClick={() => setWeek(addDays(monday, -7))}><Icon name="chevronLeft" className="h-4 w-4" />Prev</Button>
                        <Button variant="secondary" size="sm" onClick={() => setWeek(thisMonday)} disabled={monday === thisMonday}>This week</Button>
                        <Button variant="secondary" size="sm" onClick={() => setWeek(addDays(monday, 7))} disabled={monday >= thisMonday}>Next<Icon name="chevronRight" className="h-4 w-4" /></Button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card><p className="text-xs text-muted">Completion</p><p className={`mt-1 text-2xl font-semibold tabular-nums ${stats.completion == null ? 'text-faint' : stats.completion >= 70 ? 'text-ok' : stats.completion >= 40 ? 'text-warn' : 'text-danger'}`}>{stats.completion == null ? '—' : `${stats.completion}%`}</p><p className="mt-0.5 text-xs text-muted">{stats.done.length} of {stats.intended.length} intended</p></Card>
                <Card><p className="text-xs text-muted">Deferred</p><p className="mt-1 text-2xl font-semibold tabular-nums">{stats.deferred.length}</p><p className="mt-0.5 text-xs text-muted">{stats.canceled.length} canceled</p></Card>
                <Card><p className="text-xs text-muted">Study</p><p className="mt-1 text-2xl font-semibold tabular-nums text-accent">{formatMinutes(stats.studyMinutes)}</p><p className="mt-0.5 text-xs text-muted">{stats.studyWeek.length} sessions · {intentPlanned('STUDY')?.planned ?? 0} planned</p></Card>
                <Card><p className="text-xs text-muted">Fitness</p><p className="mt-1 text-2xl font-semibold tabular-nums text-accent">{formatMinutes(stats.fitnessMinutes)}</p><p className="mt-0.5 text-xs text-muted">{stats.fitnessWeek.length} workouts · {intentPlanned('EXERCISE')?.planned ?? 0} planned</p></Card>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <section className="min-w-0">
                    <SectionTitle>Planned vs done, by intent</SectionTitle>
                    {stats.byIntent.length === 0 ? (
                        <Card><p className="text-sm text-muted">Nothing was scheduled for this week.</p></Card>
                    ) : (
                        <Card>
                            <ul className="space-y-3">
                                {stats.byIntent.map((r) => (
                                    <li key={r.intent}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <Pill value={r.intent} />
                                            <span className="tabular-nums text-ink-2">{r.done} / {r.planned}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-sunken">
                                            <div className="h-full rounded-full bg-accent" style={{ width: `${r.planned ? Math.min(100, (r.done / r.planned) * 100) : 0}%` }} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    <SectionTitle>Study by certification</SectionTitle>
                    {stats.perCert.length === 0 ? (
                        <Card><p className="text-sm text-muted">No study sessions logged this week.</p></Card>
                    ) : (
                        <ul className="divide-y divide-rule rounded-xl bg-surface">
                            {stats.perCert.map(({ cert, minutes }) => (
                                <li key={cert.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span className="min-w-0 truncate text-ink">{cert.name}</span>
                                    <span className="ml-3 shrink-0 tabular-nums text-ink-2">{formatMinutes(minutes)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="min-w-0">
                    <SectionTitle>Still open from this week</SectionTitle>
                    {stats.carried.length === 0 ? (
                        <Card><p className="text-sm text-muted">Nothing slipped. Everything dated this week is done or still ahead.</p></Card>
                    ) : (
                        <ul className="divide-y divide-rule rounded-xl bg-surface">
                            {stats.carried.map((p) => (
                                <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                    <span className="min-w-0 flex-1 truncate text-ink">{p.title}</span>
                                    <span className="text-xs text-muted">{formatDate(p.targetDate)}</span>
                                    <Pill value={p.status} />
                                </li>
                            ))}
                        </ul>
                    )}

                    <SectionTitle>Deferred most often (all time)</SectionTitle>
                    {stats.mostDeferred.length === 0 ? (
                        <Card><p className="text-sm text-muted">Nothing has been deferred yet.</p></Card>
                    ) : (
                        <ul className="divide-y divide-rule rounded-xl bg-surface">
                            {stats.mostDeferred.map(({ item, n }) => (
                                <li key={item.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                    <span className="min-w-0 flex-1 truncate text-ink">{item.title}</span>
                                    <span className="text-xs text-muted">{n}×</span>
                                    <Pill value={item.status} />
                                </li>
                            ))}
                        </ul>
                    )}

                    {(stats.deferred.length > 0 || stats.canceled.length > 0) && (
                        <>
                            <SectionTitle>Dropped this week</SectionTitle>
                            <ul className="divide-y divide-rule rounded-xl bg-surface">
                                {stats.deferred.map((p) => (
                                    <li key={`d${p.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm"><span className="min-w-0 flex-1 truncate">{p.title}</span><Pill value="DEFERRED" /></li>
                                ))}
                                {stats.canceled.map((p) => (
                                    <li key={`c${p.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm"><span className="min-w-0 flex-1 truncate">{p.title}</span><Pill value="CANCELED" /></li>
                                ))}
                            </ul>
                        </>
                    )}
                </section>
            </div>

            <p className="mt-8 text-center text-xs text-muted">
                Want a second opinion? The <Link to="/prompt" className="text-accent hover:underline">Prompt</Link> page can send this week to Claude.
            </p>
        </div>
    )
}
