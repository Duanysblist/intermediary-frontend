import { addDays, todayISO } from '../lib/format'
import type { Application, Certification, Document, FitnessSession, PlanEvent, PlanItem, StudySession } from '../types'

/** Sample dataset for the public demo, generated relative to today so it always looks current. */
export function buildDemoData() {
    const T = todayISO()
    const d = (n: number) => addDays(T, n)
    const dt = (n: number, hm: string) => `${addDays(T, n)}T${hm}:00`
    const stamp = (n: number) => `${addDays(T, n)}T09:00:00`

    const certifications: Certification[] = [
        { id: 1, name: 'AWS Solutions Architect – Associate', vendor: 'Amazon', status: 'SCHEDULED', examDate: d(12), hoursStudied: 38, notes: 'Weak areas: networking, cost optimisation.', createdAt: stamp(-40), updatedAt: stamp(-2) },
        { id: 2, name: 'CompTIA Security+', vendor: 'CompTIA', status: 'STUDYING', examDate: d(45), hoursStudied: 9, notes: null, createdAt: stamp(-20), updatedAt: stamp(-5) },
        { id: 3, name: 'Kubernetes CKA', vendor: 'CNCF', status: 'PLANNING', examDate: null, hoursStudied: 0, notes: 'After the AWS exam.', createdAt: stamp(-10), updatedAt: stamp(-10) },
    ]

    const applications: Application[] = [
        { id: 1, company: 'Northwind Defense', role: 'Backend Engineer (Java)', applicationDate: d(-9), status: 'INTERVIEWING', source: 'REFERRAL', resumeVariant: 'VARIANT_A_DEFENSE', location: 'Arlington, VA (hybrid)', requisitionId: 'NWD-4471', jobUrl: 'https://example.com/jobs/nwd-4471', salaryRangeMin: 125000, salaryRangeMax: 150000, notes: 'System design round next.', createdAt: stamp(-9), updatedAt: stamp(-1) },
        { id: 2, company: 'Globex', role: 'Platform Engineer', applicationDate: d(-4), status: 'SCREENING', source: 'RECRUITER', resumeVariant: 'VARIANT_B_COMMERCIAL', location: 'Remote', requisitionId: null, jobUrl: 'https://example.com/jobs/globex-platform', salaryRangeMin: 140000, salaryRangeMax: 170000, notes: null, createdAt: stamp(-4), updatedAt: stamp(-2) },
        { id: 3, company: 'Initech', role: 'Software Engineer II', applicationDate: d(-16), status: 'APPLIED', source: 'COLD', resumeVariant: 'VARIANT_B_COMMERCIAL', location: 'Austin, TX', requisitionId: 'REQ-2201', jobUrl: null, salaryRangeMin: null, salaryRangeMax: null, notes: null, createdAt: stamp(-16), updatedAt: stamp(-16) },
        { id: 4, company: 'Acme Cloud', role: 'Site Reliability Engineer', applicationDate: d(-30), status: 'REJECTED', source: 'EVENT', resumeVariant: 'VARIANT_B_COMMERCIAL', location: 'Remote', requisitionId: null, jobUrl: null, salaryRangeMin: 130000, salaryRangeMax: 155000, notes: 'Wanted more on-call experience.', createdAt: stamp(-30), updatedAt: stamp(-12) },
        { id: 5, company: 'CACI', role: 'Java Developer', applicationDate: d(-2), status: 'APPLIED', source: 'INTERNAL', resumeVariant: 'VARIANT_C_CACI_SPECIFIC', location: 'Chantilly, VA', requisitionId: 'CACI-88102', jobUrl: 'https://example.com/jobs/caci-88102', salaryRangeMin: 115000, salaryRangeMax: 135000, notes: null, createdAt: stamp(-2), updatedAt: stamp(-2) },
    ]

    const documents: Document[] = [
        { id: 1, title: 'Resume – defense variant', path: 'https://docs.example.com/resume-defense', type: 'RESUME', version: 'v4', notes: 'Clearance and DoD projects up top.', createdAt: stamp(-60), updatedAt: stamp(-9) },
        { id: 2, title: 'Resume – commercial variant', path: 'https://docs.example.com/resume-commercial', type: 'RESUME', version: 'v3', notes: null, createdAt: stamp(-60), updatedAt: stamp(-4) },
        { id: 3, title: 'AWS SAA study plan', path: 'https://docs.example.com/aws-saa-plan', type: 'PLAN', version: '2026-Q3', notes: 'Domain-by-domain checklist.', createdAt: stamp(-40), updatedAt: stamp(-7) },
        { id: 4, title: 'System design interview guide', path: 'https://docs.example.com/system-design', type: 'GUIDE', version: null, notes: null, createdAt: stamp(-15), updatedAt: stamp(-15) },
    ]

    const planItems: PlanItem[] = [
        { id: 1, title: 'AWS practice exam #3', intent: 'STUDY', targetDate: d(-2), status: 'IN_PROGRESS', referenceEntityType: 'CERTIFICATION', referenceEntityId: 1, notes: 'Aim for 80%+.', createdAt: stamp(-8), updatedAt: stamp(-2) },
        { id: 2, title: 'Review VPC peering and Transit Gateway', intent: 'STUDY', targetDate: d(1), status: 'PLANNED', referenceEntityType: 'CERTIFICATION', referenceEntityId: 1, notes: null, createdAt: stamp(-6), updatedAt: stamp(-6) },
        { id: 3, title: 'Prep system design round for Northwind', intent: 'APPLY', targetDate: d(2), status: 'PLANNED', referenceEntityType: 'APPLICATION', referenceEntityId: 1, notes: 'Use the guide; practice a URL shortener and a rate limiter.', createdAt: stamp(-3), updatedAt: stamp(-3) },
        { id: 4, title: 'Reply to Globex recruiter with availability', intent: 'APPLY', targetDate: d(-1), status: 'PLANNED', referenceEntityType: 'APPLICATION', referenceEntityId: 2, notes: null, createdAt: stamp(-2), updatedAt: stamp(-2) },
        { id: 5, title: 'Workout B', intent: 'EXERCISE', targetDate: d(0), status: 'PLANNED', referenceEntityType: null, referenceEntityId: null, notes: null, createdAt: stamp(-1), updatedAt: stamp(-1) },
        { id: 6, title: 'Long walk', intent: 'EXERCISE', targetDate: d(3), status: 'PLANNED', referenceEntityType: null, referenceEntityId: null, notes: null, createdAt: stamp(-1), updatedAt: stamp(-1) },
        { id: 7, title: 'Update defense resume with current project', intent: 'WRITE', targetDate: d(-5), status: 'DONE', referenceEntityType: 'DOCUMENT', referenceEntityId: 1, notes: null, createdAt: stamp(-12), updatedAt: stamp(-5) },
        { id: 8, title: 'Read "Designing Data-Intensive Applications" ch. 5', intent: 'READ', targetDate: null, status: 'PLANNED', referenceEntityType: null, referenceEntityId: null, notes: 'Replication.', createdAt: stamp(-14), updatedAt: stamp(-14) },
        { id: 9, title: 'Security+ domain 1 flashcards', intent: 'STUDY', targetDate: d(5), status: 'PLANNED', referenceEntityType: 'CERTIFICATION', referenceEntityId: 2, notes: null, createdAt: stamp(-4), updatedAt: stamp(-4) },
        { id: 10, title: 'Apply to Initech referral', intent: 'APPLY', targetDate: d(-20), status: 'DONE', referenceEntityType: 'APPLICATION', referenceEntityId: 3, notes: null, createdAt: stamp(-22), updatedAt: stamp(-16) },
        { id: 11, title: 'CKA labs: pods and deployments', intent: 'STUDY', targetDate: d(-9), status: 'DEFERRED', referenceEntityType: 'CERTIFICATION', referenceEntityId: 3, notes: 'After AWS.', createdAt: stamp(-15), updatedAt: stamp(-9) },
        { id: 12, title: 'Write cover letter for CACI', intent: 'WRITE', targetDate: d(-3), status: 'DONE', referenceEntityType: 'APPLICATION', referenceEntityId: 5, notes: null, createdAt: stamp(-4), updatedAt: stamp(-2) },
    ]

    const planEvents: PlanEvent[] = [
        { id: 1, planItemId: 7, fromStatus: 'PLANNED', toStatus: 'IN_PROGRESS', eventTime: dt(-7, '18:10'), notes: null, createdAt: dt(-7, '18:10') },
        { id: 2, planItemId: 7, fromStatus: 'IN_PROGRESS', toStatus: 'DONE', eventTime: dt(-5, '20:30'), notes: null, createdAt: dt(-5, '20:30') },
        { id: 3, planItemId: 10, fromStatus: 'PLANNED', toStatus: 'DONE', eventTime: dt(-16, '12:00'), notes: null, createdAt: dt(-16, '12:00') },
        { id: 4, planItemId: 11, fromStatus: 'PLANNED', toStatus: 'DEFERRED', eventTime: dt(-9, '09:15'), notes: null, createdAt: dt(-9, '09:15') },
        { id: 5, planItemId: 1, fromStatus: 'PLANNED', toStatus: 'IN_PROGRESS', eventTime: dt(-2, '19:00'), notes: null, createdAt: dt(-2, '19:00') },
        { id: 6, planItemId: 12, fromStatus: 'PLANNED', toStatus: 'DONE', eventTime: dt(-2, '21:40'), notes: null, createdAt: dt(-2, '21:40') },
    ]

    const studySessions: StudySession[] = [
        { id: 1, sessionDate: dt(-6, '19:00'), durationMinutes: 75, certificationId: 1, notes: 'IAM, Organizations, SCPs', createdAt: dt(-6, '20:15'), updatedAt: dt(-6, '20:15') },
        { id: 2, sessionDate: dt(-5, '07:00'), durationMinutes: 45, certificationId: 1, notes: 'S3 storage classes', createdAt: dt(-5, '07:45'), updatedAt: dt(-5, '07:45') },
        { id: 3, sessionDate: dt(-3, '19:30'), durationMinutes: 90, certificationId: 1, notes: 'Practice exam #2: 74%', createdAt: dt(-3, '21:00'), updatedAt: dt(-3, '21:00') },
        { id: 4, sessionDate: dt(-2, '19:00'), durationMinutes: 60, certificationId: 1, notes: 'Started practice exam #3', createdAt: dt(-2, '20:00'), updatedAt: dt(-2, '20:00') },
        { id: 5, sessionDate: dt(-1, '08:00'), durationMinutes: 30, certificationId: 2, notes: 'Threat types', createdAt: dt(-1, '08:30'), updatedAt: dt(-1, '08:30') },
        { id: 6, sessionDate: dt(-13, '19:00'), durationMinutes: 60, certificationId: 1, notes: null, createdAt: dt(-13, '20:00'), updatedAt: dt(-13, '20:00') },
        { id: 7, sessionDate: dt(-11, '19:00'), durationMinutes: 50, certificationId: 1, notes: null, createdAt: dt(-11, '19:50'), updatedAt: dt(-11, '19:50') },
    ]

    const fitnessSessions: FitnessSession[] = [
        { id: 1, sessionDate: dt(-6, '06:30'), durationMinutes: 45, workoutType: 'WORKOUT_A', notes: null, createdAt: dt(-6, '07:15'), updatedAt: dt(-6, '07:15') },
        { id: 2, sessionDate: dt(-4, '06:30'), durationMinutes: 40, workoutType: 'WORKOUT_B', notes: 'Felt strong.', createdAt: dt(-4, '07:10'), updatedAt: dt(-4, '07:10') },
        { id: 3, sessionDate: dt(-2, '17:00'), durationMinutes: 35, workoutType: 'WALK', notes: null, createdAt: dt(-2, '17:35'), updatedAt: dt(-2, '17:35') },
        { id: 4, sessionDate: dt(-12, '06:30'), durationMinutes: 45, workoutType: 'WORKOUT_A', notes: null, createdAt: dt(-12, '07:15'), updatedAt: dt(-12, '07:15') },
        { id: 5, sessionDate: dt(-9, '06:30'), durationMinutes: 40, workoutType: 'WORKOUT_B', notes: null, createdAt: dt(-9, '07:10'), updatedAt: dt(-9, '07:10') },
    ]

    return { certifications, applications, documents, planItems, planEvents, studySessions, fitnessSessions }
}
