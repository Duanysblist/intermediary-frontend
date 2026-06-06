import { Routes, Route } from 'react-router'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import ApplicationsPage from './features/applications/ApplicationsPage'
import PlanPage from './pages/PlanPage'
import PromptPage from './pages/PromptPage'

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/plan" element={<PlanPage />} />
                <Route path="/prompt" element={<PromptPage />} />
            </Route>
        </Routes>
    )
}