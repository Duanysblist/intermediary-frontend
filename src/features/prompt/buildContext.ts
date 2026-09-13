import { addDays, todayISO } from '../../lib/format'
import type { Application, Certification, Document, FitnessSession, PlanEvent, PlanItem, StudySession } from '../../types'

export type ContextOptions = {
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
    compact: boolean
    instructions: string
}

export const DEFAULT_OPTIONS: ContextOptions = {
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
        const ev = [...data.planEvents].filter((e) => e.eventTime >= since).sort((a, b) => b.eventTime.localeCompare(a.eventTime))
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
    if (opts.endpoints) {
        parts.push(
            '## How to change things\n' +
            `The same data is available over REST at \`${apiBaseUrl}\` (JSON, no auth in this environment). ` +
            'Collections: `/plan-items`, `/study-sessions`, `/fitness-sessions`, `/certifications`, `/applications`, `/documents`, `/plan-events` (read-only, `?planItemId=`). ' +
            'Each supports `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`. `PUT` needs the full record; changing a plan item\'s status appends a plan event automatically. ' +
            'Interactive docs: `/swagger-ui.html`.',
        )
    }
    return parts.join('\n\n') + '\n'
}
