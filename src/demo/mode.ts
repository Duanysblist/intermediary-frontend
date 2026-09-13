/**
 * Demo mode: the same app served under /demo, backed by an in-browser store of sample data
 * instead of the API. No sign-in, nothing leaves the browser, and a reload resets everything.
 * Decided once at load time from the URL so every module can branch on it synchronously.
 */
export const DEMO_PATH = '/demo'

export const isDemo: boolean =
    typeof window !== 'undefined' &&
    (window.location.pathname === DEMO_PATH || window.location.pathname.startsWith(DEMO_PATH + '/'))
