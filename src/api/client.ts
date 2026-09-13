// In dev, default to the local backend so `npm run dev` works with no .env file.
// In production builds VITE_API_BASE_URL must be set (see .env.example).
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '')

export const API_BASE_URL = BASE_URL

// ---- Auth token (single user, kept in localStorage so the session survives reloads) ----
const TOKEN_KEY = 'intermediary.token'
export const UNAUTHORIZED_EVENT = 'intermediary:unauthorized'

export function getToken(): string | null {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(token: string | null) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token)
        else localStorage.removeItem(TOKEN_KEY)
    } catch { /* storage unavailable */ }
}

export class ApiError extends Error {
    status: number
    fieldErrors?: Record<string, string>
    constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.fieldErrors = fieldErrors
    }
}

function friendlyMessage(status: number): string {
    if (status === 400) return "Something in the form wasn't valid — please check your entries and try again."
    if (status === 401) return 'Your session has expired. Please sign in again.'
    if (status === 403) return "You don't have access to that."
    if (status === 404) return "That item couldn't be found; it may have already been removed."
    if (status === 409) return 'That conflicts with data that already exists.'
    if (status === 503) return 'That feature is not enabled on this server.'
    if (status >= 500) return 'The server ran into a problem. Please try again in a moment.'
    return 'Something went wrong. Please try again.'
}

type ErrorPayload = { message?: string; errors?: { field?: string; defaultMessage?: string }[] }

async function toApiError(res: Response): Promise<ApiError> {
    let payload: ErrorPayload | null = null
    try { payload = (await res.json()) as ErrorPayload } catch { /* body wasn't JSON */ }

    let fieldErrors: Record<string, string> | undefined
    if (payload && Array.isArray(payload.errors)) {
        fieldErrors = {}
        for (const e of payload.errors) {
            if (e?.field && e?.defaultMessage) fieldErrors[e.field] = e.defaultMessage
        }
    }

    const firstField = fieldErrors && Object.values(fieldErrors)[0]
    const serverMessage = payload?.message && res.status !== 500 ? payload.message : undefined
    return new ApiError(res.status, firstField || serverMessage || friendlyMessage(res.status), fieldErrors)
}

export async function request<T>(path: string, options?: RequestInit & { auth?: boolean }): Promise<T> {
    const { auth = true, ...init } = options ?? {}
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string> | undefined) }
    const token = auth ? getToken() : null
    if (token) headers.Authorization = `Bearer ${token}`

    let res: Response
    try {
        res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
    } catch {
        throw new ApiError(0, "Couldn't reach the server — check that the API is running and try again.")
    }
    if (res.status === 401 && auth && token) {
        // Token rejected (expired or revoked): drop it and let the app return to the login screen.
        setToken(null)
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    if (!res.ok) throw await toApiError(res)
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
}
