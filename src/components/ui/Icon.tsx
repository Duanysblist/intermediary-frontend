// One stroke icon set for navigation and quick actions, drawn on a 24px grid at the same weight.
const PATHS = {
    today: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
    plan: 'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v6h-4z',
    sessions: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2.5M9 2h6',
    jobs: 'M3 8h18v12H3zM8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    certifications: 'M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.5 14 7 21l5-2.5 5 2.5-1.5-7',
    documents: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
    review: 'M4 19V9M10 19V5M16 19v-7M22 19H2',
    prompt: 'M4 5h16v11H8l-4 4zM8 10h8',
    plus: 'M12 5v14M5 12h14',
    check: 'M5 12.5l4.5 4.5L19 7',
    close: 'M6 6l12 12M18 6 6 18',
    signout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
    chevronLeft: 'M15 6l-6 6 6 6',
    chevronRight: 'M9 6l6 6-6 6',
    chevronUp: 'M6 15l6-6 6 6',
    chevronDown: 'M6 9l6 6 6-6',
    external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
} as const

export type IconName = keyof typeof PATHS

export default function Icon({ name, className = 'h-6 w-6', strokeWidth = 1.8 }: { name: IconName; className?: string; strokeWidth?: number }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={name === 'more' ? 3 : strokeWidth}
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={PATHS[name]} />
        </svg>
    )
}
