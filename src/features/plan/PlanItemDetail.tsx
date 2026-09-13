import { usePlanEvents } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import Button from '../../components/ui/Button'
import { formatDate, formatDateTime, relativeDay } from '../../lib/format'
import { label, type PlanItem } from '../../types'

type Props = {
    item: PlanItem
    referenceLabel: string | null
    onEdit: () => void
    onLog: () => void
    onDelete: () => void
    onClose: () => void
}

/** Read view of one plan item plus its append-only status history. */
export default function PlanItemDetail({ item, referenceLabel, onEdit, onLog, onDelete, onClose }: Props) {
    const events = usePlanEvents(item.id)
    const loggable = item.intent === 'STUDY' || item.intent === 'EXERCISE' || item.intent === 'READ' || item.intent === 'WRITE' || item.intent === 'OTHER'
    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <Pill value={item.status} />
                        <Pill value={item.intent} />
                        {item.recurringPlanId != null && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">routine</span>}
                    </div>
                </div>
                <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
                    ✕
                </button>
            </div>

            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Target</dt>
                <dd>{item.targetDate ? `${formatDate(item.targetDate)} (${relativeDay(item.targetDate)})` : 'Unscheduled'}</dd>
                <dt className="text-gray-500">Relates to</dt>
                <dd>{referenceLabel ? `${label(item.referenceEntityType)} · ${referenceLabel}` : '—'}</dd>
                <dt className="text-gray-500">Created</dt>
                <dd>{formatDateTime(item.createdAt)}</dd>
                <dt className="text-gray-500">Updated</dt>
                <dd>{formatDateTime(item.updatedAt)}</dd>
            </dl>

            {item.notes && <p className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{item.notes}</p>}

            <section className="mt-6">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">History</h3>
                {events.isPending ? (
                    <p className="text-sm text-gray-500">Loading…</p>
                ) : events.isError ? (
                    <p className="text-sm text-red-600">{events.error.message}</p>
                ) : events.data.length === 0 ? (
                    <p className="text-sm text-gray-500">No status changes yet.</p>
                ) : (
                    <ol className="space-y-2 border-l-2 border-gray-200 pl-4">
                        {[...events.data].sort((a, b) => b.eventTime.localeCompare(a.eventTime)).map((ev) => (
                            <li key={ev.id} className="text-sm">
                                <span className="text-gray-900">
                                    {ev.fromStatus ? label(ev.fromStatus) : 'Created'} → <span className="font-medium">{label(ev.toStatus)}</span>
                                </span>
                                <span className="ml-2 text-xs text-gray-500">{formatDateTime(ev.eventTime)}</span>
                                {ev.notes && <p className="text-xs text-gray-500">{ev.notes}</p>}
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            <div className="mt-6 flex flex-wrap justify-between gap-2">
                <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onDelete}>Delete</Button>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="secondary" onClick={onEdit}>Edit</Button>
                    {loggable && item.status !== 'CANCELED' && (
                        <Button onClick={onLog} title="Record the session that fulfilled this and mark it done">
                            {item.intent === 'EXERCISE' ? 'Log workout' : 'Log session'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
