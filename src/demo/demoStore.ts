import type { CalendarApi, ProposalsApi, RecurringPlansApi, Resource } from '../api/resources'
import { ApiError } from '../api/client'
import { buildDemoData } from './demoData'
import { addDays, parseLocal, todayISO } from '../lib/format'
import type { Change, ChangeSet } from '../features/prompt/changeSet'
import type {
    Application, ApplicationInput, Certification, CertificationInput, Document, DocumentInput,
    FitnessSession, FitnessSessionInput, PlanItem, PlanItemInput, Proposal, RecurringPlan, RecurringPlanInput,
    StudySession, StudySessionInput, DayOfWeek,
} from '../types'

/**
 * In-memory stand-in for the API used by the public demo. Mirrors the server's behaviour that
 * matters to the UI: ids, timestamps, full-replacement updates, and the plan-event audit log
 * written on status changes. Network latency is simulated so loading states stay honest.
 */
const data = buildDemoData()
const nextId: Record<string, number> = {}

// Server timestamps are UTC instants with a trailing Z; the demo store mimics that.
const now = () => new Date().toISOString()
const delay = <T,>(value: T, ms = 120): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms))
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

function makeResource<T extends { id: number; createdAt: string; updatedAt: string }, TInput extends object>(
    key: string,
    rows: T[],
    afterUpdate?: (before: T, after: T) => void,
): Resource<T, TInput> {
    nextId[key] = Math.max(0, ...rows.map((r) => r.id)) + 1
    const find = (id: number) => {
        const row = rows.find((r) => r.id === id)
        if (!row) throw new ApiError(404, "That item couldn't be found; it may have already been removed.")
        return row
    }
    return {
        list: () => delay(clone(rows)),
        get: (id) => delay(clone(find(id))),
        create: (body) => {
            const row = { ...body, id: nextId[key]++, createdAt: now(), updatedAt: now() } as unknown as T
            rows.push(row)
            return delay(clone(row))
        },
        update: (id, body) => {
            const row = find(id)
            const before = clone(row)
            // Same rule as the server: PUT replaces the record (a null field clears it).
            Object.assign(row, body)
            row.updatedAt = now()
            afterUpdate?.(before, row)
            return delay(clone(row))
        },
        remove: (id) => {
            const idx = rows.findIndex((r) => r.id === id)
            if (idx < 0) throw new ApiError(404, "That item couldn't be found; it may have already been removed.")
            rows.splice(idx, 1)
            return delay(undefined)
        },
    }
}

let nextEventId = Math.max(0, ...data.planEvents.map((e) => e.id)) + 1

export const demoApplications = makeResource<Application, ApplicationInput>('applications', data.applications)
export const demoCertifications = makeResource<Certification, CertificationInput>('certifications', data.certifications)
export const demoDocuments = makeResource<Document, DocumentInput>('documents', data.documents)
export const demoStudySessions = makeResource<StudySession, StudySessionInput>('study-sessions', data.studySessions)
export const demoFitnessSessions = makeResource<FitnessSession, FitnessSessionInput>('fitness-sessions', data.fitnessSessions)
export const demoPlanItems = makeResource<PlanItem, PlanItemInput>('plan-items', data.planItems, (before, after) => {
    if (before.status !== after.status) {
        data.planEvents.push({
            id: nextEventId++, planItemId: after.id, fromStatus: before.status, toStatus: after.status,
            eventTime: now(), notes: null, createdAt: now(),
        })
    }
})

export const demoPlanEvents = {
    list: (planItemId?: number) =>
        delay(clone(planItemId == null ? data.planEvents : data.planEvents.filter((e) => e.planItemId === planItemId))),
}

const DAY_INDEX: Record<DayOfWeek, number> = { SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 }

const recurringBase = makeResource<RecurringPlan, RecurringPlanInput>('recurring-plans', data.recurringPlans)
export const demoRecurringPlans: RecurringPlansApi = {
    ...recurringBase,
    generate: async (days) => {
        const created: PlanItem[] = []
        const today = todayISO()
        for (const plan of data.recurringPlans.filter((p) => p.active)) {
            for (let i = 0; i <= Math.min(days, 60); i++) {
                const date = addDays(today, i)
                const dow = parseLocal(date).getDay()
                if (!plan.days.some((d) => DAY_INDEX[d] === dow)) continue
                if (data.planItems.some((p) => p.recurringPlanId === plan.id && p.targetDate === date)) continue
                const item = await demoPlanItems.create({
                    title: plan.title, intent: plan.intent, targetDate: date, status: 'PLANNED',
                    referenceEntityType: plan.referenceEntityType, referenceEntityId: plan.referenceEntityId,
                    recurringPlanId: plan.id, notes: plan.notes,
                })
                created.push(item)
            }
        }
        return delay(created)
    },
}

let nextProposalId = Math.max(0, ...data.proposals.map((p) => p.id)) + 1
export const demoProposals: ProposalsApi = {
    list: (status) => delay(clone(status ? data.proposals.filter((p) => p.status === status) : data.proposals)),
    create: (source, summary, changes: Change[]) => {
        const p: Proposal = { id: nextProposalId++, source, summary, changes, status: 'PENDING', createdAt: now(), updatedAt: now() }
        data.proposals.unshift(p)
        return delay(clone(p))
    },
    setStatus: (id, status) => {
        const p = data.proposals.find((x) => x.id === id)
        if (!p) throw new ApiError(404, 'Proposal not found.')
        p.status = status
        p.updatedAt = now()
        return delay(clone(p))
    },
    remove: (id) => {
        const idx = data.proposals.findIndex((x) => x.id === id)
        if (idx >= 0) data.proposals.splice(idx, 1)
        return delay(undefined)
    },
}

export const demoCalendar: CalendarApi = {
    link: () => delay({ url: 'https://intermediary-loxn.onrender.com/calendar.ics?token=demo-feed-token' }),
}

/** The demo's stand-in for Claude: a plausible, data-aware suggestion built locally. */
export const demoAi = {
    status: () => delay({ enabled: true, model: 'demo (no API call)' }),
    suggest: (): Promise<ChangeSet> => {
        const T = todayISO()
        const open = data.planItems.filter((p) => p.status === 'PLANNED' || p.status === 'IN_PROGRESS')
        const overdue = open.filter((p) => p.targetDate != null && p.targetDate < T)
        const changes: ChangeSet['changes'] = []
        for (const p of overdue.slice(0, 3)) {
            changes.push({
                op: 'update', id: p.id,
                fields: p.intent === 'APPLY' ? { targetDate: T } : { targetDate: addDays(T, 1) },
                reason: p.intent === 'APPLY'
                    ? `"${p.title}" is ${Math.abs(Number(p.targetDate!.slice(8, 10)) - Number(T.slice(8, 10)))} day(s) overdue and blocks an active application; do it today.`
                    : `"${p.title}" slipped past ${p.targetDate}; the sessions show you study most evenings, so tomorrow is realistic.`,
            })
        }
        const exam = data.certifications.find((c) => c.status === 'SCHEDULED' && c.examDate)
        if (exam) {
            changes.push({
                op: 'create', id: null,
                fields: { title: `Full mock exam for ${exam.name.split(' – ')[0]}`, intent: 'STUDY', targetDate: addDays(exam.examDate!, -4), status: 'PLANNED' },
                reason: `Your last practice score was 74% with the exam in ${Math.round((new Date(exam.examDate!).getTime() - new Date(T).getTime()) / 86400000)} days; a timed mock four days out leaves room to review misses.`,
            })
        }
        const unscheduled = open.find((p) => p.targetDate == null)
        if (unscheduled) {
            changes.push({
                op: 'update', id: unscheduled.id, fields: { targetDate: addDays(T, 6) },
                reason: `"${unscheduled.title}" has no date and keeps getting skipped; park it on the weekend after this week's exam prep.`,
            })
        }
        return delay({
            summary: 'Two things are slipping: the overdue recruiter reply and the AWS practice exam. Clear those first, then add a timed mock before the exam. Everything else is on track.',
            changes,
        }, 900)
    },
}
