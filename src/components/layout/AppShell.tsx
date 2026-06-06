import { NavLink, Outlet } from 'react-router'

const tabs = [
    { to: '/', label: 'Dashboard' },
    { to: '/applications', label: 'Applications' },
    { to: '/plan', label: 'Plan' },
    { to: '/prompt', label: 'Prompt' },
]

export default function AppShell() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <nav className="flex items-center gap-6 border-b border-gray-200 px-6 py-3">
                <span className="font-semibold">intermediary</span>
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.to === '/'}
                        className={({ isActive }) =>
                            isActive
                                ? 'text-gray-900 font-medium border-b-2 border-blue-600 pb-0.5'
                                : 'text-gray-500 hover:text-gray-900'
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>
            <main className="mx-auto max-w-5xl p-6">
                <Outlet />
            </main>
        </div>
    )
}