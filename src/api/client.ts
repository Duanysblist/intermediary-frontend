const BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
    status: number
    fieldErrors?: Record<string, string>
    constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.fieldErrors = fieldErrors
    }
}

function friendlyMessage(status: number): string {
    if (status === 400) return "Something in the form wasn't valid — please check your entries and try again."
    if (status === 404) return "That item couldn't be found; it may have already been removed."
    if (status === 409) return "That conflicts with data that already exists."
    if (status >= 500) return "The server ran into a problem. Please try again in a moment."
    return "Something went wrong. Please try again."
}

async function toApiError(res: Response): Promise<ApiError> {
    let payload: any = null
    try { payload = await res.json() } catch { /* body wasn't JSON */ }

    let fieldErrors: Record<string, string> | undefined
    if (payload && Array.isArray(payload.errors)) {
        fieldErrors = {}
        for (const e of payload.errors) {
            if (e?.field && e?.defaultMessage) fieldErrors[e.field] = e.defaultMessage
        }
    }

    const firstField = fieldErrors && Object.values(fieldErrors)[0]
    return new ApiError(res.status, firstField || friendlyMessage(res.status), fieldErrors)
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
    let res: Response
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: { "Content-Type": "application/json", ...options?.headers },
        })
    } catch {
        throw new ApiError(0, "Couldn't reach the server — check your connection and try again.")
    }
    if (!res.ok) throw await toApiError(res)
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
}