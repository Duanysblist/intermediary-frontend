export function formatSalary(min: number | null, max: number | null): string {
    if (min == null || max == null) return '—'
    const k = (n: number) => `$${Math.round(n / 1000)}K`
    return `${k(min)}–${k(max)}`
}