import { useDroppable } from '@dnd-kit/core'
import PlanItemCard from './PlanItemCard'
import { PLAN_STATUSES, label, type PlanItem, type PlanItemStatus } from '../../types'

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
            className={`flex min-h-64 w-72 shrink-0 flex-col rounded-xl border p-2 transition-colors ${
                isOver ? 'border-blue-400 bg-blue-50/60' : 'border-gray-200 bg-gray-100/70'
            }`}
            aria-label={`${label(status)} column`}
        >
            <header className="flex items-center justify-between px-1 pb-2 pt-1">
                <div>
                    <h2 className="text-sm font-semibold text-gray-800">{label(status)}</h2>
                    <p className="text-xs text-gray-500">{COLUMN_HINT[status]}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">{items.length}</span>
            </header>
            <div className="flex flex-1 flex-col gap-2">
                {items.map((item) => (
                    <PlanItemCard key={item.id} item={item} referenceLabel={referenceLabel(item)} onOpen={onOpen} />
                ))}
                {items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-xs text-gray-400">Drop here</p>
                )}
            </div>
            <button
                type="button"
                onClick={() => onAdd(status)}
                className="mt-2 rounded-lg px-2 py-1.5 text-left text-xs text-gray-500 hover:bg-white hover:text-gray-800"
            >
                + Add item
            </button>
        </section>
    )
}

/** Kanban by status. Dropping a card on a column changes its status (and the server writes a PlanEvent). */
export default function PlanBoard({ items, referenceLabel, onOpen, onAdd }: Props) {
    const byStatus = new Map<PlanItemStatus, PlanItem[]>(PLAN_STATUSES.map((s) => [s, []]))
    for (const it of items) byStatus.get(it.status)?.push(it)
    for (const list of byStatus.values()) {
        list.sort((a, b) => (a.targetDate ?? '9999').localeCompare(b.targetDate ?? '9999') || a.id - b.id)
    }
    return (
        <div className="flex gap-3 overflow-x-auto pb-4">
            {PLAN_STATUSES.map((status) => (
                <Column key={status} status={status} items={byStatus.get(status) ?? []} referenceLabel={referenceLabel} onOpen={onOpen} onAdd={onAdd} />
            ))}
        </div>
    )
}
