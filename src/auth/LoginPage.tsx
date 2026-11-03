import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from './authContext'
import Field, { inputClass } from '../components/ui/Field'
import Button from '../components/ui/Button'
import { DEMO_PATH } from '../demo/mode'

export default function LoginPage() {
    const { username: current, login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    if (current) return <Navigate to="/" replace />
    const from = (location.state as { from?: string } | null)?.from ?? '/'

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
            await login(username.trim(), password)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign-in failed')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
            <div className="w-full max-w-sm">
                <div className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold tracking-tight text-ink">
                    <span className="inline-block h-3 w-3 rounded-full bg-accent" aria-hidden="true" />
                    intermediary
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-rule bg-surface p-6 shadow-sm">
                    <h1 className="text-lg font-semibold text-ink">Sign in</h1>
                    <Field label="Username" required>
                        <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
                    </Field>
                    <Field label="Password" required>
                        <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                    </Field>
                    {error && <p className="text-sm text-danger" role="alert">{error}</p>}
                    <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
                </form>
                <p className="mt-6 text-center text-sm text-muted">
                    Just looking?{' '}
                    <a href={DEMO_PATH} className="font-medium text-accent hover:underline">Try the demo with sample data</a>
                </p>
            </div>
        </div>
    )
}
