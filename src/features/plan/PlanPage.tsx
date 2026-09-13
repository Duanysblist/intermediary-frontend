import { useState } from 'react'
import { useSearchParams } from 'react-router'
import {
    DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors,
    type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { planItems } from '../../hooks/resources'
import { useMovePlanItem, useReferenceLabel } from './usePlanBoard'
import PlanBoard from './PlanBoard'
import PlanWeek from './PlanWeek'
import PlanItemForm from './PlanItemForm'
import PlanItemDetail from './PlanItemDetail'
import { PlanItemCardBody } from './PlanItemCard'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { ErrorState, LoadingState, PageHeader } from '../../components/ui/Page'
import { startOfWeek, todayISO } from '../../lib/format'
import type { PlanItem, PlanItemInput, PlanItemStatus } from '../../types'

type View = 'board' | 'week'
type Sheet =
    | { kind: 'none' }
    | { kind: 'create'; defaults: Partial<PlanItemInput> }
    | { kind: 'detail'; item: PlanItem }
    | { kind: 'edit'; item: PlanItem }

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

    const [sheet, setSheet] = useState<Sheet>({ kind: 'none' })
    const [deleting, setDeleting] = useState<PlanItem | null>(null)
    const [dragging, setDragging] = useState<PlanItem | null>(null)

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
        const target = e.over?.data.current as { status?: PlanItemStatus; targetDate?: string } | undefined
        if (!item || !target) return
        if (target.status && target.status !== item.status) moveMut.mutate({ item, patch: { status: target.status } })
        else if (target.targetDate && target.targetDate !== item.targetDate) moveMut.mutate({ item, patch: { targetDate: target.targetDate } })
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

    if (isPending) return <LoadingState what="plan" />
    if (isError) return <ErrorState what="plan" error={error} />

    const items = data
    const openCount = items.filter((i) => i.status === 'PLANNED' || i.status === 'IN_PROGRESS').length
    const referenceLabel = (it: PlanItem) => refLabel(it.referenceEntityType, it.referenceEntityId)

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
                {sheet.kind === 'detail' && (
                    <PlanItemDetail
                        item={items.find((i) => i.id === sheet.item.id) ?? sheet.item}
                        referenceLabel={referenceLabel(sheet.item)}
                        onEdit={() => setSheet({ kind: 'edit', item: sheet.item })}
                        onDelete={() => setDeleting(sheet.item)}
                        onClose={closeSheet}
                    />
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
