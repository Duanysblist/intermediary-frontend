export function formatSalary(min: number | null, max: number | null): string {
    if (min == null && max == null) return '—'
    const k = (n: number) => `$${Math.round(n / 1000)}K`
    if (min == null) return `up to ${k(max!)}`
    if (max == null) return `from ${k(min)}`
    return `${k(min)}–${k(max)}`
}

/** "2026-06-04" -> "Jun 4, 2026". Accepts LocalDateTime strings too (uses the date part). */
export function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    const d = parseLocal(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "2026-06-04T09:30:00" -> "Jun 4, 2026, 9:30 AM" */
export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '—'
    const d = parseLocal(iso)
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Short weekday + day, e.g. "Mon 8" */
export function formatDayShort(iso: string): string {
    const d = parseLocal(iso)
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
}

export function formatMinutes(total: number): string {
    if (total < 60) return `${total} min`
    const h = Math.floor(total / 60)
    const m = total % 60
    return m === 0 ? `${h} h` : `${h} h ${m} min`
}

/** Relative wording for a date: "today", "tomorrow", "in 3 days", "2 days ago". */
export function relativeDay(iso: string | null | undefined): string {
    if (!iso) return 'unscheduled'
    const diff = daysBetween(todayISO(), iso.slice(0, 10))
    if (diff === 0) return 'today'
    if (diff === 1) return 'tomorrow'
    if (diff === -1) return 'yesterday'
    return diff > 0 ? `in ${diff} days` : `${-diff} days ago`
}

/**
 * Parse an ISO local date or datetime string as local time. `new Date("2026-06-04")` would be UTC
 * midnight, which shifts the day in western time zones; this avoids that.
 */
export function parseLocal(iso: string): Date {
    const [datePart, timePart] = iso.split('T')
    const [y, m, d] = datePart.split('-').map(Number)
    if (!timePart) return new Date(y, m - 1, d)
    const [hh = 0, mm = 0, ss = 0] = timePart.split(':').map((x) => Number(x.slice(0, 2)))
    return new Date(y, m - 1, d, hh, mm, ss)
}

export function toISODate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Value for <input type="datetime-local">, minute precision, local time. */
export function toDateTimeLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${toISODate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function todayISO(): string {
    return toISODate(new Date())
}

export function addDays(iso: string, days: number): string {
    const d = parseLocal(iso)
    d.setDate(d.getDate() + days)
    return toISODate(d)
}

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: string, b: string): number {
    const ms = parseLocal(b).getTime() - parseLocal(a).getTime()
    return Math.round(ms / 86_400_000)
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: string): string {
    const d = parseLocal(iso)
    const day = d.getDay() // 0 = Sunday
    const delta = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + delta)
    return toISODate(d)
}

export function weekDays(mondayISO: string): string[] {
    return Array.from({ length: 7 }, (_, i) => addDays(mondayISO, i))
}

export function isBefore(a: string, b: string): boolean {
    return a.slice(0, 10) < b.slice(0, 10)
}
