import type { ApplicationStatus } from '../../types'

const STYLES: Record<ApplicationStatus, string> = {
    APPLIED:      'bg-blue-100 text-blue-700',
    SCREENING:    'bg-amber-100 text-amber-700',
    INTERVIEWING: 'bg-violet-100 text-violet-700',
    OFFER:        'bg-green-100 text-green-700',
    REJECTED:     'bg-red-100 text-red-700',
    WITHDRAWN:    'bg-gray-100 text-gray-600',
    GHOSTED:      'bg-gray-100 text-gray-500',
}

export default function StatusPill({ status }: { status: ApplicationStatus }) {
    const label = status.charAt(0) + status.slice(1).toLowerCase()
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {label}
    </span>
    )
}