export type Tone = 'blue' | 'amber' | 'violet' | 'green' | 'red' | 'gray' | 'slate' | 'teal' | 'orange'

export const TONE_CLASS: Record<Tone, string> = {
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

/** Solid fill and ring in a tone, for the round task check. */
export const TONE_SOLID: Record<Tone, string> = {
    blue: 'border-tone-blue bg-tone-blue',
    amber: 'border-tone-amber bg-tone-amber',
    violet: 'border-tone-violet bg-tone-violet',
    green: 'border-tone-green bg-tone-green',
    red: 'border-tone-red bg-tone-red',
    gray: 'border-tone-gray bg-tone-gray',
    slate: 'border-tone-slate bg-tone-slate',
    teal: 'border-tone-teal bg-tone-teal',
    orange: 'border-tone-orange bg-tone-orange',
}
export const TONE_RING: Record<Tone, string> = {
    blue: 'border-tone-blue', amber: 'border-tone-amber', violet: 'border-tone-violet', green: 'border-tone-green', red: 'border-tone-red',
    gray: 'border-tone-gray', slate: 'border-tone-slate', teal: 'border-tone-teal', orange: 'border-tone-orange',
}

export const toneOf = (value: string): Tone => TONES[value] ?? 'gray'

/** One tone per enum value across the whole app, so a status looks the same on every screen. */
export const TONES: Record<string, Tone> = {
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
