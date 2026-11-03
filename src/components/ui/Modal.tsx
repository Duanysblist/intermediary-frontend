import { useEffect, type ReactNode } from 'react'

type Props = { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }

/** A bottom sheet on phones, a centred dialog from `sm` up. */
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
            className="fixed inset-0 z-50 flex items-end justify-center bg-scrim sm:items-center sm:p-4"
            onMouseDown={onClose}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-surface px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl ring-1 ring-ink/5 sm:rounded-xl sm:p-6 ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}
