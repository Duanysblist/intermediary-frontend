import { useQuery } from '@tanstack/react-query'
import {
    applicationsApi, certificationsApi, documentsApi, fitnessSessionsApi, planEventsApi, planItemsApi, studySessionsApi,
} from '../api/resources'
import { makeResourceHooks } from './useResource'

export const applications = makeResourceHooks('applications', applicationsApi)
export const certifications = makeResourceHooks('certifications', certificationsApi)
export const documents = makeResourceHooks('documents', documentsApi)
export const studySessions = makeResourceHooks('study-sessions', studySessionsApi)
export const fitnessSessions = makeResourceHooks('fitness-sessions', fitnessSessionsApi)
export const planItems = makeResourceHooks('plan-items', planItemsApi)

export const PLAN_EVENTS_KEY = 'plan-events'

export function usePlanEvents(planItemId?: number) {
    return useQuery({
        queryKey: [PLAN_EVENTS_KEY, planItemId ?? 'all'],
        queryFn: () => planEventsApi.list(planItemId),
    })
}
