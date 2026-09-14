// Mirrors the backend DTO contract (see intermediary/src/main/java/.../dto).
// Dates are ISO strings: LocalDate -> "2026-06-04"; user-entered times (sessionDate) are zone-less local
// wall-clock values "2026-06-04T09:30:00"; server-set timestamps (createdAt, updatedAt, eventTime) are
// UTC instants "2026-06-04T13:30:00Z" that the UI converts to the browser zone.

// ---------- Applications ----------
export type ApplicationStatus =
    | 'APPLIED' | 'SCREENING' | 'INTERVIEWING' | 'OFFER' | 'REJECTED' | 'WITHDRAWN' | 'GHOSTED'

export type ApplicationSource = 'COLD' | 'REFERRAL' | 'RECRUITER' | 'EVENT' | 'INTERNAL'

export type ResumeVariant = 'VARIANT_A_DEFENSE' | 'VARIANT_B_COMMERCIAL' | 'VARIANT_C_CACI_SPECIFIC'

export interface Application {
    id: number
    company: string
    role: string
    applicationDate: string
    status: ApplicationStatus
    source: ApplicationSource
    resumeVariant: ResumeVariant
    location: string | null
    requisitionId: string | null
    jobUrl: string | null
    salaryRangeMin: number | null
    salaryRangeMax: number | null
    notes: string | null
    createdAt: string
    updatedAt: string
}
export type ApplicationInput = Omit<Application, 'id' | 'createdAt' | 'updatedAt'>

// ---------- Certifications ----------
export type CertificationStatus = 'PLANNING' | 'STUDYING' | 'SCHEDULED' | 'PASSED' | 'FAILED'

export interface Certification {
    id: number
    name: string
    vendor: string
    status: CertificationStatus
    examDate: string | null
    hoursStudied: number | null
    notes: string | null
    createdAt: string
    updatedAt: string
}
export type CertificationInput = Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>

// ---------- Documents ----------
export type DocumentType = 'RESUME' | 'PLAN' | 'GUIDE' | 'SPEC' | 'OTHER'

export interface Document {
    id: number
    title: string
    path: string
    type: DocumentType
    version: string | null
    notes: string | null
    createdAt: string
    updatedAt: string
}
export type DocumentInput = Omit<Document, 'id' | 'createdAt' | 'updatedAt'>

// ---------- Sessions (reality) ----------
export interface StudySession {
    id: number
    sessionDate: string
    durationMinutes: number
    certificationId: number | null
    /** The intention this session fulfilled, if it was logged from a plan item. */
    planItemId: number | null
    notes: string | null
    createdAt: string
    updatedAt: string
}
export type StudySessionInput = Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>

export type WorkoutType = 'WORKOUT_A' | 'WORKOUT_B' | 'WALK' | 'OTHER'

export interface FitnessSession {
    id: number
    sessionDate: string
    durationMinutes: number
    workoutType: WorkoutType
    planItemId: number | null
    notes: string | null
    createdAt: string
    updatedAt: string
}
export type FitnessSessionInput = Omit<FitnessSession, 'id' | 'createdAt' | 'updatedAt'>

// ---------- Plan items (intention) ----------
export type PlanIntent = 'STUDY' | 'EXERCISE' | 'APPLY' | 'READ' | 'WRITE' | 'OTHER'

export type PlanItemStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED' | 'DEFERRED'

export type ReferenceEntityType =
    | 'CERTIFICATION' | 'APPLICATION' | 'DOCUMENT' | 'STUDY_SESSION' | 'FITNESS_SESSION' | 'PLAN_ITEM'

export interface PlanItem {
    id: number
    title: string
    intent: PlanIntent
    targetDate: string | null
    status: PlanItemStatus
    referenceEntityType: ReferenceEntityType | null
    referenceEntityId: number | null
    /** Set when the item was generated from a recurring plan. */
    recurringPlanId: number | null
    notes: string | null
    createdAt: string
    updatedAt: string
}
export type PlanItemInput = Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'>

// ---------- Recurring plans (routines that generate plan items) ----------
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
export const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export interface RecurringPlan {
    id: number
    title: string
    intent: PlanIntent
    days: DayOfWeek[]
    referenceEntityType: ReferenceEntityType | null
    referenceEntityId: number | null
    notes: string | null
    active: boolean
    createdAt: string
    updatedAt: string
}
export type RecurringPlanInput = Omit<RecurringPlan, 'id' | 'createdAt' | 'updatedAt'>

// ---------- Plan events (history, append-only) ----------
export interface PlanEvent {
    id: number
    planItemId: number
    fromStatus: PlanItemStatus | null
    toStatus: PlanItemStatus
    eventTime: string
    notes: string | null
    createdAt: string
}

// ---------- Proposals (change sets waiting for review, e.g. from the MCP server) ----------
export type ProposalStatus = 'PENDING' | 'APPLIED' | 'DISMISSED'

export interface Proposal {
    id: number
    source: string
    summary: string
    changes: import('../features/prompt/changeSet').Change[]
    status: ProposalStatus
    createdAt: string
    updatedAt: string
}

// ---------- Enum option lists (single source for selects, pills, and labels) ----------
export const APPLICATION_STATUSES: ApplicationStatus[] =
    ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN', 'GHOSTED']
export const APPLICATION_SOURCES: ApplicationSource[] = ['COLD', 'REFERRAL', 'RECRUITER', 'EVENT', 'INTERNAL']
export const RESUME_VARIANTS: ResumeVariant[] = ['VARIANT_A_DEFENSE', 'VARIANT_B_COMMERCIAL', 'VARIANT_C_CACI_SPECIFIC']
export const CERTIFICATION_STATUSES: CertificationStatus[] = ['PLANNING', 'STUDYING', 'SCHEDULED', 'PASSED', 'FAILED']
export const DOCUMENT_TYPES: DocumentType[] = ['RESUME', 'PLAN', 'GUIDE', 'SPEC', 'OTHER']
export const WORKOUT_TYPES: WorkoutType[] = ['WORKOUT_A', 'WORKOUT_B', 'WALK', 'OTHER']
export const PLAN_INTENTS: PlanIntent[] = ['STUDY', 'EXERCISE', 'APPLY', 'READ', 'WRITE', 'OTHER']
export const PLAN_STATUSES: PlanItemStatus[] = ['PLANNED', 'IN_PROGRESS', 'DONE', 'DEFERRED', 'CANCELED']
/** What a new plan item or routine can point at. Sessions link back to intentions themselves, so they are not offered here. */
export const REFERENCE_PICKER_TYPES: ReferenceEntityType[] = ['CERTIFICATION', 'APPLICATION', 'DOCUMENT', 'PLAN_ITEM']

/** Human label for any enum value: IN_PROGRESS -> "In progress", with a few explicit overrides. */
const LABEL_OVERRIDES: Record<string, string> = {
    VARIANT_A_DEFENSE: 'Variant A · Defense',
    VARIANT_B_COMMERCIAL: 'Variant B · Commercial',
    VARIANT_C_CACI_SPECIFIC: 'Variant C · CACI',
    WORKOUT_A: 'Workout A',
    WORKOUT_B: 'Workout B',
}
export function label(value: string | null | undefined): string {
    if (!value) return '—'
    if (LABEL_OVERRIDES[value]) return LABEL_OVERRIDES[value]
    const lower = value.toLowerCase().replaceAll('_', ' ')
    return lower.charAt(0).toUpperCase() + lower.slice(1)
}
