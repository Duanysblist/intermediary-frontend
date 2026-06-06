import Modal from './Modal'

type Props = {
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    isWorking?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', isWorking, onConfirm, onCancel }: Props) {
    return (
        <Modal open={open} onClose={onCancel}>
            <h2 className="text-lg font-semibold">{title}</h2>
            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
            <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm">Cancel</button>
                <button type="button" onClick={onConfirm} disabled={isWorking}
                        className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                    {isWorking ? 'Deleting…' : confirmLabel}
                </button>
            </div>
        </Modal>
    )
}