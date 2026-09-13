import { NavLink, Outlet } from 'react-router'

const tabs = [
    { to: '/', label: 'Dashboard' },
    { to: '/plan', label: 'Plan' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/applications', label: 'Applications' },
    { to: '/certifications', label: 'Certifications' },
    { to: '/documents', label: 'Documents' },
    { to: '/prompt', label: 'Prompt' },
]

export default function AppShell() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
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
                </nav>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
                <Outlet />
            </main>
        </div>
    )
}
