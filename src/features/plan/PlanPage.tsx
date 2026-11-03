import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import {
    DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors,
    type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { calendarApi } from '../../api/resources'
import { planItems } from '../../hooks/resources'
import { useMovePlanItem, useReorderPlanItems } from './usePlanBoard'
import { placeInColumn } from './order'
import { useReferenceOptions } from './references'
import PlanBoard from './PlanBoard'
import PlanWeek from './PlanWeek'
import PlanItemForm from './PlanItemForm'
import PlanItemSheet from './PlanItemSheet'
import RecurringPlansModal from './RecurringPlansModal'
import { PlanItemCardBody } from './PlanItemCard'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { inputClass } from '../../components/ui/Field'
import { ErrorState, LoadingState, PageHeader } from '../../components/ui/Page'
import { startOfWeek, todayISO } from '../../lib/format'
import { comparePlanItems, isOpenPlanItem, type PlanItem, type PlanItemInput, type PlanItemStatus } from '../../types'
import Icon from '../../components/ui/Icon'
import Fab from '../../components/ui/Fab'

type View = 'board' | 'week'
type Sheet =
    | { kind: 'none' }
    | { kind: 'create'; defaults: Partial<PlanItemInput> }
    | { kind: 'item'; item: PlanItem }
    | { kind: 'routines' }
    | { kind: 'calendar' }

/** A board column or card (status, plus overId for a card) or a week day or tray (targetDate). */
type DropTarget = { status?: PlanItemStatus; targetDate?: string | null; overId?: number }

export default function PlanPage() {
    const [params, setParams] = useSearchParams()
    const view: View = params.get('view') === 'week' ? 'week' : 'board'
    const monday = params.get('week') ?? startOfWeek(todayISO())
    function setView(v: View) { setParams(v === 'board' ? {} : { view: v, week: monday }) }
    function setWeek(m: string) { setParams({ view: 'week', week: m }) }

    const { data, isPending, isError, error } = planItems.useList()
    const createMut = planItems.useCreate()
    const moveMut = useMovePlanItem()
    const reorderMut = useReorderPlanItems()
    const { labelFor } = useReferenceOptions()
    const calendarLink = useMutation({ mutationFn: calendarApi.link })

    const [sheet, setSheet] = useState<Sheet>({ kind: 'none' })
    const [dragging, setDragging] = useState<PlanItem | null>(null)
    const [copied, setCopied] = useState(false)
    const items = useMemo(() => [...(data ?? [])].sort(comparePlanItems), [data])

    // A small movement threshold keeps plain clicks opening the detail view instead of starting a drag.
    // On touch a drag starts after a short press, so a swipe still scrolls the page and the board.
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
        useSensor(KeyboardSensor),
    )

    function closeSheet() { setSheet({ kind: 'none' }); createMut.reset() }

    function onDragStart(e: DragStartEvent) {
        setDragging((e.active.data.current as { item: PlanItem })?.item ?? null)
    }

    function onDragEnd(e: DragEndEvent) {
        setDragging(null)
        const item = (e.active.data.current as { item: PlanItem } | undefined)?.item
        const target = e.over?.data.current as DropTarget | undefined
        if (!item || !target) return
        if (target.status) {
            const column = items.filter((it) => it.status === target.status).map((it) => it.id)
            const ids = placeInColumn(column, item.id, target.overId)
            if (target.status !== item.status || ids.join() !== column.join()) reorderMut.mutate({ status: target.status, ids })
        } else if (target.targetDate !== undefined && target.targetDate !== item.targetDate) {
            moveMut.mutate({ item, patch: { targetDate: target.targetDate } })
        }
    }

    function handleSubmit(input: PlanItemInput) {
        createMut.mutate(input, { onSuccess: closeSheet })
    }

    function openCalendar() {
        setSheet({ kind: 'calendar' })
        setCopied(false)
        calendarLink.mutate()
    }

    async function copyCalendar() {
        if (!calendarLink.data) return
        try { await navigator.clipboard.writeText(calendarLink.data.url); setCopied(true) } catch { setCopied(false) }
    }

    if (isPending) return <LoadingState what="plan" />
    if (isError) return <ErrorState what="plan" error={error} />

    const openCount = items.filter(isOpenPlanItem).length
    const referenceLabel = (it: PlanItem) => labelFor(it.referenceEntityType, it.referenceEntityId)

    return (
        <div>
            <PageHeader
                title="Plan"
                subtitle={`${openCount} open intention${openCount === 1 ? '' : 's'} · hold and drag a card to move it`}
                actions={
                    <span className="hidden lg:block">
                        <Button onClick={() => setSheet({ kind: 'create', defaults: {} })}>
                            <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />New item
                        </Button>
                    </span>
                }
            />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-[10px] bg-sunken p-0.5 text-sm" role="tablist">
                    {(['board', 'week'] as View[]).map((v) => (
                        <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                                className={`min-h-11 rounded-lg px-4 font-medium sm:min-h-9 transition-colors ${view === v ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'}`}>
                            {v === 'board' ? 'Board' : 'Week'}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSheet({ kind: 'routines' })}>Routines</Button>
                    <Button variant="ghost" size="sm" onClick={openCalendar} title="Subscribe to your plan from a calendar app">Calendar feed</Button>
                </div>
            </div>

            {(moveMut.isError || reorderMut.isError) && (
                <p className="mb-3 rounded-lg border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger" role="alert">
                    Couldn't move that item: {(moveMut.error ?? reorderMut.error)?.message}
                </p>
            )}

            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
                {view === 'board' ? (
                    <PlanBoard
                        items={items}
                        referenceLabel={referenceLabel}
                        onOpen={(item) => setSheet({ kind: 'item', item })}
                        onAdd={(status) => setSheet({ kind: 'create', defaults: { status } })}
                    />
                ) : (
                    <PlanWeek
                        items={items}
                        monday={monday}
                        onChangeWeek={setWeek}
                        referenceLabel={referenceLabel}
                        onOpen={(item) => setSheet({ kind: 'item', item })}
                        onAdd={(targetDate) => setSheet({ kind: 'create', defaults: { targetDate } })}
                    />
                )}
                <DragOverlay dropAnimation={null}>
                    {dragging && (
                        <div className="w-64 rotate-1 rounded-lg border border-accent/50 bg-surface p-3 shadow-xl">
                            <PlanItemCardBody item={dragging} referenceLabel={referenceLabel(dragging)} />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            <Fab onClick={() => setSheet({ kind: 'create', defaults: {} })}>New item</Fab>

            <Modal open={sheet.kind === 'create'} onClose={closeSheet}>
                {sheet.kind === 'create' && (
                    <PlanItemForm
                        defaults={sheet.defaults}
                        onSubmit={handleSubmit}
                        onCancel={closeSheet}
                        isSaving={createMut.isPending}
                        error={createMut.error}
                    />
                )}
            </Modal>

            {sheet.kind === 'item' && <PlanItemSheet key={sheet.item.id} item={sheet.item} onClose={closeSheet} />}

            <Modal open={sheet.kind === 'routines'} onClose={closeSheet} wide>
                {sheet.kind === 'routines' && <RecurringPlansModal onClose={closeSheet} />}
            </Modal>

            <Modal open={sheet.kind === 'calendar'} onClose={closeSheet}>
                <h2 className="text-lg font-semibold text-ink">Calendar feed</h2>
                <p className="mt-1 text-sm text-ink-2">
                    Subscribe to this address from Google Calendar, Apple Calendar or Outlook and every dated plan item appears as an all-day event.
                    Anyone with the link can read your plan titles, so treat it like a password.
                </p>
                {calendarLink.isPending && <p className="mt-4 text-sm text-muted">Fetching your link…</p>}
                {calendarLink.isError && <p className="mt-4 text-sm text-danger">{calendarLink.error.message}</p>}
                {calendarLink.data && (
                    <>
                        <input readOnly className={`${inputClass} mt-4 font-mono text-xs`} value={calendarLink.data.url} onFocus={(e) => e.currentTarget.select()} />
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="secondary" onClick={closeSheet}>Close</Button>
                            <Button onClick={copyCalendar}>{copied ? <><Icon name="check" className="h-4 w-4" strokeWidth={2.6} />Copied</> : 'Copy link'}</Button>
                        </div>
                        <p className="mt-3 text-xs text-muted">Google Calendar: Other calendars → + → From URL. Apple Calendar: File → New Calendar Subscription.</p>
                    </>
                )}
            </Modal>

        </div>
    )
}
