import { useState } from 'react'
import Icon from './Icon'
import { TONE_RING, TONE_SOLID, toneOf } from './tones'
import type { PlanItem } from '../../types'

/** The round checkbox on a task row, ringed in the item's kind colour and filled when done. */
export default function TaskCheck({ item, onToggle }: { item: PlanItem; onToggle: () => void }) {
    // Animate only a check the user just made, not every done item on first render.
    const [tapped, setTapped] = useState(false)
    const done = item.status === 'DONE'
    const tone = toneOf(item.intent)
    return (
        <button
            type="button"
            onClick={() => { setTapped(true); onToggle() }}
            aria-label={done ? `Mark “${item.title}” not done` : `Mark “${item.title}” done`}
            className="grid h-14 w-12 shrink-0 place-items-center focus-visible:-outline-offset-4"
        >
            <span
                className={`grid h-6 w-6 place-items-center rounded-full border-2 motion-safe:transition-colors motion-safe:duration-200 ${done ? `${TONE_SOLID[tone]} text-surface` : `${TONE_RING[tone]} text-transparent`} ${done && tapped ? 'motion-safe:animate-[check-pop_260ms_ease-out]' : ''}`}
            >
                <Icon
                    name="check"
                    className={`h-3.5 w-3.5 [stroke-dasharray:20] ${done && tapped ? 'motion-safe:animate-[check-draw_240ms_ease-out_60ms_both]' : ''}`}
                    strokeWidth={3.2}
                />
            </span>
        </button>
    )
}
