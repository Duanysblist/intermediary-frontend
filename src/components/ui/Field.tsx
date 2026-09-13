import type { ReactNode } from 'react'

export const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs ' +
    'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ' +
    'disabled:bg-gray-50 disabled:text-gray-500'

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
            <span className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
            </span>
            {children}
            {error ? (
                <span className="mt-1 block text-xs text-red-600">{error}</span>
            ) : hint ? (
                <span className="mt-1 block text-xs text-gray-500">{hint}</span>
            ) : null}
        </label>
    )
}
