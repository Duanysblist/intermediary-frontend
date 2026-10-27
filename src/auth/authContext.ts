import { createContext, useContext } from 'react'

export type AuthState = {
    /** null = not signed in (or a token whose user is not yet known); in demo mode a fixed pseudo-user. */
    username: string | null
    /** true while the stored token is being validated on first load. */
    checking: boolean
    /** true after the server rejected the session mid-use; the page stays up and a sign-in prompt is shown. */
    expired: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
