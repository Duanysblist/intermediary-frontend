import { afterEach, describe, expect, it, vi } from 'vitest'
import { isInWeek, isLink, quarterHourNowLocal, startOfWeek, addDays, toLocalISO } from './format'

describe('isLink', () => {
    it('links only http and https URLs, in any letter case', () => {
        expect(isLink('https://example.com/jobs/1')).toBe(true)
        expect(isLink('HTTP://example.com')).toBe(true)
    })

    it('rejects other schemes, plain text and empty values', () => {
        expect(isLink('javascript:alert(1)')).toBe(false)
        expect(isLink('mailto:someone@example.com')).toBe(false)
        expect(isLink('www.example.com')).toBe(false)
        expect(isLink('')).toBe(false)
        expect(isLink(null)).toBe(false)
        expect(isLink(undefined)).toBe(false)
    })
})

describe('isInWeek', () => {
    const monday = '2026-06-01'

    it('includes Monday through Sunday, zone-less datetimes too', () => {
        expect(isInWeek('2026-06-01', monday)).toBe(true)
        expect(isInWeek('2026-06-07T23:59:00', monday)).toBe(true)
    })

    it('excludes the day before and the Monday after', () => {
        expect(isInWeek('2026-05-31T23:59:00', monday)).toBe(false)
        expect(isInWeek('2026-06-08', monday)).toBe(false)
    })

    it('is false for a missing date', () => {
        expect(isInWeek(null, monday)).toBe(false)
        expect(isInWeek(undefined, monday)).toBe(false)
    })
})

describe('quarterHourNowLocal', () => {
    afterEach(() => vi.useRealTimers())

    it('rounds the current time down to the quarter hour', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 5, 4, 9, 37, 42))
        expect(quarterHourNowLocal()).toBe('2026-06-04T09:30')
    })

    it('keeps an exact quarter hour and rounds anything inside a quarter down', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 5, 4, 18, 45, 0))
        expect(quarterHourNowLocal()).toBe('2026-06-04T18:45')
        vi.setSystemTime(new Date(2026, 5, 4, 18, 14, 59))
        expect(quarterHourNowLocal()).toBe('2026-06-04T18:00')
    })
})

describe('date helpers', () => {
    it('finds the Monday of the week, Sunday going back to the previous Monday', () => {
        expect(startOfWeek('2026-06-04')).toBe('2026-06-01') // Thursday
        expect(startOfWeek('2026-06-07')).toBe('2026-06-01') // Sunday
        expect(startOfWeek('2026-06-01')).toBe('2026-06-01')
    })

    it('adds days across a month boundary', () => {
        expect(addDays('2026-06-29', 3)).toBe('2026-07-02')
    })

    it('drops the zone from server instants and leaves local strings alone', () => {
        expect(toLocalISO('2026-06-04')).toBe('2026-06-04')
        expect(toLocalISO('2026-06-04T09:30:00')).toBe('2026-06-04T09:30:00')
    })
})
