import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApplications, createApplication, updateApplication, deleteApplication } from '../../api/applications'
import type { ApplicationInput } from '../../types'

export function useApplications() {
    return useQuery({ queryKey: ['applications'], queryFn: getApplications })
}

export function useCreateApplication() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: ApplicationInput) => createApplication(body),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    })
}

export function useUpdateApplication() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (vars: { id: number; body: ApplicationInput }) => updateApplication(vars.id, vars.body),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    })
}

export function useDeleteApplication() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => deleteApplication(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
    })
}