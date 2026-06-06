export type ApplicationStatus =
    | "APPLIED"
    | "SCREENING"
    | "INTERVIEWING"
    | "OFFER"
    | "REJECTED"
    | "WITHDRAWN"
    | "GHOSTED";

export type ApplicationSource =
    | "COLD" | "REFERRAL" | "RECRUITER" | "EVENT" | "INTERNAL";

export type ResumeVariant =
    | "VARIANT_A_DEFENSE" | "VARIANT_B_COMMERCIAL" | "VARIANT_C_CACI_SPECIFIC";

export interface Application {
    id: number;
    company: string;
    role: string;
    applicationDate: string;        // ISO date, e.g. "2026-06-04"
    status: ApplicationStatus;
    source: ApplicationSource;
    resumeVariant: ResumeVariant;
    location: string | null;
    requisitionId: string | null;
    jobUrl: string | null;
    salaryRangeMin: number | null;
    salaryRangeMax: number | null;
    notes: string | null;
    createdAt: string;              // ISO datetime, server-set
    updatedAt: string;              // ISO datetime, server-set
}

// What to send on create/update — the server owns id + timestamps
export type ApplicationInput = Omit<Application, "id" | "createdAt" | "updatedAt">;