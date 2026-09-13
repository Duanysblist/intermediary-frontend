import { useMutation, useQueryClient } from '@tanstack/react-query'
import { planItemsApi } from '../../api/resources'
import { PLAN_EVENTS_KEY, planItems } from '../../hooks/resources'
import type { PlanItem, PlanItemInput } from '../../types'

export function toInput(item: PlanItem): PlanItemInput {
    return {
        title: item.title,
        intent: item.intent,
        targetDate: item.targetDate,
        status: item.status,
        referenceEntityType: item.referenceEntityType,
        referenceEntityId: item.referenceEntityId,
        recurringPlanId: item.recurringPlanId,
        notes: item.notes,
    }
}

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

