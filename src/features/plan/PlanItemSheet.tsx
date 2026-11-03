import { useState } from 'react'
import { planItems } from '../../hooks/resources'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PlanItemDetail from './PlanItemDetail'
import PlanItemForm from './PlanItemForm'
import LogSessionForm from './LogSessionForm'
import { useReferenceOptions } from './references'
import type { PlanItem, PlanItemInput } from '../../types'

/**
 * One plan item's detail, edit and log views, plus delete, as used from the board, the week and Today.
 * Render it with `key={item.id}` so each item opens on its detail view.
 */
export default function PlanItemSheet({ item, onClose }: { item: PlanItem; onClose: () => void }) {
    const [mode, setMode] = useState<'detail' | 'edit' | 'log'>('detail')
    const [deleting, setDeleting] = useState(false)
    const list = planItems.useList()
    const updateMut = planItems.useUpdate()
    const deleteMut = planItems.useRemove()
    const { labelFor } = useReferenceOptions()
    // Follow the cached copy so a status change made elsewhere shows here too.
    const current = list.data?.find((i) => i.id === item.id) ?? item

    function save(input: PlanItemInput) {
        updateMut.mutate({ id: current.id, body: input }, { onSuccess: () => setMode('detail') })
    }

    return (
        <>
            <Modal open={!deleting} onClose={onClose}>
                {mode === 'detail' && (
                    <PlanItemDetail
                        item={current}
                        referenceLabel={labelFor(current.referenceEntityType, current.referenceEntityId)}
                        onEdit={() => setMode('edit')}
                        onLog={() => setMode('log')}
                        onDelete={() => setDeleting(true)}
                        onClose={onClose}
                    />
                )}
                {mode === 'edit' && (
                    <PlanItemForm
                        initial={current}
                        onSubmit={save}
                        onCancel={() => { updateMut.reset(); setMode('detail') }}
                        isSaving={updateMut.isPending}
                        error={updateMut.error}
                    />
                )}
                {mode === 'log' && <LogSessionForm item={current} onDone={onClose} onCancel={() => setMode('detail')} />}
            </Modal>
            <ConfirmDialog
                open={deleting}
                title="Delete plan item?"
                message={`“${current.title}” and its history will be removed.`}
                isWorking={deleteMut.isPending}
                error={deleteMut.error}
                onConfirm={() => deleteMut.mutate(current.id, { onSuccess: onClose })}
                onCancel={() => { setDeleting(false); deleteMut.reset() }}
            />
        </>
    )
}
