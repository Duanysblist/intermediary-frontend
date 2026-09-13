import { applications, certifications, documents, fitnessSessions, planItems, studySessions } from '../../hooks/resources'
import { formatDate, formatDateTime, formatMinutes } from '../../lib/format'
import { label, type ReferenceEntityType } from '../../types'

export type ReferenceOption = { id: number; text: string }

/**
 * Everything a plan item or routine can "relate to", described the way a person would recognise it:
 * a certification by name, a session by when it happened, another plan item by title. Ids never
 * appear in the UI; they only travel in the request.
 */
export function useReferenceOptions() {
    const certs = certifications.useList()
    const apps = applications.useList()
    const docs = documents.useList()
    const study = studySessions.useList()
    const fitness = fitnessSessions.useList()
    const items = planItems.useList()
    const certName = new Map((certs.data ?? []).map((c) => [c.id, c.name]))

    function optionsFor(type: ReferenceEntityType, excludeId?: number): ReferenceOption[] {
        switch (type) {
            case 'CERTIFICATION':
                return (certs.data ?? []).map((c) => ({ id: c.id, text: c.name }))
            case 'APPLICATION':
                return (apps.data ?? []).map((a) => ({ id: a.id, text: `${a.company} · ${a.role}` }))
            case 'DOCUMENT':
                return (docs.data ?? []).map((d) => ({ id: d.id, text: d.title }))
            case 'STUDY_SESSION':
                return [...(study.data ?? [])]
                    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
                    .map((s) => ({
                        id: s.id,
                        text: `${formatDateTime(s.sessionDate)} · ${formatMinutes(s.durationMinutes)}${s.certificationId != null ? ` · ${certName.get(s.certificationId) ?? 'certification'}` : ''}${s.notes ? ` · ${s.notes}` : ''}`,
                    }))
            case 'FITNESS_SESSION':
                return [...(fitness.data ?? [])]
                    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
                    .map((s) => ({ id: s.id, text: `${formatDateTime(s.sessionDate)} · ${formatMinutes(s.durationMinutes)} · ${label(s.workoutType)}` }))
            case 'PLAN_ITEM':
                return (items.data ?? [])
                    .filter((p) => p.id !== excludeId)
                    .map((p) => ({ id: p.id, text: `${p.title}${p.targetDate ? ` · ${formatDate(p.targetDate)}` : ''}` }))
        }
    }

    /** Readable name for an existing reference, or null when there is none. */
    function labelFor(type: ReferenceEntityType | null, id: number | null): string | null {
        if (!type || id == null) return null
        const found = optionsFor(type).find((o) => o.id === id)
        if (found) return found.text
        // The referenced record was deleted; say so rather than showing a number.
        return `${label(type)} (no longer exists)`
    }

    return { optionsFor, labelFor }
}
