import { usePlanEvents } from '../../hooks/resources'
import Pill from '../../components/ui/Pill'
import Button from '../../components/ui/Button'
import { formatDate, formatDateTime, relativeDay } from '../../lib/format'
import { splitLinks } from '../../lib/links'
import { label, type PlanItem } from '../../types'
import Icon from '../../components/ui/Icon'

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
                    <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <Pill value={item.status} />
                        <Pill value={item.intent} />
                        {item.recurringPlanId != null && <span className="rounded-full bg-sunken px-2.5 py-0.5 text-xs text-ink-2">routine</span>}
                    </div>
                </div>
                <button type="button" onClick={onClose} className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink" aria-label="Close">
                    <Icon name="close" className="h-5 w-5" />
                </button>
            </div>

            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted">Target</dt>
                <dd>{item.targetDate ? `${formatDate(item.targetDate)} (${relativeDay(item.targetDate)})` : 'Unscheduled'}</dd>
                <dt className="text-muted">Relates to</dt>
                <dd>{referenceLabel ? `${label(item.referenceEntityType)} · ${referenceLabel}` : '—'}</dd>
                <dt className="text-muted">Created</dt>
                <dd>{formatDateTime(item.createdAt)}</dd>
                <dt className="text-muted">Updated</dt>
                <dd>{formatDateTime(item.updatedAt)}</dd>
            </dl>

            {item.notes && (
                <p className="mt-4 whitespace-pre-wrap rounded-lg bg-page p-3 text-sm text-ink-2">
                    {splitLinks(item.notes).map((part, i) =>
                        typeof part === 'string' ? (
                            part
                        ) : (
                            <a key={i} href={part.href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                                {part.text}
                            </a>
                        ),
                    )}
                </p>
            )}

            <section className="mt-6">
                <h3 className="mb-2 text-[15px] font-semibold text-ink-2">History</h3>
                {events.isPending ? (
                    <p className="text-sm text-muted">Loading…</p>
                ) : events.isError ? (
                    <p className="text-sm text-danger">{events.error.message}</p>
                ) : events.data.length === 0 ? (
                    <p className="text-sm text-muted">No status changes yet.</p>
                ) : (
                    <ol className="space-y-2 border-l-2 border-rule pl-4">
                        {[...events.data].sort((a, b) => b.eventTime.localeCompare(a.eventTime)).map((ev) => (
                            <li key={ev.id} className="text-sm">
                                <span className="text-ink">
                                    {ev.fromStatus ? label(ev.fromStatus) : 'Created'} → <span className="font-medium">{label(ev.toStatus)}</span>
                                </span>
                                <span className="ml-2 text-xs text-muted">{formatDateTime(ev.eventTime)}</span>
                                {ev.notes && <p className="text-xs text-muted">{ev.notes}</p>}
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            {/* Phones stack the actions with the main one on top; wider screens line them up with it on the right. */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row-reverse">
                    {loggable && item.status !== 'CANCELED' && (
                        <Button onClick={onLog} title="Record the session that fulfilled this and mark it done">
                            {item.intent === 'EXERCISE' ? 'Log workout' : 'Log session'}
                        </Button>
                    )}
                    <Button variant="secondary" onClick={onEdit}>Edit</Button>
                    <span className="hidden sm:contents"><Button variant="secondary" onClick={onClose}>Close</Button></span>
                </div>
                <Button variant="ghost" className="text-danger hover:bg-danger-tint hover:text-danger" onClick={onDelete}>Delete</Button>
            </div>
        </div>
    )
}
