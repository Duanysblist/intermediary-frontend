import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { UNAUTHORIZED_EVENT, getToken, request, setToken } from '../api/client'
import { isDemo } from '../demo/mode'
import { AuthContext, type AuthState } from './authContext'

type LoginResponse = { token: string; username: string; expiresAt: string }
type MeResponse = { username: string; expiresAt: string }

export default function AuthProvider({ children }: { children: ReactNode }) {
    const qc = useQueryClient()
    const [username, setUsername] = useState<string | null>(isDemo ? 'demo' : null)
    const [checking, setChecking] = useState(!isDemo && getToken() != null)

    // Validate a stored token once on load so an expired one sends the user to the login screen.
    useEffect(() => {
        if (isDemo || !getToken()) return
        let cancelled = false
        request<MeResponse>('/auth/me')
            .then((me) => { if (!cancelled) setUsername(me.username) })
            .catch(() => { if (!cancelled) { setToken(null); setUsername(null) } })
            .finally(() => { if (!cancelled) setChecking(false) })
        return () => { cancelled = true }
    }, [])

    const logout = useCallback(() => {
        setToken(null)
        setUsername(null)
        qc.clear()
    }, [qc])

    // A 401 anywhere in the app clears the session.
    useEffect(() => {
        if (isDemo) return
        window.addEventListener(UNAUTHORIZED_EVENT, logout)
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
    }, [logout])

    const login = useCallback(async (u: string, p: string) => {
        const res = await request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: u, password: p }),
            auth: false,
        })
        setToken(res.token)
        setUsername(res.username)
    }, [])

    const value = useMemo<AuthState>(() => ({ username, checking, login, logout }), [username, checking, login, logout])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
