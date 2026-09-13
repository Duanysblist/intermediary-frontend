import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import {
    DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors,
    type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { calendarApi } from '../../api/resources'
import { planItems } from '../../hooks/resources'
import { useMovePlanItem, useReferenceLabel } from './usePlanBoard'
import PlanBoard from './PlanBoard'
import PlanWeek from './PlanWeek'
import PlanItemForm from './PlanItemForm'
import PlanItemDetail from './PlanItemDetail'
import LogSessionForm from './LogSessionForm'
import RecurringPlansModal from './RecurringPlansModal'
import { PlanItemCardBody } from './PlanItemCard'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { inputClass } from '../../components/ui/Field'
import { ErrorState, LoadingState, PageHeader } from '../../components/ui/Page'
import { startOfWeek, todayISO } from '../../lib/format'
import type { PlanItem, PlanItemInput, PlanItemStatus } from '../../types'

type View = 'board' | 'week'
type Sheet =
    | { kind: 'none' }
    | { kind: 'create'; defaults: Partial<PlanItemInput> }
    | { kind: 'detail'; item: PlanItem }
    | { kind: 'edit'; item: PlanItem }
    | { kind: 'log'; item: PlanItem }
    | { kind: 'routines' }
    | { kind: 'calendar' }

type DropTarget = { status?: PlanItemStatus; targetDate?: string | null }

export default function PlanPage() {
    const [params, setParams] = useSearchParams()
    const view: View = params.get('view') === 'week' ? 'week' : 'board'
    const monday = params.get('week') ?? startOfWeek(todayISO())
    function setView(v: View) { setParams(v === 'board' ? {} : { view: v, week: monday }) }
    function setWeek(m: string) { setParams({ view: 'week', week: m }) }

    const { data, isPending, isError, error } = planItems.useList()
    const createMut = planItems.useCreate()
    const updateMut = planItems.useUpdate()
    const deleteMut = planItems.useRemove()
    const moveMut = useMovePlanItem()
    const refLabel = useReferenceLabel()
    const calendarLink = useMutation({ mutationFn: calendarApi.link })

    const [sheet, setSheet] = useState<Sheet>({ kind: 'none' })
    const [deleting, setDeleting] = useState<PlanItem | null>(null)
    const [dragging, setDragging] = useState<PlanItem | null>(null)
    const [copied, setCopied] = useState(false)

    // A small movement threshold keeps plain clicks opening the detail view instead of starting a drag.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor),
    )

    function closeSheet() { setSheet({ kind: 'none' }); createMut.reset(); updateMut.reset() }

    function onDragStart(e: DragStartEvent) {
        setDragging((e.active.data.current as { item: PlanItem })?.item ?? null)
    }

    function onDragEnd(e: DragEndEvent) {
        setDragging(null)
        const item = (e.active.data.current as { item: PlanItem } | undefined)?.item
        const target = e.over?.data.current as DropTarget | undefined
        if (!item || !target) return
        if (target.status && target.status !== item.status) {
            moveMut.mutate({ item, patch: { status: target.status } })
        } else if (target.targetDate !== undefined && target.targetDate !== item.targetDate) {
            moveMut.mutate({ item, patch: { targetDate: target.targetDate } })
        }
    }

    function handleSubmit(input: PlanItemInput) {
        if (sheet.kind === 'edit') {
            updateMut.mutate({ id: sheet.item.id, body: input }, {
                onSuccess: (saved) => setSheet({ kind: 'detail', item: saved }),
            })
        } else {
            createMut.mutate(input, { onSuccess: closeSheet })
        }
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

    const items = data
    const openCount = items.filter((i) => i.status === 'PLANNED' || i.status === 'IN_PROGRESS').length
    const referenceLabel = (it: PlanItem) => refLabel(it.referenceEntityType, it.referenceEntityId)
    const current = sheet.kind === 'detail' || sheet.kind === 'edit' || sheet.kind === 'log'
        ? items.find((i) => i.id === sheet.item.id) ?? sheet.item
        : null

    return (
        <div>
            <PageHeader
                title="Plan"
                subtitle={`${openCount} open intention${openCount === 1 ? '' : 's'} · drag cards to change status or date`}
                actions={
                    <>
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm shadow-xs" role="tablist">
                            {(['board', 'week'] as View[]).map((v) => (
                                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                                        className={`rounded-md px-3 py-1 font-medium transition-colors ${view === v ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                    {v === 'board' ? 'Board' : 'Week'}
                                </button>
                            ))}
                        </div>
                        <Button variant="secondary" onClick={() => setSheet({ kind: 'routines' })}>Routines</Button>
                        <Button variant="secondary" onClick={openCalendar} title="Subscribe to your plan from a calendar app">Calendar feed</Button>
                        <Button onClick={() => setSheet({ kind: 'create', defaults: {} })}>+ New item</Button>
                    </>
                }
            />

            {moveMut.isError && (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    Couldn't move that item: {moveMut.error.message}
                </p>
            )}

            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
                {view === 'board' ? (
                    <PlanBoard
                        items={items}
                        referenceLabel={referenceLabel}
                        onOpen={(item) => setSheet({ kind: 'detail', item })}
                        onAdd={(status) => setSheet({ kind: 'create', defaults: { status } })}
                    />
                ) : (
                    <PlanWeek
                        items={items}
                        monday={monday}
                        onChangeWeek={setWeek}
                        referenceLabel={referenceLabel}
                        onOpen={(item) => setSheet({ kind: 'detail', item })}
                        onAdd={(targetDate) => setSheet({ kind: 'create', defaults: { targetDate } })}
                    />
                )}
                <DragOverlay dropAnimation={null}>
                    {dragging && (
                        <div className="w-64 rotate-1 rounded-lg border border-blue-300 bg-white p-3 shadow-xl">
                            <PlanItemCardBody item={dragging} referenceLabel={referenceLabel(dragging)} />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            <Modal open={sheet.kind === 'create' || sheet.kind === 'edit'} onClose={closeSheet}>
                {(sheet.kind === 'create' || sheet.kind === 'edit') && (
                    <PlanItemForm
                        key={sheet.kind === 'edit' ? sheet.item.id : 'new'}
                        initial={sheet.kind === 'edit' ? sheet.item : undefined}
                        defaults={sheet.kind === 'create' ? sheet.defaults : undefined}
                        onSubmit={handleSubmit}
                        onCancel={sheet.kind === 'edit' ? () => setSheet({ kind: 'detail', item: sheet.item }) : closeSheet}
                        isSaving={createMut.isPending || updateMut.isPending}
                        error={createMut.error || updateMut.error}
                    />
                )}
            </Modal>

            <Modal open={sheet.kind === 'detail'} onClose={closeSheet}>
                {sheet.kind === 'detail' && current && (
                    <PlanItemDetail
                        item={current}
                        referenceLabel={referenceLabel(current)}
                        onEdit={() => setSheet({ kind: 'edit', item: current })}
                        onLog={() => setSheet({ kind: 'log', item: current })}
                        onDelete={() => setDeleting(current)}
                        onClose={closeSheet}
                    />
                )}
            </Modal>

            <Modal open={sheet.kind === 'log'} onClose={closeSheet}>
                {sheet.kind === 'log' && current && (
                    <LogSessionForm item={current} onDone={closeSheet} onCancel={() => setSheet({ kind: 'detail', item: current })} />
                )}
            </Modal>

            <Modal open={sheet.kind === 'routines'} onClose={closeSheet} wide>
                {sheet.kind === 'routines' && <RecurringPlansModal onClose={closeSheet} />}
            </Modal>

            <Modal open={sheet.kind === 'calendar'} onClose={closeSheet}>
                <h2 className="text-lg font-semibold text-gray-900">Calendar feed</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Subscribe to this address from Google Calendar, Apple Calendar or Outlook and every dated plan item appears as an all-day event.
                    Anyone with the link can read your plan titles, so treat it like a password.
                </p>
                {calendarLink.isPending && <p className="mt-4 text-sm text-gray-500">Fetching your link…</p>}
                {calendarLink.isError && <p className="mt-4 text-sm text-red-600">{calendarLink.error.message}</p>}
                {calendarLink.data && (
                    <>
                        <input readOnly className={`${inputClass} mt-4 font-mono text-xs`} value={calendarLink.data.url} onFocus={(e) => e.currentTarget.select()} />
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="secondary" onClick={closeSheet}>Close</Button>
                            <Button onClick={copyCalendar}>{copied ? 'Copied ✓' : 'Copy link'}</Button>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">Google Calendar: Other calendars → + → From URL. Apple Calendar: File → New Calendar Subscription.</p>
                    </>
                )}
            </Modal>

            <ConfirmDialog
                open={deleting !== null}
                title="Delete plan item?"
                message={deleting ? `“${deleting.title}” and its history will be removed.` : undefined}
                isWorking={deleteMut.isPending}
                error={deleteMut.error}
                onConfirm={() => deleting && deleteMut.mutate(deleting.id, { onSuccess: () => { setDeleting(null); closeSheet() } })}
                onCancel={() => { setDeleting(null); deleteMut.reset() }}
            />
        </div>
    )
}
