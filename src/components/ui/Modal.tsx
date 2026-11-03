import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

/** A bottom sheet on phones, a centred dialog from `sm` up. Focus moves in on open, stays inside, and returns on close. */
export default function Modal({ open, onClose, children, wide }: Props) {
    const dialog = useRef<HTMLDivElement>(null)
    // Note who had focus when the sheet opens, before a child's autoFocus takes it, so it can go back on close.
    const [opener, setOpener] = useState<HTMLElement | null>(null)
    const [wasOpen, setWasOpen] = useState(false)
    if (open !== wasOpen) {
        setWasOpen(open)
        setOpener(open && document.activeElement instanceof HTMLElement ? document.activeElement : null)
    }

    useEffect(() => {
        if (!open) return
        // A field with autoFocus may already hold focus; otherwise focus the sheet itself.
        if (!dialog.current?.contains(document.activeElement)) dialog.current?.focus()
        return () => opener?.focus()
    }, [open, opener])

    useEffect(() => {
        if (!open) return
        function onKey(e: KeyboardEvent) {
            const el = dialog.current
            const active = document.activeElement
            // A confirm dialog stacked on top owns the keyboard while it has focus.
            if (!el || (!el.contains(active) && active?.closest('[role="dialog"]'))) return
            if (e.key === 'Escape') onClose()
            if (e.key !== 'Tab') return
            const items = el.querySelectorAll<HTMLElement>(FOCUSABLE)
            if (items.length === 0) { e.preventDefault(); return }
            const first = items[0], last = items[items.length - 1]
            const outside = !el.contains(active) || active === el
            if (e.shiftKey && (active === first || outside)) { e.preventDefault(); last.focus() }
            else if (!e.shiftKey && (active === last || outside)) { e.preventDefault(); first.focus() }
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
                ref={dialog}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                className={`max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-surface px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl ring-1 ring-ink/5 focus:outline-none sm:rounded-xl sm:p-6 ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}
