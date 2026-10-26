import { useState, type FormEvent } from 'react'
import { useAuth } from './authContext'
import Modal from '../components/ui/Modal'
import Field, { inputClass } from '../components/ui/Field'
import Button from '../components/ui/Button'

const keepOpen = () => {}

/** Shown over the current page when the server rejects the session, so unsaved input is not lost. */
export default function SessionExpiredDialog() {
    const { expired } = useAuth()
    return expired ? <ExpiredPrompt /> : null
}

// A separate component so the username is read fresh each time the prompt opens.
function ExpiredPrompt() {
    const { username, login, logout } = useAuth()
    const [user, setUser] = useState(username ?? '')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    async function submit(e: FormEvent) {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
            // On success the provider clears `expired` and this prompt unmounts.
            await login(user.trim(), password)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign-in failed')
            setBusy(false)
        }
    }

    // Escape and backdrop clicks do nothing: the user either signs in again or signs out.
    return (
        <Modal open onClose={keepOpen}>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Your session expired</h2>
                    <p className="mt-1 text-sm text-gray-500">Sign in again to keep working. What you have on this page is still here.</p>
                </div>
                <Field label="Username" required>
                    <input className={inputClass} value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" required />
                </Field>
                <Field label="Password" required>
                    <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus required />
                </Field>
                {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={logout}>Sign out</Button>
                    <Button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
                </div>
            </form>
        </Modal>
    )
}
