import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../../auth/authContext'
import { isDemo } from '../../demo/mode'

const tabs = [
    { to: '/', label: 'Dashboard' },
    { to: '/plan', label: 'Plan' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/applications', label: 'Applications' },
    { to: '/certifications', label: 'Certifications' },
    { to: '/documents', label: 'Documents' },
    { to: '/review', label: 'Review' },
    { to: '/prompt', label: 'Prompt' },
]

export default function AppShell() {
    const { username, logout } = useAuth()
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {isDemo && (
                <div className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900 ring-1 ring-amber-200">
                    <span className="font-medium">Demo</span> with sample data. Everything works, nothing is saved, and a reload starts over.{' '}
                    <a href="/login" className="font-medium underline hover:text-amber-950">Sign in to your own</a>
                </div>
            )}
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
                <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 sm:px-6" aria-label="Primary">
                    <NavLink to="/" className="mr-4 flex shrink-0 items-center gap-2 py-3 font-semibold tracking-tight">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
                        intermediary
                    </NavLink>
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            end={tab.to === '/'}
                            className={({ isActive }) =>
                                `shrink-0 border-b-2 px-3 py-3 text-sm transition-colors ${
                                    isActive
                                        ? 'border-blue-600 font-medium text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'
                                }`
                            }
                        >
                            {tab.label}
                        </NavLink>
                    ))}
                    <div className="ml-auto flex shrink-0 items-center gap-3 pl-4 text-xs text-gray-500">
                        {!isDemo && username && (
                            <>
                                <span className="hidden sm:inline">{username}</span>
                                <button type="button" onClick={logout} className="rounded px-2 py-1 hover:bg-gray-100 hover:text-gray-900">Sign out</button>
                            </>
                        )}
                    </div>
                </nav>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
                <Outlet />
            </main>
        </div>
    )
}
