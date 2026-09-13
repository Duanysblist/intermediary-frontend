import { request } from './client'
import type {
    Application, ApplicationInput, Certification, CertificationInput, Document, DocumentInput,
    FitnessSession, FitnessSessionInput, PlanEvent, PlanItem, PlanItemInput, StudySession, StudySessionInput,
} from '../types'

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

export const applicationsApi = resource<Application, ApplicationInput>('/applications')
export const certificationsApi = resource<Certification, CertificationInput>('/certifications')
export const documentsApi = resource<Document, DocumentInput>('/documents')
export const studySessionsApi = resource<StudySession, StudySessionInput>('/study-sessions')
export const fitnessSessionsApi = resource<FitnessSession, FitnessSessionInput>('/fitness-sessions')
export const planItemsApi = resource<PlanItem, PlanItemInput>('/plan-items')

/** Plan events are append-only and written by the server; the UI only reads them. */
export const planEventsApi = {
    list: (planItemId?: number) =>
        request<PlanEvent[]>(planItemId == null ? '/plan-events' : `/plan-events?planItemId=${planItemId}`),
}
