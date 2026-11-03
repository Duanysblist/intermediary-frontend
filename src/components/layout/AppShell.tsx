import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../../auth/authContext'
import { isDemo } from '../../demo/mode'
import Icon, { type IconName } from '../ui/Icon'
import Modal from '../ui/Modal'

type Tab = { to: string; label: string; short?: string; icon: IconName }

// The first four sit in the phone's bottom bar; the rest live behind More there and in the top bar on wider screens.
const primary: Tab[] = [
    { to: '/', label: 'Today', icon: 'today' },
    { to: '/plan', label: 'Plan', icon: 'plan' },
    { to: '/sessions', label: 'Sessions', icon: 'sessions' },
    { to: '/applications', label: 'Applications', short: 'Jobs', icon: 'jobs' },
]
const secondary: Tab[] = [
    { to: '/certifications', label: 'Certifications', icon: 'certifications' },
    { to: '/documents', label: 'Documents', icon: 'documents' },
    { to: '/review', label: 'Review', icon: 'review' },
    { to: '/prompt', label: 'Prompt', icon: 'prompt' },
]

export default function AppShell() {
    const { username, logout } = useAuth()
    const [moreOpen, setMoreOpen] = useState(false)
    return (
        <div className="min-h-dvh bg-page text-ink">
            {isDemo && (
                <div className="bg-warn-tint px-4 py-1.5 text-center text-xs text-warn ring-1 ring-warn/30">
                    <span className="font-medium">Demo</span> with sample data. Nothing is saved, and a reload starts over.{' '}
                    <a href="/login" className="font-medium underline">Sign in to your own</a>
                </div>
            )}

            <header className="sticky top-0 z-40 hidden border-b border-rule bg-surface/95 backdrop-blur md:block">
                <nav className="mx-auto flex max-w-6xl items-center gap-1 px-6" aria-label="Primary">
                    <NavLink to="/" className="-ml-1 mr-3 flex shrink-0 items-center gap-2 rounded-md px-1 py-3 font-semibold tracking-tight">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                        intermediary
                    </NavLink>
                    {[...primary, ...secondary].map((tab) => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            end={tab.to === '/'}
                            className={({ isActive }) =>
                                `shrink-0 border-b-2 px-3 py-3 text-sm transition-colors focus-visible:-outline-offset-2 ${
                                    isActive ? 'border-accent font-medium text-ink' : 'border-transparent text-muted hover:border-rule-strong hover:text-ink'
                                }`
                            }
                        >
                            {tab.label}
                        </NavLink>
                    ))}
                    {!isDemo && username && (
                        <div className="ml-auto flex shrink-0 items-center gap-3 pl-4 text-xs text-muted">
                            <span className="hidden lg:inline">{username}</span>
                            <button type="button" onClick={logout} className="rounded px-2 py-1 hover:bg-sunken hover:text-ink">Sign out</button>
                        </div>
                    )}
                </nav>
            </header>

            <main className="mx-auto max-w-6xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 md:pb-10 md:pt-6">
                <Outlet />
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Primary">
                <div className="grid grid-cols-5">
                    {primary.map((tab) => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            end={tab.to === '/'}
                            onClick={() => setMoreOpen(false)}
                            className={({ isActive }) =>
                                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium focus-visible:-outline-offset-2 ${isActive ? 'text-accent' : 'text-muted'}`
                            }
                        >
                            <Icon name={tab.icon} />
                            {tab.short ?? tab.label}
                        </NavLink>
                    ))}
                    <button
                        type="button"
                        onClick={() => setMoreOpen(true)}
                        aria-haspopup="dialog"
                        className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted focus-visible:-outline-offset-2"
                    >
                        <Icon name="more" />
                        More
                    </button>
                </div>
            </nav>

            <Modal open={moreOpen} onClose={() => setMoreOpen(false)}>
                <h2 className="text-lg font-semibold text-ink">More</h2>
                <ul className="mt-3 divide-y divide-rule">
                    {secondary.map((tab) => (
                        <li key={tab.to}>
                            <NavLink
                                to={tab.to}
                                onClick={() => setMoreOpen(false)}
                                className={({ isActive }) => `flex min-h-12 items-center gap-3 text-base ${isActive ? 'font-medium text-accent' : 'text-ink'}`}
                            >
                                <Icon name={tab.icon} className="h-5 w-5 text-muted" />
                                {tab.label}
                            </NavLink>
                        </li>
                    ))}
                    {!isDemo && username && (
                        <li>
                            <button type="button" onClick={logout} className="flex min-h-12 w-full items-center gap-3 text-base text-ink">
                                <Icon name="signout" className="h-5 w-5 text-muted" />
                                Sign out <span className="text-sm text-muted">({username})</span>
                            </button>
                        </li>
                    )}
                </ul>
            </Modal>
        </div>
    )
}
