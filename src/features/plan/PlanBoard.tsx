import { useDroppable } from '@dnd-kit/core'
import PlanItemCard from './PlanItemCard'
import { PLAN_STATUSES, label, type PlanItem, type PlanItemStatus } from '../../types'
import Icon from '../../components/ui/Icon'

type Props = {
    items: PlanItem[]
    referenceLabel: (item: PlanItem) => string | null
    onOpen: (item: PlanItem) => void
    onAdd: (status: PlanItemStatus) => void
}

const COLUMN_HINT: Record<PlanItemStatus, string> = {
    PLANNED: 'Intentions not started',
    IN_PROGRESS: 'Being worked on',
    DONE: 'Completed',
    DEFERRED: 'Pushed to later',
    CANCELED: 'Dropped',
}

function Column({ status, items, referenceLabel, onOpen, onAdd }: { status: PlanItemStatus; items: PlanItem[] } & Omit<Props, 'items'>) {
    const { setNodeRef, isOver } = useDroppable({ id: `status-${status}`, data: { status } })
    return (
        <section
            ref={setNodeRef}
            className={`flex min-h-64 w-[85%] shrink-0 snap-start flex-col rounded-xl border p-2 transition-colors sm:w-72 ${
                isOver ? 'border-accent/70 bg-accent-tint/60' : 'border-rule bg-sunken/70'
            }`}
            aria-label={`${label(status)} column`}
        >
            <header className="flex items-center justify-between px-1 pb-2 pt-1">
                <div>
                    <h2 className="text-sm font-semibold text-ink">{label(status)}</h2>
                    <p className="text-xs text-muted">{COLUMN_HINT[status]}</p>
                </div>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-2 ring-1 ring-rule">{items.length}</span>
            </header>
            <div className="flex flex-1 flex-col gap-2">
                {items.map((item) => (
                    <PlanItemCard key={item.id} item={item} referenceLabel={referenceLabel(item)} onOpen={onOpen} dropStatus={status} />
                ))}
                {items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-rule-strong px-3 py-6 text-center text-xs text-faint">Drop here</p>
                )}
            </div>
            <button
                type="button"
                onClick={() => onAdd(status)}
                className="mt-2 min-h-11 rounded-lg px-2 text-left text-sm text-muted hover:bg-surface hover:text-ink sm:min-h-0 sm:py-1.5 sm:text-xs"
            >
                <span className="inline-flex items-center gap-1"><Icon name="plus" className="h-3.5 w-3.5" strokeWidth={2.2} />Add item</span>
            </button>
        </section>
    )
}

/**
 * Kanban by status, in the order PlanPage sorted the items. Dropping a card on another card puts it
 * in that card's place; dropping it on a column's empty space puts it at the end. Either can change its status.
 */
export default function PlanBoard({ items, referenceLabel, onOpen, onAdd }: Props) {
    const byStatus = new Map<PlanItemStatus, PlanItem[]>(PLAN_STATUSES.map((s) => [s, []]))
    for (const it of items) byStatus.get(it.status)?.push(it)
    return (
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:snap-none sm:px-0">
            {PLAN_STATUSES.map((status) => (
                <Column key={status} status={status} items={byStatus.get(status) ?? []} referenceLabel={referenceLabel} onOpen={onOpen} onAdd={onAdd} />
            ))}
        </div>
    )
}
