import type { ReactNode } from 'react'

export const inputClass =
    // 16px text on phones stops iOS zooming into a field on focus.
    'w-full rounded-md border border-rule-strong bg-surface px-3 py-2.5 text-base text-ink shadow-xs sm:py-2 sm:text-sm ' +
    'placeholder:text-faint focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 ' +
    'disabled:bg-page disabled:text-muted'

type Props = {
    label: string
    required?: boolean
    hint?: string
    error?: string
    className?: string
    children: ReactNode
}

/** Label + control + optional hint/error. Keeps every form in the app visually identical. */
export default function Field({ label, required, hint, error, className = '', children }: Props) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1 block text-sm font-medium text-ink-2">
                {label}
                {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
            </span>
            {children}
            {error ? (
                <span className="mt-1 block text-xs text-danger">{error}</span>
            ) : hint ? (
                <span className="mt-1 block text-xs text-muted">{hint}</span>
            ) : null}
        </label>
    )
}
