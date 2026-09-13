import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Resource } from '../api/resources'

/**
 * Builds the standard list/create/update/delete hooks for one resource.
 * Mutations invalidate the list so every screen showing the data refreshes.
 */
export function makeResourceHooks<T extends { id: number }, TInput>(key: string, api: Resource<T, TInput>) {
    const queryKey = [key] as const

    function useList() {
        return useQuery({ queryKey, queryFn: api.list })
    }

    function useCreate() {
        const qc = useQueryClient()
        return useMutation({
            mutationFn: (body: TInput) => api.create(body),
            onSuccess: () => qc.invalidateQueries({ queryKey }),
        })
    }

    function useUpdate() {
        const qc = useQueryClient()
        return useMutation({
            mutationFn: (vars: { id: number; body: TInput }) => api.update(vars.id, vars.body),
            onSuccess: () => qc.invalidateQueries({ queryKey }),
        })
    }

    function useRemove() {
        const qc = useQueryClient()
        return useMutation({
            mutationFn: (id: number) => api.remove(id),
            onSuccess: () => qc.invalidateQueries({ queryKey }),
        })
    }

    return { queryKey, useList, useCreate, useUpdate, useRemove }
}
