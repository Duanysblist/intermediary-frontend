import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../../api/client'
import { aiApi } from '../../api/resources'
import { applications, certifications, documents, fitnessSessions, planItems, studySessions, usePlanEvents } from '../../hooks/resources'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { inputClass } from '../../components/ui/Field'
import { Card, ErrorState, LoadingState, PageHeader, SectionTitle } from '../../components/ui/Page'
import { DEFAULT_OPTIONS, buildContext, type ContextOptions } from './buildContext'
import { parseChangeSet, type ChangeSet } from './changeSet'
import ReviewChanges from './ReviewChanges'

// claude.ai accepts a prefilled prompt via ?q=; browsers cap URLs, so fall back to copy above this.
const OPEN_IN_CLAUDE_LIMIT = 7000

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
    return (
        <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span>
                <span className="text-gray-800">{label}</span>
                {hint && <span className="block text-xs text-gray-500">{hint}</span>}
            </span>
        </label>
    )
}

type Review = { source: string; changeSet: ChangeSet } | null

/**
 * The point of the whole app: turn the structured data into context an AI can use without you
 * re-explaining anything, then bring its suggestions back in as reviewable changes.
 */
export default function PromptPage() {
    const plan = planItems.useList()
    const apps = applications.useList()
    const certs = certifications.useList()
    const study = studySessions.useList()
    const fitness = fitnessSessions.useList()
    const events = usePlanEvents()
    const docs = documents.useList()
    const aiStatus = useQuery({ queryKey: ['ai-status'], queryFn: aiApi.status, staleTime: Infinity, retry: false })

    const [opts, setOpts] = useState<ContextOptions>(() => {
        try {
            const saved = localStorage.getItem('prompt-options')
            return saved ? { ...DEFAULT_OPTIONS, ...(JSON.parse(saved) as Partial<ContextOptions>) } : DEFAULT_OPTIONS
        } catch { return DEFAULT_OPTIONS }
    })
    const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
    const [ask, setAsk] = useState('')
    const [importOpen, setImportOpen] = useState(false)
    const [importText, setImportText] = useState('')
    const [importError, setImportError] = useState<string | null>(null)
    const [review, setReview] = useState<Review>(null)

    function set<K extends keyof ContextOptions>(key: K, value: ContextOptions[K]) {
        setOpts((o) => {
            const next = { ...o, [key]: value }
            try { localStorage.setItem('prompt-options', JSON.stringify(next)) } catch { /* private mode */ }
            return next
        })
    }

    const ready = plan.data && apps.data && certs.data && study.data && fitness.data && events.data && docs.data
    const text = useMemo(() => {
        if (!ready) return ''
        return buildContext(
            { planItems: plan.data!, applications: apps.data!, certifications: certs.data!, studySessions: study.data!, fitnessSessions: fitness.data!, planEvents: events.data!, documents: docs.data! },
            opts,
            API_BASE_URL,
        )
    }, [ready, plan.data, apps.data, certs.data, study.data, fitness.data, events.data, docs.data, opts])

    const suggest = useMutation({
        mutationFn: () => aiApi.suggest(text, ask.trim() || undefined),
        onSuccess: (cs) => setReview({ source: `Claude (${aiStatus.data?.model ?? 'server'})`, changeSet: cs }),
    })

    const failed = [plan, apps, certs, study, fitness, events, docs].find((q) => q.isError)
    if (failed?.isError) return <ErrorState what="your data" error={failed.error} />
    if (!ready) return <LoadingState what="your data" />

    async function copy() {
        try {
            await navigator.clipboard.writeText(text)
            setCopied('ok')
        } catch {
            setCopied('fail')
        }
        setTimeout(() => setCopied('idle'), 2000)
    }

    function openInClaude() {
        window.open(`https://claude.ai/new?q=${encodeURIComponent(text)}`, '_blank', 'noopener')
    }

    function importChanges() {
        try {
            const cs = parseChangeSet(importText)
            setImportOpen(false)
            setImportText('')
            setImportError(null)
            setReview({ source: 'pasted JSON', changeSet: cs })
        } catch (err) {
            setImportError(err instanceof Error ? err.message : 'Could not read that.')
        }
    }

    const approxTokens = Math.ceil(text.length / 4)
    const aiEnabled = aiStatus.data?.enabled === true
    const canOpenInClaude = text.length <= OPEN_IN_CLAUDE_LIMIT

    return (
        <div>
            <PageHeader
                title="Prompt"
                subtitle="Your plan, packaged as context. Send it to Claude, then bring the suggested changes back for review."
                actions={
                    <>
                        <Button variant="secondary" onClick={() => setImportOpen(true)}>Import changes…</Button>
                        <Button variant="secondary" onClick={copy} disabled={!text}>
                            {copied === 'ok' ? 'Copied ✓' : copied === 'fail' ? 'Copy failed' : 'Copy'}
                        </Button>
                        <Button variant="secondary" onClick={openInClaude} disabled={!canOpenInClaude} title={canOpenInClaude ? 'Open claude.ai with this prompt prefilled' : 'Too long for a link; use Copy instead'}>
                            Open in Claude ↗
                        </Button>
                        {aiEnabled && (
                            <Button onClick={() => suggest.mutate()} disabled={suggest.isPending}>
                                {suggest.isPending ? 'Asking Claude…' : 'Ask Claude'}
                            </Button>
                        )}
                    </>
                }
            />

            {suggest.isError && (
                <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{suggest.error.message}</p>
            )}

            <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
                <aside className="space-y-5">
                    <Card>
                        <SectionTitle>Ask</SectionTitle>
                        <textarea
                            className={inputClass}
                            rows={3}
                            placeholder="Optional. e.g. “I only have evenings free this week” or “what should I drop?”"
                            value={ask}
                            onChange={(e) => setAsk(e.target.value)}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            {aiEnabled
                                ? 'Ask Claude sends the preview plus this note to the server, which calls Claude and returns changes for you to review.'
                                : aiStatus.isSuccess
                                    ? 'Direct suggestions are off on this server (no API key). Use Open in Claude or Copy, then Import the JSON it gives you.'
                                    : 'Checking whether direct suggestions are available…'}
                        </p>
                    </Card>
                    <Card>
                        <SectionTitle>Include</SectionTitle>
                        <div className="space-y-3">
                            <Toggle label="Plan items" checked={opts.plan} onChange={(v) => set('plan', v)} />
                            {opts.plan && <div className="pl-6"><Toggle label="Also closed items" checked={opts.includeClosedPlan} onChange={(v) => set('includeClosedPlan', v)} /></div>}
                            <Toggle label="Sessions" hint="Study and fitness, recent window" checked={opts.sessions} onChange={(v) => set('sessions', v)} />
                            <Toggle label="Plan events" hint="Status history, same window" checked={opts.events} onChange={(v) => set('events', v)} />
                            <Toggle label="Certifications" checked={opts.certifications} onChange={(v) => set('certifications', v)} />
                            <Toggle label="Applications" checked={opts.applications} onChange={(v) => set('applications', v)} />
                            {opts.applications && <div className="pl-6"><Toggle label="Also closed applications" checked={opts.includeClosedApplications} onChange={(v) => set('includeClosedApplications', v)} /></div>}
                            <Toggle label="Documents" checked={opts.documents} onChange={(v) => set('documents', v)} />
                            <Toggle label="Response format" hint="Asks for importable JSON changes" checked={opts.responseFormat} onChange={(v) => set('responseFormat', v)} />
                            <Toggle label="API instructions" hint="So an agent can act on the data itself" checked={opts.endpoints} onChange={(v) => set('endpoints', v)} />
                        </div>
                    </Card>
                    <Card>
                        <SectionTitle>Shape</SectionTitle>
                        <label className="block text-sm">
                            <span className="text-gray-800">Recent window</span>
                            <select className={`${inputClass} mt-1`} value={opts.sessionDays} onChange={(e) => set('sessionDays', Number(e.target.value))}>
                                {[7, 14, 30, 90].map((d) => <option key={d} value={d}>Last {d} days</option>)}
                            </select>
                        </label>
                        <div className="mt-3">
                            <Toggle label="Compact" hint="Drop server timestamps to save tokens" checked={opts.compact} onChange={(v) => set('compact', v)} />
                        </div>
                    </Card>
                    <Card>
                        <SectionTitle>Instructions</SectionTitle>
                        <textarea className={inputClass} rows={7} value={opts.instructions} onChange={(e) => set('instructions', e.target.value)} />
                        <button type="button" className="mt-2 text-xs text-blue-600 hover:underline" onClick={() => set('instructions', DEFAULT_OPTIONS.instructions)}>
                            Reset to default
                        </button>
                    </Card>
                </aside>

                <section className="min-w-0">
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Preview</span>
                        <span>{text.length.toLocaleString()} characters · ~{approxTokens.toLocaleString()} tokens</span>
                    </div>
                    <textarea
                        readOnly
                        value={text}
                        aria-label="Generated context"
                        className="h-[70vh] w-full resize-y rounded-xl border border-gray-200 bg-white p-4 font-mono text-xs leading-relaxed text-gray-800 shadow-xs focus:outline-none"
                        onFocus={(e) => e.currentTarget.select()}
                    />
                </section>
            </div>

            <Modal open={importOpen} onClose={() => setImportOpen(false)}>
                <h2 className="text-lg font-semibold text-gray-900">Import changes from an assistant</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Paste the JSON change set the assistant returned (a whole ```json block is fine). You'll review each change before anything is applied.
                </p>
                <textarea
                    className={`${inputClass} mt-4 font-mono text-xs`}
                    rows={12}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={'{\n  "summary": "...",\n  "changes": [ ... ]\n}'}
                    autoFocus
                />
                {importError && <p className="mt-2 text-sm text-red-600" role="alert">{importError}</p>}
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setImportOpen(false)}>Cancel</Button>
                    <Button onClick={importChanges} disabled={!importText.trim()}>Review changes</Button>
                </div>
            </Modal>

            <Modal open={review !== null} onClose={() => setReview(null)} wide>
                {review && <ReviewChanges source={review.source} changeSet={review.changeSet} onClose={() => setReview(null)} />}
            </Modal>
        </div>
    )
}
