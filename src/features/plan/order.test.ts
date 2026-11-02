import { describe, expect, it } from 'vitest'
import { placeInColumn } from './order'
import { comparePlanItems, type PlanItem } from '../../types'

describe('placeInColumn', () => {
    it('moves a card down or up to the place of the card it is dropped on', () => {
        expect(placeInColumn([1, 2, 3, 4], 1, 3)).toEqual([2, 3, 1, 4])
        expect(placeInColumn([1, 2, 3, 4], 4, 2)).toEqual([1, 4, 2, 3])
    })

    it('puts a card from another column before the card it is dropped on', () => {
        expect(placeInColumn([1, 2, 3], 9, 2)).toEqual([1, 9, 2, 3])
        expect(placeInColumn([1, 2, 3], 9, 1)).toEqual([9, 1, 2, 3])
    })

    it('sends a card dropped on the column itself to the end, and leaves it when dropped on itself', () => {
        expect(placeInColumn([1, 2, 3], 9)).toEqual([1, 2, 3, 9])
        expect(placeInColumn([1, 2, 3], 1)).toEqual([2, 3, 1])
        expect(placeInColumn([1, 2, 3], 2, 2)).toEqual([1, 2, 3])
    })
})

describe('comparePlanItems', () => {
    const item = (id: number, extra: Partial<PlanItem>) => ({ id, status: 'PLANNED', targetDate: null, ...extra }) as PlanItem

    it('orders by status, then position (unplaced last), then date, then id', () => {
        const items = [
            item(1, { status: 'DONE', position: 0 }),
            item(2, { targetDate: '2030-01-02' }),
            item(3, { targetDate: '2030-01-01' }),
            item(4, { position: 1 }),
            item(5, { position: 0, targetDate: '2030-12-31' }),
        ]
        expect([...items].sort(comparePlanItems).map((i) => i.id)).toEqual([5, 4, 3, 2, 1])
    })
})
