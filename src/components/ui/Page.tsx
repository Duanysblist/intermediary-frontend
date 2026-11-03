import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
    return (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`rounded-xl border border-rule bg-surface p-4 shadow-xs ${className}`}>{children}</div>
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
    return (
        <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{children}</h2>
            {aside}
        </div>
    )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
    return (
        <div className="rounded-xl border border-dashed border-rule-strong px-6 py-10 text-center">
            <p className="text-sm font-medium text-ink-2">{title}</p>
            {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}

export function LoadingState({ what }: { what: string }) {
    return (
        <p className="py-10 text-center text-sm text-muted" role="status">
            Loading {what}…
        </p>
    )
}

export function ErrorState({ what, error }: { what: string; error: Error }) {
    return (
        <div className="rounded-xl border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger" role="alert">
            Couldn't load {what}: {error.message}
        </div>
    )
}

/** Row action links used in tables and cards. */
export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <span className="inline-flex gap-1 whitespace-nowrap text-sm sm:gap-3">
            <button type="button" onClick={onEdit} className="px-2 py-2 text-accent hover:underline sm:p-0">Edit</button>
            <button type="button" onClick={onDelete} className="px-2 py-2 text-danger hover:underline sm:p-0">Delete</button>
        </span>
    )
}
