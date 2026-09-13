import { applicationsApi } from './resources'

// Kept for compatibility with the first Applications board; new code uses `applicationsApi` directly.
export const getApplications = applicationsApi.list
export const getApplication = applicationsApi.get
export const createApplication = applicationsApi.create
export const updateApplication = applicationsApi.update
export const deleteApplication = applicationsApi.remove
