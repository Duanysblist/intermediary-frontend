import { memo, type ReactNode } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import Pill from '../../components/ui/Pill'
import { formatDate, isBefore, relativeDay, todayISO } from '../../lib/format'
import { isOpenPlanItem, type PlanItem, type PlanItemStatus } from '../../types'

type Props = {
    item: PlanItem
    referenceLabel?: string | null
    showStatus?: boolean
    /** Narrow layout for calendar day columns: pill under the title instead of beside it. */
    compact?: boolean
    onOpen?: (item: PlanItem) => void
    /** Presentational clone used inside DragOverlay. */
    overlay?: boolean
    /** Board column this card sits in; makes the card a drop target so a dragged card can take its place. */
    dropStatus?: PlanItemStatus
}

/**
 * Memoized: every card on the board re-renders on each move of a drag (dnd-kit's hooks subscribe
 * to the drag state), so the part that formats dates and builds the row must be cheap to skip.
 */
export const PlanItemCardBody = memo(function PlanItemCardBody({ item, referenceLabel, showStatus, compact }: Pick<Props, 'item' | 'referenceLabel' | 'showStatus' | 'compact'>) {
    const overdue = isOpenPlanItem(item) && item.targetDate != null && isBefore(item.targetDate, todayISO())
    const meta: { key: string; node: ReactNode }[] = [
        {
            key: 'date',
            node: item.targetDate ? (
                <span className={overdue ? 'font-medium text-danger' : ''} title={formatDate(item.targetDate)}>
                    {overdue ? 'Overdue · ' : ''}{relativeDay(item.targetDate)}
                </span>
            ) : (
                <span className="text-faint">No date</span>
            ),
        },
    ]
    if (referenceLabel) meta.push({ key: 'ref', node: <span className="truncate" title={referenceLabel}>{referenceLabel}</span> })

    return (
        <>
            <div className={compact ? '' : 'flex items-start justify-between gap-2'}>
                <p className={`text-sm font-medium leading-snug ${item.status === 'DONE' ? 'text-muted line-through' : 'text-ink'}`}>{item.title}</p>
                <Pill value={item.intent} className={compact ? 'mt-1.5' : 'shrink-0'} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted">
                {meta.map((m, i) => (
                    <span key={m.key} className="flex min-w-0 items-center gap-1.5">
                        {i > 0 && <span aria-hidden="true">·</span>}
                        {m.node}
                    </span>
                ))}
                {showStatus && <Pill value={item.status} />}
            </div>
        </>
    )
})

export default function PlanItemCard({ item, referenceLabel, showStatus, compact, onOpen, overlay, dropStatus }: Props) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `item-${item.id}`,
        data: { item },
        disabled: overlay,
    })
    const drop = useDroppable({
        id: `slot-${item.id}`,
        data: { status: dropStatus, overId: item.id },
        disabled: overlay || dropStatus === undefined,
    })
    return (
        <div
            ref={overlay ? undefined : (node) => { setNodeRef(node); drop.setNodeRef(node) }}
            {...(overlay ? {} : attributes)}
            {...(overlay ? {} : listeners)}
            onClick={() => onOpen?.(item)}
            className={`cursor-grab touch-manipulation select-none rounded-lg border bg-surface p-3 shadow-xs transition-shadow [-webkit-touch-callout:none] active:cursor-grabbing ` +
                `${overlay ? 'rotate-1 border-accent/50 shadow-lg' : 'border-rule hover:border-rule-strong hover:shadow-sm'} ` +
                `${isDragging ? 'opacity-30' : ''} ${drop.isOver && !isDragging ? 'ring-2 ring-focus' : ''}`}
            data-testid={`plan-item-${item.id}`}
        >
            <PlanItemCardBody item={item} referenceLabel={referenceLabel} showStatus={showStatus} compact={compact} />
        </div>
    )
}
