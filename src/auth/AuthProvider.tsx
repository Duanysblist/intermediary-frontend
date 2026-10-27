import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ApiError, UNAUTHORIZED_EVENT, getToken, request, setToken } from '../api/client'
import { isDemo } from '../demo/mode'
import { AuthContext, type AuthState } from './authContext'
import SessionExpiredDialog from './SessionExpiredDialog'

type LoginResponse = { token: string; username: string; expiresAt: string }
type MeResponse = { username: string; expiresAt: string }

export default function AuthProvider({ children }: { children: ReactNode }) {
    const qc = useQueryClient()
    const [username, setUsername] = useState<string | null>(isDemo ? 'demo' : null)
    const [checking, setChecking] = useState(!isDemo && getToken() != null)
    const [expired, setExpired] = useState(false)

    // Validate a stored token once on load. Only a rejected token ends the session; a network or server error keeps it.
    useEffect(() => {
        if (isDemo || !getToken()) return
        let cancelled = false
        request<MeResponse>('/auth/me')
            .then((me) => { if (!cancelled) setUsername(me.username) })
            .catch((err) => {
                if (cancelled || !(err instanceof ApiError && err.status === 401)) return
                setToken(null)
                setUsername(null)
                // The 401 also fired the expired event; there was no page to keep, so go straight to the login screen.
                setExpired(false)
            })
            .finally(() => { if (!cancelled) setChecking(false) })
        return () => { cancelled = true }
    }, [])

    const logout = useCallback(() => {
        setToken(null)
        setUsername(null)
        setExpired(false)
        qc.clear()
    }, [qc])

    // A rejected token anywhere in the app: keep the current page (and anything typed on it) and ask for the password.
    const onExpired = useCallback(() => setExpired(true), [])
    useEffect(() => {
        if (isDemo) return
        window.addEventListener(UNAUTHORIZED_EVENT, onExpired)
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, onExpired)
    }, [onExpired])

    const login = useCallback(async (u: string, p: string) => {
        const res = await request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: u, password: p }),
            auth: false,
        })
        setToken(res.token)
        setUsername(res.username)
        setExpired(false)
        void qc.invalidateQueries()
    }, [qc])

    const value = useMemo<AuthState>(() => ({ username, checking, expired, login, logout }), [username, checking, expired, login, logout])
    return (
        <AuthContext.Provider value={value}>
            {children}
            <SessionExpiredDialog />
        </AuthContext.Provider>
    )
}
