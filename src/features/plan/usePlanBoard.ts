import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderPlanItems, planItemsApi } from '../../api/resources'
import { PLAN_EVENTS_KEY, planItems } from '../../hooks/resources'
import { toInput, type PlanItem, type PlanItemStatus } from '../../types'

export type PlanPatch = Partial<Pick<PlanItem, 'status' | 'targetDate'>>

/**
 * Drag-and-drop mutation: applies the change to the cached list immediately so the card
 * lands where it was dropped, then sends the full item (the API's PUT needs title + intent)
 * and rolls back if the server rejects it. A status change makes the server append a PlanEvent,
 * so the events cache is invalidated too.
 */
export function useMovePlanItem() {
    const qc = useQueryClient()
    const key = planItems.queryKey
    return useMutation({
        mutationFn: ({ item, patch }: { item: PlanItem; patch: PlanPatch }) =>
            planItemsApi.update(item.id, { ...toInput(item), ...patch }),
        onMutate: async ({ item, patch }) => {
            await qc.cancelQueries({ queryKey: key })
            const previous = qc.getQueryData<PlanItem[]>(key)
            qc.setQueryData<PlanItem[]>(key, (old) => old?.map((p) => (p.id === item.id ? { ...p, ...patch } : p)))
            return { previous }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(key, ctx.previous)
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: key })
            qc.invalidateQueries({ queryKey: [PLAN_EVENTS_KEY] })
        },
    })
}

/** Board drop: saves the column the card landed in, with the same optimistic update and rollback. */
export function useReorderPlanItems() {
    const qc = useQueryClient()
    const key = planItems.queryKey
    return useMutation({
        mutationFn: ({ status, ids }: { status: PlanItemStatus; ids: number[] }) => orderPlanItems(status, ids),
        onMutate: async ({ status, ids }) => {
            await qc.cancelQueries({ queryKey: key })
            const previous = qc.getQueryData<PlanItem[]>(key)
            qc.setQueryData<PlanItem[]>(key, (old) => old?.map((p) => {
                const position = ids.indexOf(p.id)
                return position < 0 ? p : { ...p, status, position }
            }))
            return { previous }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(key, ctx.previous)
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: key })
            qc.invalidateQueries({ queryKey: [PLAN_EVENTS_KEY] })
        },
    })
}

