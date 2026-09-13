import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-xs ${className}`}>{children}</div>
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
    return (
        <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{children}</h2>
            {aside}
        </div>
    )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
    return (
        <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">
            <p className="text-sm font-medium text-gray-700">{title}</p>
            {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}

export function LoadingState({ what }: { what: string }) {
    return (
        <p className="py-10 text-center text-sm text-gray-500" role="status">
            Loading {what}…
        </p>
    )
}

export function ErrorState({ what, error }: { what: string; error: Error }) {
    return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Couldn't load {what}: {error.message}
        </div>
    )
}

/** Row action links used in tables and cards. */
export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <span className="inline-flex gap-3 whitespace-nowrap text-sm">
            <button type="button" onClick={onEdit} className="text-blue-600 hover:underline">Edit</button>
            <button type="button" onClick={onDelete} className="text-red-600 hover:underline">Delete</button>
        </span>
    )
}
