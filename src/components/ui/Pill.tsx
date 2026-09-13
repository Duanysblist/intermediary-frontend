import { label } from '../../types'

export type Tone = 'blue' | 'amber' | 'violet' | 'green' | 'red' | 'gray' | 'slate' | 'teal' | 'orange'

const TONE_CLASS: Record<Tone, string> = {
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    violet: 'bg-violet-100 text-violet-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-600',
    slate: 'bg-slate-100 text-slate-500',
    teal: 'bg-teal-100 text-teal-700',
    orange: 'bg-orange-100 text-orange-700',
}

/** One tone per enum value across the whole app, so a status looks the same on every screen. */
const TONES: Record<string, Tone> = {
    // application
    APPLIED: 'blue', SCREENING: 'amber', INTERVIEWING: 'violet', OFFER: 'green',
    REJECTED: 'red', WITHDRAWN: 'gray', GHOSTED: 'slate',
    // certification
    PLANNING: 'gray', STUDYING: 'blue', SCHEDULED: 'amber', PASSED: 'green', FAILED: 'red',
    // plan item status
    PLANNED: 'gray', IN_PROGRESS: 'blue', DONE: 'green', DEFERRED: 'amber', CANCELED: 'slate',
    // plan intent
    STUDY: 'blue', EXERCISE: 'teal', APPLY: 'violet', READ: 'amber', WRITE: 'orange', OTHER: 'gray',
    // document type
    RESUME: 'violet', PLAN: 'blue', GUIDE: 'teal', SPEC: 'amber',
    // workout
    WORKOUT_A: 'teal', WORKOUT_B: 'blue', WALK: 'green',
}

export default function Pill({ value, tone, className = '' }: { value: string; tone?: Tone; className?: string }) {
    const t = tone ?? TONES[value] ?? 'gray'
    return (
        <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[t]} ${className}`}>
            {label(value)}
        </span>
    )
}
