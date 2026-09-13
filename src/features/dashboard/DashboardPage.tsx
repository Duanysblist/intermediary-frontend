import { Link } from 'react-router'
import { applications, certifications, fitnessSessions, planItems, studySessions, usePlanEvents } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import { Card, ErrorState, LoadingState, PageHeader, SectionTitle } from '../../components/ui/Page'
import { addDays, formatDate, formatDateTime, formatMinutes, isBefore, relativeDay, startOfWeek, todayISO } from '../../lib/format'
import { label, type PlanItem } from '../../types'

function Stat({ label: text, value, sub, to, tone }: { label: string; value: string | number; sub?: string; to: string; tone?: 'red' | 'blue' | 'green' }) {
    const color = tone === 'red' ? 'text-red-600' : tone === 'green' ? 'text-green-600' : tone === 'blue' ? 'text-blue-600' : 'text-gray-900'
    return (
        <Link to={to} className="block rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-colors hover:border-gray-300">
            <p className="text-xs uppercase tracking-wide text-gray-500">{text}</p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
            {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
        </Link>
    )
}

export default function DashboardPage() {
    const plan = planItems.useList()
    const study = studySessions.useList()
    const fitness = fitnessSessions.useList()
    const apps = applications.useList()
    const certs = certifications.useList()
    const events = usePlanEvents()

    const queries = [plan, study, fitness, apps, certs, events]
    const failed = queries.find((q) => q.isError)
    if (failed?.isError) return <ErrorState what="the dashboard" error={failed.error} />
    if (queries.some((q) => q.isPending) || !plan.data || !study.data || !fitness.data || !apps.data || !certs.data || !events.data) {
        return <LoadingState what="dashboard" />
    }

    const today = todayISO()
    const monday = startOfWeek(today)
    const nextMonday = addDays(monday, 7)
    const inThisWeek = (iso: string | null) => iso != null && iso >= monday && iso < nextMonday

    const isOpen = (p: PlanItem) => p.status === 'PLANNED' || p.status === 'IN_PROGRESS'
    const open = plan.data.filter(isOpen)
    const overdue = open.filter((p) => p.targetDate != null && isBefore(p.targetDate, today))
    const dueThisWeek = open.filter((p) => inThisWeek(p.targetDate))
    const doneThisWeek = events.data.filter((e) => e.toStatus === 'DONE' && inThisWeek(e.eventTime))
    const upcoming = [...open]
        .filter((p) => p.targetDate != null && !isBefore(p.targetDate, today))
        .sort((a, b) => a.targetDate!.localeCompare(b.targetDate!))
        .slice(0, 8)

    const studyWeek = study.data.filter((s) => inThisWeek(s.sessionDate))
    const fitnessWeek = fitness.data.filter((s) => inThisWeek(s.sessionDate))
    const studyMinutes = studyWeek.reduce((n, s) => n + s.durationMinutes, 0)
    const fitnessMinutes = fitnessWeek.reduce((n, s) => n + s.durationMinutes, 0)

    // Plan vs reality: intentions of a kind this week versus sessions actually logged.
    const plannedStudy = plan.data.filter((p) => p.intent === 'STUDY' && inThisWeek(p.targetDate)).length
    const plannedExercise = plan.data.filter((p) => p.intent === 'EXERCISE' && inThisWeek(p.targetDate)).length

    const activeApps = apps.data.filter((a) => !['REJECTED', 'WITHDRAWN', 'GHOSTED'].includes(a.status))
    const interviewing = activeApps.filter((a) => a.status === 'INTERVIEWING' || a.status === 'OFFER')
    const activeCerts = certs.data.filter((c) => c.status === 'STUDYING' || c.status === 'SCHEDULED')
    const nextExam = [...certs.data]
        .filter((c) => c.examDate != null && !isBefore(c.examDate, today) && c.status !== 'PASSED')
        .sort((a, b) => a.examDate!.localeCompare(b.examDate!))[0]

    const titleOf = new Map(plan.data.map((p) => [p.id, p.title]))
    const recent = [...events.data].sort((a, b) => b.eventTime.localeCompare(a.eventTime)).slice(0, 8)

    const isEmpty = plan.data.length + study.data.length + fitness.data.length + apps.data.length + certs.data.length === 0

    return (
        <div>
            <PageHeader title="Dashboard" subtitle={`Week of ${formatDate(monday)} · intention on the left, reality on the right.`} />

            {isEmpty && (
                <Card className="mb-6 border-blue-200 bg-blue-50/50">
                    <p className="text-sm text-gray-800">
                        <span className="font-medium">Nothing here yet.</span> Start on the <Link to="/plan" className="text-blue-700 underline">Plan</Link> board with what you intend to do,
                        then log what actually happened under <Link to="/sessions" className="text-blue-700 underline">Sessions</Link>.
                        The <Link to="/prompt" className="text-blue-700 underline">Prompt</Link> tab turns all of it into context for an AI assistant.
                    </p>
                </Card>
            )}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Open intentions" value={open.length} sub={`${dueThisWeek.length} due this week`} to="/plan" />
                <Stat label="Overdue" value={overdue.length} tone={overdue.length ? 'red' : undefined} sub={overdue.length ? 'past target date, still open' : 'nothing slipping'} to="/plan?view=week" />
                <Stat label="Done this week" value={doneThisWeek.length} tone={doneThisWeek.length ? 'green' : undefined} sub="marked done this week" to="/plan" />
                <Stat label="Applications" value={activeApps.length} sub={`${interviewing.length} interviewing or offer`} to="/applications" />
                <Stat label="Study this week" value={formatMinutes(studyMinutes)} sub={`${studyWeek.length} session${studyWeek.length === 1 ? '' : 's'} · ${plannedStudy} planned`} to="/sessions" tone="blue" />
                <Stat label="Fitness this week" value={formatMinutes(fitnessMinutes)} sub={`${fitnessWeek.length} workout${fitnessWeek.length === 1 ? '' : 's'} · ${plannedExercise} planned`} to="/sessions?kind=fitness" tone="blue" />
                <Stat label="Certifications" value={activeCerts.length} sub={activeCerts.length ? 'studying or scheduled' : 'none in progress'} to="/certifications" />
                <Stat label="Next exam" value={nextExam ? relativeDay(nextExam.examDate) : '—'} sub={nextExam ? nextExam.name : 'no exam scheduled'} to="/certifications" />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <section className="min-w-0">
                    <SectionTitle aside={<Link to="/plan?view=week" className="text-xs text-blue-600 hover:underline">Open week view</Link>}>Up next</SectionTitle>
                    {upcoming.length === 0 ? (
                        <Card><p className="text-sm text-gray-500">No dated intentions ahead. Give open items a target date to see them here.</p></Card>
                    ) : (
                        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-xs">
                            {upcoming.map((p) => (
                                <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                    <span className="w-24 shrink-0 text-xs text-gray-500">{relativeDay(p.targetDate)}</span>
                                    <span className="min-w-0 flex-1 truncate text-gray-900">{p.title}</span>
                                    <Pill value={p.intent} />
                                    {p.status === 'IN_PROGRESS' && <Pill value={p.status} />}
                                </li>
                            ))}
                        </ul>
                    )}
                    {overdue.length > 0 && (
                        <>
                            <SectionTitle>Overdue</SectionTitle>
                            <ul className="divide-y divide-gray-100 rounded-xl border border-red-200 bg-white shadow-xs">
                                {overdue.slice(0, 6).map((p) => (
                                    <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                        <span className="w-24 shrink-0 text-xs text-red-600">{relativeDay(p.targetDate)}</span>
                                        <span className="min-w-0 flex-1 truncate text-gray-900">{p.title}</span>
                                        <Pill value={p.intent} />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </section>

                <section className="min-w-0">
                    <SectionTitle>Recent changes</SectionTitle>
                    {recent.length === 0 ? (
                        <Card><p className="text-sm text-gray-500">Status changes on plan items are recorded here automatically.</p></Card>
                    ) : (
                        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-xs">
                            {recent.map((e) => (
                                <li key={e.id} className="px-4 py-2.5 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="min-w-0 truncate text-gray-900">{titleOf.get(e.planItemId) ?? `Plan item #${e.planItemId}`}</span>
                                        <span className="shrink-0 text-xs text-gray-500">{formatDateTime(e.eventTime)}</span>
                                    </div>
                                    <div className="mt-0.5 text-xs text-gray-500">
                                        {e.fromStatus ? label(e.fromStatus) : 'Created'} → <span className="font-medium text-gray-700">{label(e.toStatus)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    )
}
