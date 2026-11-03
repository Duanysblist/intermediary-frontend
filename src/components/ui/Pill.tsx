import { label } from '../../types'

export type Tone = 'blue' | 'amber' | 'violet' | 'green' | 'red' | 'gray' | 'slate' | 'teal' | 'orange'

const TONE_CLASS: Record<Tone, string> = {
    blue: 'bg-tone-blue-soft text-tone-blue',
    amber: 'bg-tone-amber-soft text-tone-amber',
    violet: 'bg-tone-violet-soft text-tone-violet',
    green: 'bg-tone-green-soft text-tone-green',
    red: 'bg-tone-red-soft text-tone-red',
    gray: 'bg-tone-gray-soft text-tone-gray',
    slate: 'bg-tone-slate-soft text-tone-slate',
    teal: 'bg-tone-teal-soft text-tone-teal',
    orange: 'bg-tone-orange-soft text-tone-orange',
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
