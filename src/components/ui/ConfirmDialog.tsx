import Modal from './Modal'
import Button from './Button'

type Props = {
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    isWorking?: boolean
    error?: Error | null
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', isWorking, error, onConfirm, onCancel }: Props) {
    return (
        <Modal open={open} onClose={onCancel}>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
            {error && <p className="mt-3 text-sm text-red-600">{error.message}</p>}
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm} disabled={isWorking}>
                    {isWorking ? 'Deleting…' : confirmLabel}
                </Button>
            </div>
        </Modal>
    )
}
