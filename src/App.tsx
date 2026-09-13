import { Navigate, Route, Routes } from 'react-router'
import AppShell from './components/layout/AppShell'
import RequireAuth from './auth/RequireAuth'
import LoginPage from './auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import PlanPage from './features/plan/PlanPage'
import SessionsPage from './features/sessions/SessionsPage'
import ApplicationsPage from './features/applications/ApplicationsPage'
import CertificationsPage from './features/certifications/CertificationsPage'
import DocumentsPage from './features/documents/DocumentsPage'
import PromptPage from './features/prompt/PromptPage'

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/plan" element={<PlanPage />} />
                    <Route path="/sessions" element={<SessionsPage />} />
                    <Route path="/applications" element={<ApplicationsPage />} />
                    <Route path="/certifications" element={<CertificationsPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/prompt" element={<PromptPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Route>
        </Routes>
    )
}
