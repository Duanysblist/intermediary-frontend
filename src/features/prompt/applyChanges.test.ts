import { describe, expect, it } from 'vitest'
import type { PlanItem, PlanItemInput } from '../../types'
import { applyChanges, failedChanges, revertEntries, type PlanItemApi } from './applyChanges'
import type { Change } from './changeSet'

const item = (over: Partial<PlanItem> = {}): PlanItem => ({
    id: 1, title: 'Read chapter 3', intent: 'STUDY', targetDate: '2026-06-01', status: 'PLANNED',
    referenceEntityType: null, referenceEntityId: null, recurringPlanId: null, notes: null,
    createdAt: '2026-05-01T09:00:00Z', updatedAt: '2026-05-01T09:00:00Z', ...over,
})

const change = (over: Partial<Change> = {}): Change => ({ op: 'update', id: 1, fields: {}, reason: null, ...over })

/** An in-memory stand-in for the plan-item endpoints. `failUpdates` makes PUTs for those ids reject. */
function fakeApi(items: PlanItem[], failUpdates: number[] = []) {
    const store = new Map(items.map((i) => [i.id, { ...i }]))
    const updates: [number, PlanItemInput][] = []
    const removed: number[] = []
    const api: PlanItemApi = {
        get: async (id) => {
            const row = store.get(id)
            if (!row) throw new Error('not found')
            return { ...row }
        },
        create: async (body) => {
            const row = { ...body, id: 50, createdAt: '', updatedAt: '' } as PlanItem
            store.set(row.id, row)
            return { ...row }
        },
        update: async (id, body) => {
            updates.push([id, body])
            if (failUpdates.includes(id)) throw new Error(`PUT ${id} rejected`)
            store.set(id, { ...store.get(id)!, ...body } as PlanItem)
            return { ...store.get(id)! }
        },
        remove: async (id) => {
            removed.push(id)
            store.delete(id)
        },
    }
    return { api, store, updates, removed }
}

const lookupIn = (items: PlanItem[]) => (id: number) => items.find((i) => i.id === id)

describe('applyChanges', () => {
    it('skips a deleted target and counts it as failed, without writing it', async () => {
        const items = [item({ id: 1 })]
        const { api, updates } = fakeApi(items)
        const changes = [change({ id: 99, fields: { status: 'DONE' } }), change({ id: 1, fields: { status: 'DONE' } })]

        const { results, entries } = await applyChanges(api, changes, [0, 1], lookupIn(items))

        expect(results[0]).toEqual({ ok: false, error: 'Plan item #99 no longer exists.' })
        expect(results[1]).toEqual({ ok: true })
        expect(updates.map(([id]) => id)).toEqual([1])
        expect(entries).toHaveLength(1)
    })

    it('keeps going after one change fails', async () => {
        const items = [item({ id: 1 }), item({ id: 2 }), item({ id: 3 })]
        const { api, store } = fakeApi(items, [2])
        const changes = [change({ id: 1, fields: { status: 'DONE' } }), change({ id: 2, fields: { status: 'DONE' } }), change({ id: 3, fields: { status: 'DONE' } })]

        const { results } = await applyChanges(api, changes, [0, 1, 2], lookupIn(items))

        expect(results.map((r) => r?.ok)).toEqual([true, false, true])
        expect(store.get(1)?.status).toBe('DONE')
        expect(store.get(3)?.status).toBe('DONE')
        expect(store.get(2)?.status).toBe('PLANNED')
    })

    it('reports exactly the failed changes, in order, for re-filing', async () => {
        const items = [item({ id: 1 }), item({ id: 2 }), item({ id: 3 })]
        const { api } = fakeApi(items, [1, 3])
        const changes = [
            change({ id: 1, fields: { status: 'DONE' }, reason: 'a' }),
            change({ id: 2, fields: { status: 'DONE' }, reason: 'b' }),
            change({ id: 3, fields: { status: 'DONE' }, reason: 'c' }),
        ]

        const { results } = await applyChanges(api, changes, [0, 1, 2], lookupIn(items))

        expect(failedChanges(changes, results).map((c) => c.reason)).toEqual(['a', 'c'])
    })

    it('creates an item, and reverting the batch deletes it', async () => {
        const { api, store, removed } = fakeApi([])
        const changes = [change({ op: 'create', id: null, fields: { title: 'Mock exam', intent: 'STUDY', targetDate: '2026-06-10' } })]

        const { entries } = await applyChanges(api, changes, [0], lookupIn([]))
        expect(store.get(50)?.title).toBe('Mock exam')

        const failures = await revertEntries(api, entries)
        expect(failures).toEqual([])
        expect(removed).toEqual([50])
        expect(store.has(50)).toBe(false)
    })

    it('writes null for CLEAR (targetDate null) and only the named fields', async () => {
        const items = [item({ id: 1, notes: 'keep me' })]
        const { api, updates } = fakeApi(items)

        await applyChanges(api, [change({ id: 1, fields: { targetDate: null } })], [0], lookupIn(items))

        expect(updates[0][1]).toMatchObject({ targetDate: null, notes: 'keep me', status: 'PLANNED' })
    })
})

describe('revertEntries', () => {
    it('restores only the touched fields and keeps edits made after the change', async () => {
        const items = [item({ id: 1, status: 'PLANNED', targetDate: '2026-06-01', notes: null })]
        const { api, store } = fakeApi(items)
        const { entries } = await applyChanges(api, [change({ id: 1, fields: { status: 'DONE', targetDate: '2026-06-03' } })], [0], lookupIn(items))

        // Someone edits the notes after the batch was applied.
        store.set(1, { ...store.get(1)!, notes: 'typed later' })

        const failures = await revertEntries(api, entries)

        expect(failures).toEqual([])
        expect(store.get(1)).toMatchObject({ status: 'PLANNED', targetDate: '2026-06-01', notes: 'typed later' })
    })

    it('still reverts batches saved as full snapshots', async () => {
        const items = [item({ id: 1 })]
        const { api, store } = fakeApi(items)
        const full = { title: 'Read chapter 3', intent: 'STUDY', targetDate: '2026-06-01', status: 'PLANNED', referenceEntityType: null, referenceEntityId: null, recurringPlanId: null, notes: null } as PlanItemInput
        store.set(1, { ...store.get(1)!, status: 'DONE' })

        const failures = await revertEntries(api, [{ op: 'update', id: 1, title: 'Read chapter 3', before: full }])

        expect(failures).toEqual([])
        expect(store.get(1)?.status).toBe('PLANNED')
    })

    it('collects a failure per entry and carries on', async () => {
        const items = [item({ id: 1 }), item({ id: 2 })]
        const { api, store } = fakeApi(items, [1])
        store.delete(2)

        const failures = await revertEntries(api, [
            { op: 'update', id: 1, title: 'First', before: { status: 'PLANNED' } },
            { op: 'update', id: 2, title: 'Second', before: { status: 'PLANNED' } },
        ])

        expect(failures).toHaveLength(2)
        expect(failures[0]).toMatch(/^Second: /)
        expect(failures[1]).toMatch(/^First: /)
    })
})
