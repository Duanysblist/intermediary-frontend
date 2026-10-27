import { describe, expect, it } from 'vitest'
import { isOpenPlanItem, toInput, type PlanItem } from './index'

const item: PlanItem = {
    id: 4, title: 'Lift', intent: 'EXERCISE', targetDate: '2026-06-02', status: 'IN_PROGRESS',
    referenceEntityType: null, referenceEntityId: null, recurringPlanId: 9, notes: 'light',
    createdAt: '2026-05-01T09:00:00Z', updatedAt: '2026-05-02T09:00:00Z',
}

describe('isOpenPlanItem', () => {
    it('is true only for planned and in-progress items', () => {
        expect(isOpenPlanItem({ status: 'PLANNED' })).toBe(true)
        expect(isOpenPlanItem({ status: 'IN_PROGRESS' })).toBe(true)
        expect(isOpenPlanItem({ status: 'DONE' })).toBe(false)
        expect(isOpenPlanItem({ status: 'DEFERRED' })).toBe(false)
        expect(isOpenPlanItem({ status: 'CANCELED' })).toBe(false)
    })
})

describe('toInput', () => {
    it('keeps the writable fields and drops the server-set ones', () => {
        const input = toInput(item)
        expect(input).toEqual({
            title: 'Lift', intent: 'EXERCISE', targetDate: '2026-06-02', status: 'IN_PROGRESS',
            referenceEntityType: null, referenceEntityId: null, recurringPlanId: 9, notes: 'light',
        })
        expect(input).not.toHaveProperty('id')
        expect(input).not.toHaveProperty('createdAt')
    })
})
