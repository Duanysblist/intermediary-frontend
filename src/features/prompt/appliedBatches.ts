import type { PlanItemInput } from '../../types'

/**
 * Every applied change set is remembered in the browser so it can be reverted. Updates keep the
 * full pre-change record; creates keep the new id. Kept for a week, ten batches max.
 */
export type AppliedEntry =
    | { op: 'update'; id: number; title: string; before: PlanItemInput }
    | { op: 'create'; id: number; title: string }

export type AppliedBatch = {
    id: string
    source: string
    summary: string
    appliedAt: string
    entries: AppliedEntry[]
    reverted?: boolean
}

const KEY = 'intermediary.appliedBatches'
const MAX_BATCHES = 10
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function loadBatches(): AppliedBatch[] {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) return []
        const list = JSON.parse(raw) as AppliedBatch[]
        const cutoff = Date.now() - MAX_AGE_MS
        return list.filter((b) => new Date(b.appliedAt).getTime() > cutoff)
    } catch {
        return []
    }
}

function save(list: AppliedBatch[]) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_BATCHES))) } catch { /* storage unavailable */ }
}

export function recordBatch(batch: Omit<AppliedBatch, 'id' | 'appliedAt'>): AppliedBatch {
    const full: AppliedBatch = { ...batch, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, appliedAt: new Date().toISOString() }
    save([full, ...loadBatches()])
    return full
}

export function markReverted(id: string) {
    save(loadBatches().map((b) => (b.id === id ? { ...b, reverted: true } : b)))
}
