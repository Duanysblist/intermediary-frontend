import { request } from './client'
import { isDemo } from '../demo/mode'
import type {
    Application, ApplicationInput, Certification, CertificationInput, Document, DocumentInput,
    FitnessSession, FitnessSessionInput, PlanEvent, PlanItem, PlanItemInput, Proposal, ProposalStatus,
    RecurringPlan, RecurringPlanInput, StudySession, StudySessionInput,
} from '../types'
import type { Change, ChangeSet } from '../features/prompt/changeSet'

/** A typed REST resource. Every backend entity exposes the same CRUD shape, so build them once. */
export interface Resource<T, TInput> {
    list(): Promise<T[]>
    get(id: number): Promise<T>
    create(body: TInput): Promise<T>
    update(id: number, body: TInput): Promise<T>
    remove(id: number): Promise<void>
}

function resource<T, TInput>(path: string): Resource<T, TInput> {
    return {
        list: () => request<T[]>(path),
        get: (id) => request<T>(`${path}/${id}`),
        create: (body) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
        update: (id, body) => request<T>(`${path}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
        remove: (id) => request<void>(`${path}/${id}`, { method: 'DELETE' }),
    }
}

type AiStatus = { enabled: boolean; model: string }

export interface RecurringPlansApi extends Resource<RecurringPlan, RecurringPlanInput> {
    /** Creates plan items for every active routine from today through today + days. Returns what was created. */
    generate(days: number): Promise<PlanItem[]>
}

export interface ProposalsApi {
    list(status?: ProposalStatus): Promise<Proposal[]>
    create(source: string, summary: string, changes: Change[]): Promise<Proposal>
    setStatus(id: number, status: ProposalStatus): Promise<Proposal>
    remove(id: number): Promise<void>
}

export interface CalendarApi {
    link(): Promise<{ url: string }>
}

interface AiApi {
    status(): Promise<AiStatus>
    suggest(context: string, ask?: string): Promise<ChangeSet>
}

// Demo mode swaps every API for the in-browser store; the rest of the app never knows.
import * as demo from '../demo/demoStore'

export const applicationsApi: Resource<Application, ApplicationInput> = isDemo ? demo.demoApplications : resource('/applications')
export const certificationsApi: Resource<Certification, CertificationInput> = isDemo ? demo.demoCertifications : resource('/certifications')
export const documentsApi: Resource<Document, DocumentInput> = isDemo ? demo.demoDocuments : resource('/documents')
export const studySessionsApi: Resource<StudySession, StudySessionInput> = isDemo ? demo.demoStudySessions : resource('/study-sessions')
export const fitnessSessionsApi: Resource<FitnessSession, FitnessSessionInput> = isDemo ? demo.demoFitnessSessions : resource('/fitness-sessions')
export const planItemsApi: Resource<PlanItem, PlanItemInput> = isDemo ? demo.demoPlanItems : resource('/plan-items')

export const recurringPlansApi: RecurringPlansApi = isDemo ? demo.demoRecurringPlans : {
    ...resource<RecurringPlan, RecurringPlanInput>('/recurring-plans'),
    generate: (days) => request<PlanItem[]>(`/recurring-plans/generate?days=${days}`, { method: 'POST' }),
}

/** Plan events are append-only and written by the server; the UI only reads them. */
export const planEventsApi = isDemo ? demo.demoPlanEvents : {
    list: (planItemId?: number) =>
        request<PlanEvent[]>(planItemId == null ? '/plan-events' : `/plan-events?planItemId=${planItemId}`),
}

/** Change sets submitted by agents (the MCP server) and waiting for review in the app. */
export const proposalsApi: ProposalsApi = isDemo ? demo.demoProposals : {
    list: (status) => request<Proposal[]>(status ? `/proposals?status=${status}` : '/proposals'),
    create: (source, summary, changes) => request<Proposal>('/proposals', { method: 'POST', body: JSON.stringify({ source, summary, changes }) }),
    setStatus: (id, status) => request<Proposal>(`/proposals/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    remove: (id) => request<void>(`/proposals/${id}`, { method: 'DELETE' }),
}

export const calendarApi: CalendarApi = isDemo ? demo.demoCalendar : {
    link: () => request<{ url: string }>('/calendar/link'),
}

/** Claude suggestions. The server holds the API key; the browser only ever sees the change set. */
export const aiApi: AiApi = isDemo ? demo.demoAi : {
    status: () => request<AiStatus>('/ai/status'),
    suggest: (context, ask) =>
        request<ChangeSet>('/ai/suggest', { method: 'POST', body: JSON.stringify({ context, request: ask || null }) }),
}
