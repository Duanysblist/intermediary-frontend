import { useDroppable } from '@dnd-kit/core'
import PlanItemCard from './PlanItemCard'
import Button from '../../components/ui/Button'
import { addDays, formatDate, isBefore, parseLocal, todayISO, weekDays } from '../../lib/format'
import type { PlanItem } from '../../types'

type Props = {
    items: PlanItem[]
    monday: string
    onChangeWeek: (monday: string) => void
    referenceLabel: (item: PlanItem) => string | null
    onOpen: (item: PlanItem) => void
    onAdd: (targetDate: string) => void
}

function DayColumn({ day, items, referenceLabel, onOpen, onAdd }: { day: string; items: PlanItem[] } & Pick<Props, 'referenceLabel' | 'onOpen' | 'onAdd'>) {
    const { setNodeRef, isOver } = useDroppable({ id: `day-${day}`, data: { targetDate: day } })
    const today = day === todayISO()
    const past = isBefore(day, todayISO())
    const d = parseLocal(day)
    return (
        <section
            ref={setNodeRef}
            className={`flex min-h-48 min-w-0 flex-col rounded-xl border p-2 transition-colors ${
                isOver ? 'border-blue-400 bg-blue-50/60' : today ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-100/70'
            } ${past && !today ? 'opacity-80' : ''}`}
            aria-label={formatDate(day)}
        >
            <header className="flex items-baseline justify-between px-1 pb-2 pt-1">
                <span className={`text-xs font-semibold uppercase tracking-wide ${today ? 'text-blue-700' : 'text-gray-500'}`}>
                    {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <span className={`text-sm font-semibold ${today ? 'rounded-full bg-blue-600 px-2 text-white' : 'text-gray-700'}`}>{d.getDate()}</span>
            </header>
            <div className="flex flex-1 flex-col gap-2">
                {items.map((item) => (
                    <PlanItemCard key={item.id} item={item} referenceLabel={referenceLabel(item)} onOpen={onOpen} showStatus compact />
                ))}
            </div>
            <button type="button" onClick={() => onAdd(day)} className="mt-2 rounded-lg px-2 py-1 text-left text-xs text-gray-500 hover:bg-white hover:text-gray-800">
                + Add
            </button>
        </section>
    )
}

/**
 * Calendar week. Dropping a card on a day sets its target date. Cards without a date, or dated
 * outside this week, sit in the tray below so they can be dragged in. The API can move a date but
 * not clear one, so the tray is a source only.
 */
export default function PlanWeek({ items, monday, onChangeWeek, referenceLabel, onOpen, onAdd }: Props) {
    const days = weekDays(monday)
    const sunday = days[6]
    const inWeek = (it: PlanItem) => it.targetDate != null && it.targetDate >= monday && it.targetDate <= sunday
    const open = (it: PlanItem) => it.status === 'PLANNED' || it.status === 'IN_PROGRESS'

    const unscheduled = items.filter((it) => it.targetDate == null && open(it))
    const overdue = items.filter((it) => it.targetDate != null && isBefore(it.targetDate, monday) && open(it))
    const later = items.filter((it) => it.targetDate != null && it.targetDate > sunday && open(it))
    const thisMonday = (() => { const t = todayISO(); return addDays(t, -((parseLocal(t).getDay() + 6) % 7)) })()

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-gray-700">
                    {formatDate(monday)} – {formatDate(sunday)}
                </h2>
                <div className="flex gap-1">
                    <Button variant="secondary" size="sm" onClick={() => onChangeWeek(addDays(monday, -7))} aria-label="Previous week">‹ Prev</Button>
                    <Button variant="secondary" size="sm" onClick={() => onChangeWeek(thisMonday)} disabled={monday === thisMonday}>Today</Button>
                    <Button variant="secondary" size="sm" onClick={() => onChangeWeek(addDays(monday, 7))} aria-label="Next week">Next ›</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {days.map((day) => (
                    <DayColumn key={day} day={day} items={items.filter((it) => it.targetDate === day)} referenceLabel={referenceLabel} onOpen={onOpen} onAdd={onAdd} />
                ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Tray title="Unscheduled" hint="Drag onto a day to schedule" items={unscheduled} referenceLabel={referenceLabel} onOpen={onOpen} />
                <Tray title="Overdue" hint="Dated before this week, still open" items={overdue} referenceLabel={referenceLabel} onOpen={onOpen} tone="red" />
                <Tray title="Later" hint="Dated after this week" items={later} referenceLabel={referenceLabel} onOpen={onOpen} />
            </div>
            {items.filter(inWeek).length === 0 && unscheduled.length + overdue.length + later.length === 0 && (
                <p className="mt-4 text-center text-sm text-gray-500">Nothing scheduled this week. Add an item to a day, or create one from the Board.</p>
            )}
        </div>
    )
}

function Tray({ title, hint, items, referenceLabel, onOpen, tone }: { title: string; hint: string; items: PlanItem[]; tone?: 'red' } & Pick<Props, 'referenceLabel' | 'onOpen'>) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-3">
            <header className="mb-2 flex items-center justify-between">
                <div>
                    <h3 className={`text-sm font-semibold ${tone === 'red' && items.length ? 'text-red-700' : 'text-gray-800'}`}>{title}</h3>
                    <p className="text-xs text-gray-500">{hint}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{items.length}</span>
            </header>
            <div className="flex flex-col gap-2">
                {items.length === 0 ? (
                    <p className="py-3 text-center text-xs text-gray-400">Empty</p>
                ) : items.map((item) => (
                    <PlanItemCard key={item.id} item={item} referenceLabel={referenceLabel(item)} onOpen={onOpen} showStatus />
                ))}
            </div>
        </section>
    )
}
