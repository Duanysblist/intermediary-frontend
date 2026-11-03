import { label } from '../../types'
import { TONE_CLASS, toneOf, type Tone } from './tones'

export default function Pill({ value, tone, className = '' }: { value: string; tone?: Tone; className?: string }) {
    const t = tone ?? toneOf(value)
    return (
        <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[t]} ${className}`}>
            {label(value)}
        </span>
    )
}
