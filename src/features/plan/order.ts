import { daysBetween, parseLocal, toISODate } from '../../lib/format'
import type { PlanItem, PlanItemStatus } from '../../types'

/** Columns whose cards pile up and stop mattering: a finished card older than this is folded away. */
export const FINISHED_STATUSES: readonly PlanItemStatus[] = ['DONE', 'CANCELED']
export const RECENT_DAYS = 7

/**
 * Splits a finished column into the cards changed within the last RECENT_DAYS days and the rest.
 * The rest are hidden until asked for, so a board that gains a few finished cards a day stays
 * light: every card on screen is a drag source and a drop target, and all of them re-render on
 * each move of a drag. Columns that are still in play are never split.
 */
export function splitOlder(items: PlanItem[], status: PlanItemStatus, today: string, days = RECENT_DAYS): { recent: PlanItem[]; older: PlanItem[] } {
    if (!FINISHED_STATUSES.includes(status)) return { recent: items, older: [] }
    const recent: PlanItem[] = [], older: PlanItem[] = []
    for (const item of items) {
        const changed = toISODate(parseLocal(item.updatedAt))
        ;(daysBetween(changed, today) > days ? older : recent).push(item)
    }
    return { recent, older }
}

/**
 * The column's ids after dropping `id` on the card `overId` (or on the column itself when undefined).
 * Within one column the card takes the dropped-on card's place; from another column it goes before it.
 * Dropping on the column puts it at the end.
 */
export function placeInColumn(columnIds: number[], id: number, overId?: number): number[] {
    if (overId === id) return columnIds
    const rest = columnIds.filter((x) => x !== id)
    if (overId === undefined) return [...rest, id]
    const to = columnIds.includes(id) ? columnIds.indexOf(overId) : rest.indexOf(overId)
    return [...rest.slice(0, to), id, ...rest.slice(to)]
}
