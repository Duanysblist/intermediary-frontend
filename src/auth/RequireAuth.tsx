import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './authContext'
import { getToken } from '../api/client'
import { LoadingState } from '../components/ui/Page'

/**
 * Gate for every app route: sends visitors with no session to /login and remembers where they were going.
 * A stored token counts as a session even while its user is unknown (the identity check failed for a
 * reason other than a rejected token).
 */
export default function RequireAuth() {
    const { username, checking } = useAuth()
    const location = useLocation()
    if (checking) return <LoadingState what="your session" />
    if (!username && !getToken()) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    return <Outlet />
}
