/**
 * Where Better Auth's endpoints live, as the browser sees them.
 *
 * The prefix is NOT optional. These pages are served under /auth, and a root-relative
 * "/api/auth/..." would resolve against the domain root - which behind the gateway is
 * whatever else is mounted at /api, typically the application's own backend. The symptom
 * is buttons that appear to do nothing while the network tab shows a 404 or, worse, a 200
 * from the wrong service.
 *
 * Kept beside the folder nesting it mirrors: app/auth/api/auth/[...all].
 */
export const AUTH_API = "/auth/api/auth";
