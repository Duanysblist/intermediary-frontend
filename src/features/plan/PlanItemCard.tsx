import type { ReactNode } from 'react'
import { useDraggable } from '@dnd-kit/core'
import Pill from '../../components/ui/Pill'
import { formatDate, isBefore, relativeDay, todayISO } from '../../lib/format'
import type { PlanItem } from '../../types'

type Props = {
    item: PlanItem
    referenceLabel?: string | null
    showStatus?: boolean
    /** Narrow layout for calendar day columns: pill under the title instead of beside it. */
    compact?: boolean
    onOpen?: (item: PlanItem) => void
    /** Presentational clone used inside DragOverlay. */
    overlay?: boolean
}

export function PlanItemCardBody({ item, referenceLabel, showStatus, compact }: Pick<Props, 'item' | 'referenceLabel' | 'showStatus' | 'compact'>) {
    const open = item.status === 'PLANNED' || item.status === 'IN_PROGRESS'
    const overdue = open && item.targetDate != null && isBefore(item.targetDate, todayISO())
    const meta: { key: string; node: ReactNode }[] = [
        {
            key: 'date',
            node: item.targetDate ? (
                <span className={overdue ? 'font-medium text-red-600' : ''} title={formatDate(item.targetDate)}>
                    {overdue ? 'Overdue · ' : ''}{relativeDay(item.targetDate)}
                </span>
            ) : (
                <span className="text-gray-400">No date</span>
            ),
        },
    ]
    if (referenceLabel) meta.push({ key: 'ref', node: <span className="truncate" title={referenceLabel}>{referenceLabel}</span> })

    return (
        <>
            <div className={compact ? '' : 'flex items-start justify-between gap-2'}>
                <p className={`text-sm font-medium leading-snug ${item.status === 'DONE' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.title}</p>
                <Pill value={item.intent} className={compact ? 'mt-1.5' : 'shrink-0'} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-500">
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
}

export default function PlanItemCard({ item, referenceLabel, showStatus, compact, onOpen, overlay }: Props) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `item-${item.id}`,
        data: { item },
        disabled: overlay,
    })
    return (
        <div
            ref={overlay ? undefined : setNodeRef}
            {...(overlay ? {} : attributes)}
            {...(overlay ? {} : listeners)}
            onClick={() => onOpen?.(item)}
            className={`cursor-grab touch-none rounded-lg border bg-white p-3 shadow-xs transition-shadow active:cursor-grabbing ` +
                `${overlay ? 'rotate-1 border-blue-300 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'} ` +
                `${isDragging ? 'opacity-30' : ''}`}
            data-testid={`plan-item-${item.id}`}
        >
            <PlanItemCardBody item={item} referenceLabel={referenceLabel} showStatus={showStatus} compact={compact} />
        </div>
    )
}
