import { createContext, useContext } from 'react'

export type AuthState = {
    /** null = not signed in; in demo mode a fixed pseudo-user. */
    username: string | null
    /** true while the stored token is being validated on first load. */
    checking: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
