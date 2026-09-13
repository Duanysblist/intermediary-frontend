import { request } from './client'
import { isDemo } from '../demo/mode'
import type {
    Application, ApplicationInput, Certification, CertificationInput, Document, DocumentInput,
    FitnessSession, FitnessSessionInput, PlanEvent, PlanItem, PlanItemInput, StudySession, StudySessionInput,
} from '../types'
import type { ChangeSet } from '../features/prompt/changeSet'

/** A typed REST resource. Every backend entity exposes the same CRUD shape, so build them once. */
export interface Resource<T, TInput> {
    list(): Promise<T[]>
    get(id: number): Promise<T>
    create(body: TInput): Promise<T>
    update(id: number, body: TInput): Promise<T>
    remove(id: number): Promise<void>
}

export function resource<T, TInput>(path: string): Resource<T, TInput> {
    return {
        list: () => request<T[]>(path),
        get: (id) => request<T>(`${path}/${id}`),
        create: (body) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
        update: (id, body) => request<T>(`${path}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
        remove: (id) => request<void>(`${path}/${id}`, { method: 'DELETE' }),
    }
}

export type AiStatus = { enabled: boolean; model: string }

// Demo mode swaps every API for the in-browser store; the rest of the app never knows.
// The dynamic import keeps the sample data out of the normal bundle path, but it is only a few KB,
// so a plain static import is used for simplicity and synchronous access.
import * as demo from '../demo/demoStore'

export const applicationsApi: Resource<Application, ApplicationInput> = isDemo ? demo.demoApplications : resource('/applications')
export const certificationsApi: Resource<Certification, CertificationInput> = isDemo ? demo.demoCertifications : resource('/certifications')
export const documentsApi: Resource<Document, DocumentInput> = isDemo ? demo.demoDocuments : resource('/documents')
export const studySessionsApi: Resource<StudySession, StudySessionInput> = isDemo ? demo.demoStudySessions : resource('/study-sessions')
export const fitnessSessionsApi: Resource<FitnessSession, FitnessSessionInput> = isDemo ? demo.demoFitnessSessions : resource('/fitness-sessions')
export const planItemsApi: Resource<PlanItem, PlanItemInput> = isDemo ? demo.demoPlanItems : resource('/plan-items')

/** Plan events are append-only and written by the server; the UI only reads them. */
export const planEventsApi = isDemo ? demo.demoPlanEvents : {
    list: (planItemId?: number) =>
        request<PlanEvent[]>(planItemId == null ? '/plan-events' : `/plan-events?planItemId=${planItemId}`),
}

/** Claude suggestions. The server holds the API key; the browser only ever sees the change set. */
export const aiApi = isDemo ? demo.demoAi : {
    status: () => request<AiStatus>('/ai/status'),
    suggest: (context: string, ask?: string) =>
        request<ChangeSet>('/ai/suggest', { method: 'POST', body: JSON.stringify({ context, request: ask || null }) }),
}
