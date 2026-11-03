import type { ReactNode } from 'react'
import Icon from './Icon'

/** The phone's floating action button, above the tab bar. Wider screens put the same action in the page header. */
export default function Fab({ onClick, children }: { onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-13 items-center gap-2 rounded-full bg-accent pl-4 pr-5 text-base font-semibold text-on-accent shadow-lg shadow-accent/25 motion-safe:transition-transform motion-safe:active:scale-95 lg:hidden"
        >
            <Icon name="plus" className="h-5 w-5" strokeWidth={2.6} />
            {children}
        </button>
    )
}
