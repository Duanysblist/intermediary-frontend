import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './authContext'
import { LoadingState } from '../components/ui/Page'

/** Gate for every app route: sends unauthenticated visitors to /login and remembers where they were going. */
export default function RequireAuth() {
    const { username, checking } = useAuth()
    const location = useLocation()
    if (checking) return <LoadingState what="your session" />
    if (!username) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    return <Outlet />
}
