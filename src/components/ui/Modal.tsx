import { useEffect, type ReactNode } from 'react'

type Props = { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }

export default function Modal({ open, onClose, children, wide }: Props) {
    useEffect(() => {
        if (!open) return
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-[1px]"
            onMouseDown={onClose}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/5 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}
