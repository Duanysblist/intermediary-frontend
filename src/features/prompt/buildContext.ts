import { addDays, daysBetween, startOfWeek, toLocalISO, todayISO } from '../../lib/format'
import { CHANGE_SET_FORMAT } from './changeSet'
import type { Application, Certification, Document, FitnessSession, PlanEvent, PlanItem, StudySession } from '../../types'

export type ContextOptions = {
    summary: boolean
    plan: boolean
    includeClosedPlan: boolean
    applications: boolean
    includeClosedApplications: boolean
    certifications: boolean
    sessions: boolean
    sessionDays: number
    events: boolean
    documents: boolean
    endpoints: boolean
    responseFormat: boolean
    compact: boolean
    instructions: string
}

export const DEFAULT_OPTIONS: ContextOptions = {
    summary: true,
    plan: true,
    includeClosedPlan: false,
    applications: true,
    includeClosedApplications: false,
    certifications: true,
    sessions: true,
    sessionDays: 14,
    events: true,
    documents: false,
    endpoints: true,
    responseFormat: true,
    compact: true,
    instructions:
        'You are helping me plan and prioritise. The JSON below is the current state of my planning system and is the source of truth. ' +
        'Compare what I intended (plan items) with what actually happened (sessions), point out what is slipping, and suggest concrete next steps. ' +
        'Ask before assuming anything that is not in the data.',
}

export type ContextData = {
    planItems: PlanItem[]
    applications: Application[]
    certifications: Certification[]
    studySessions: StudySession[]
    fitnessSessions: FitnessSession[]
    planEvents: PlanEvent[]
    documents: Document[]
}

/** Server-managed timestamps rarely help an assistant and cost tokens on every row. */
const strip = <T extends object>(rows: T[], compact: boolean): object[] =>
    compact
        ? rows.map((r) => {
            const copy: Record<string, unknown> = { ...(r as Record<string, unknown>) }
            delete copy.createdAt
            delete copy.updatedAt
            return copy
        })
        : rows

const fence = (rows: unknown[]) => '```json\n' + JSON.stringify(rows, null, 1).replaceAll('\n ', '\n') + '\n```'

/** Renders the selected slices of data as a Markdown document an AI assistant can consume directly. */
export function buildContext(data: ContextData, opts: ContextOptions, apiBaseUrl: string): string {
    const today = todayISO()
    const since = addDays(today, -opts.sessionDays)
    const parts: string[] = []

    parts.push(`# Planning context — ${today}`)
    if (opts.instructions.trim()) parts.push(opts.instructions.trim())
    if (opts.summary) parts.push(`## This week at a glance\n${weekSummary(data, today)}`)
    parts.push(
        'Model: **plan items** are intentions (status PLANNED / IN_PROGRESS / DONE / DEFERRED / CANCELED, optional targetDate). ' +
        '**Study and fitness sessions** are reality: what actually happened. **Plan events** are the append-only history of status changes. ' +
        'A plan item may reference another record via referenceEntityType + referenceEntityId.',
    )

    if (opts.plan) {
        const rows = opts.includeClosedPlan ? data.planItems : data.planItems.filter((p) => p.status === 'PLANNED' || p.status === 'IN_PROGRESS')
        parts.push(`## Plan items${opts.includeClosedPlan ? '' : ' (open only)'} — ${rows.length}\n${fence(strip(rows, opts.compact))}`)
    }
    if (opts.sessions) {
        const st = data.studySessions.filter((s) => s.sessionDate >= since)
        const ft = data.fitnessSessions.filter((s) => s.sessionDate >= since)
        parts.push(`## Study sessions, last ${opts.sessionDays} days — ${st.length}\n${fence(strip(st, opts.compact))}`)
        parts.push(`## Fitness sessions, last ${opts.sessionDays} days — ${ft.length}\n${fence(strip(ft, opts.compact))}`)
    }
    if (opts.events) {
        const ev = [...data.planEvents].filter((e) => toLocalISO(e.eventTime) >= since).sort((a, b) => b.eventTime.localeCompare(a.eventTime))
        parts.push(`## Plan events, last ${opts.sessionDays} days — ${ev.length}\n${fence(strip(ev, opts.compact))}`)
    }
    if (opts.certifications) {
        parts.push(`## Certifications — ${data.certifications.length}\n${fence(strip(data.certifications, opts.compact))}`)
    }
    if (opts.applications) {
        const rows = opts.includeClosedApplications
            ? data.applications
            : data.applications.filter((a) => !['REJECTED', 'WITHDRAWN', 'GHOSTED'].includes(a.status))
        parts.push(`## Applications${opts.includeClosedApplications ? '' : ' (active only)'} — ${rows.length}\n${fence(strip(rows, opts.compact))}`)
    }
    if (opts.documents) {
        parts.push(`## Documents — ${data.documents.length}\n${fence(strip(data.documents, opts.compact))}`)
    }
    if (opts.responseFormat) {
        parts.push(
            '## How to answer\n' +
            'Explain your reasoning briefly, then give the concrete changes as a single ```json code block in exactly this shape so I can import it:\n' +
            '```json\n' + CHANGE_SET_FORMAT + '\n```\n' +
            'Rules: only plan items; "update" needs an existing id from the data, "create" has id null and needs title + intent; ' +
            'intent is one of STUDY, EXERCISE, APPLY, READ, WRITE, OTHER; status is one of PLANNED, IN_PROGRESS, DONE, DEFERRED, CANCELED; ' +
            'targetDate is YYYY-MM-DD and never in the past, or the string CLEAR to take an item off the calendar.',
        )
    }
    if (opts.endpoints) {
        parts.push(
            '## How to change things\n' +
            `The same data is available over REST at \`${apiBaseUrl}\` (JSON). Sign in with \`POST /auth/login\` {username, password} and send the returned token as \`Authorization: Bearer …\`. ` +
            'Collections: `/plan-items`, `/study-sessions`, `/fitness-sessions`, `/certifications`, `/applications`, `/documents`, `/plan-events` (read-only, `?planItemId=`). ' +
            'Each supports `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`. `PUT` needs the full record; changing a plan item\'s status appends a plan event automatically. ' +
            'Interactive docs: `/swagger-ui.html`.',
        )
    }
    return parts.join('\n\n') + '\n'
}

/**
 * A deterministic paragraph describing the current week, computed locally. Assistants answer
 * better from a short narrative plus the raw rows than from rows alone, and it costs no tokens to make.
 */
export function weekSummary(data: ContextData, today: string): string {
    const monday = startOfWeek(today)
    const sunday = addDays(monday, 6)
    const nextMonday = addDays(monday, 7)
    const inWeek = (iso: string | null | undefined) => iso != null && iso >= monday && iso < nextMonday
    const open = data.planItems.filter((p) => p.status === 'PLANNED' || p.status === 'IN_PROGRESS')
    const overdue = open.filter((p) => p.targetDate != null && p.targetDate < today)
    const dueThisWeek = open.filter((p) => inWeek(p.targetDate))
    const unscheduled = open.filter((p) => p.targetDate == null)
    const doneThisWeek = data.planEvents.filter((e) => e.toStatus === 'DONE' && inWeek(toLocalISO(e.eventTime))).length
    const studyMin = data.studySessions.filter((s) => inWeek(s.sessionDate)).reduce((n, s) => n + s.durationMinutes, 0)
    const fitnessMin = data.fitnessSessions.filter((s) => inWeek(s.sessionDate)).reduce((n, s) => n + s.durationMinutes, 0)
    const plannedStudy = data.planItems.filter((p) => p.intent === 'STUDY' && inWeek(p.targetDate)).length
    const plannedExercise = data.planItems.filter((p) => p.intent === 'EXERCISE' && inWeek(p.targetDate)).length
    const exams = data.certifications.filter((c) => c.examDate && c.examDate >= today && c.status !== 'PASSED')
        .sort((a, b) => a.examDate!.localeCompare(b.examDate!))
    const interviews = data.applications.filter((a) => a.status === 'INTERVIEWING' || a.status === 'OFFER')

    const s: string[] = []
    s.push(`Today is ${today} (week ${monday} to ${sunday}).`)
    s.push(`${open.length} open plan item${open.length === 1 ? '' : 's'}: ${dueThisWeek.length} due this week, ${overdue.length} overdue, ${unscheduled.length} without a date; ${doneThisWeek} completed so far this week.`)
    if (overdue.length) s.push(`Overdue: ${overdue.slice(0, 5).map((p) => `"${p.title}" (${p.targetDate})`).join(', ')}${overdue.length > 5 ? ', …' : ''}.`)
    s.push(`Logged this week: ${studyMin} min of study across ${data.studySessions.filter((x) => inWeek(x.sessionDate)).length} session(s) against ${plannedStudy} planned study item(s); ${fitnessMin} min of exercise against ${plannedExercise} planned workout(s).`)
    if (exams.length) s.push(`Next exam: ${exams[0].name} on ${exams[0].examDate} (${daysBetween(today, exams[0].examDate!)} days away).`)
    if (interviews.length) s.push(`Active interviews or offers: ${interviews.map((a) => `${a.company} (${a.role})`).join(', ')}.`)
    return s.join(' ')
}
