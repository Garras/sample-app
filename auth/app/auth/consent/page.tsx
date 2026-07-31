"use client";

import {useState} from "react";
import {AUTH_API} from "../../../lib/paths";

/**
 * The consent screen, required by the oauth-provider plugin - `consentPage` has no default.
 *
 * Better Auth redirects here with the whole authorization request in the query, signed:
 * client_id, scope, redirect_uri, state, the PKCE challenge, and `sig`/`exp`/`ba_param`
 * covering them. Answering means handing that query straight back as `oauth_query`, which
 * is how the server re-validates the request it originally signed.
 *
 * Note there is NO `code` parameter, despite what the plugin's own option docs say - that
 * belonged to the older oidcProvider plugin. Reading a `code` here finds nothing.
 *
 * A client registered with `skipConsent` never reaches this page, which is usually what you
 * want for first-party applications.
 */
export default function Consent() {
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    async function answer(accept: boolean) {
        setMessage("");

        const oauthQuery = window.location.search;

        if (!oauthQuery.includes("client_id")) {
            setMessage(
                "no authorization request in the query - this page was opened directly " +
                    "rather than reached from a login",
            );
            return;
        }

        setBusy(true);

        const response = await fetch(`${AUTH_API}/oauth2/consent`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            // The signed query *is* the request; the server verifies `sig` against it.
            body: JSON.stringify({accept, oauth_query: oauthQuery}),
        });

        // A non-JSON reply means the request never reached Better Auth - see the note in
        // lib/paths.ts about paths resolving against the domain root.
        if (!response.headers.get("content-type")?.includes("json")) {
            setBusy(false);
            setMessage(
                `unexpected non-JSON reply from ${AUTH_API} (HTTP ${response.status})`,
            );
            return;
        }

        const body: {
            url?: string;
            redirect_uri?: string;
            message?: string;
            error_description?: string;
        } = await response.json().catch(() => ({}));

        // `url` is what it actually returns - {redirect: true, url: "..."} - even though
        // the plugin's own OpenAPI metadata documents `redirect_uri`. Both are read so a
        // future version that matches its docs keeps working.
        const target = body.url ?? body.redirect_uri;

        if (!response.ok || !target) {
            setBusy(false);
            setMessage(
                body.error_description ??
                    body.message ??
                    `failed (HTTP ${response.status})`,
            );
            return;
        }

        // Back to the client, carrying the authorization code or an error.
        window.location.href = target;
    }

    const params =
        typeof window === "undefined"
            ? new URLSearchParams()
            : new URLSearchParams(window.location.search);

    return (
        <main>
            <h1>Authorize</h1>
            <p>
                <code>{params.get("client_id") ?? "unknown client"}</code> is asking for{" "}
                <code>{params.get("scope") ?? "no scopes"}</code>.
            </p>

            <div style={{display: "flex", gap: "0.5rem"}}>
                <button onClick={() => void answer(true)} disabled={busy}>
                    Allow
                </button>
                <button onClick={() => void answer(false)} disabled={busy}>
                    Deny
                </button>
            </div>

            {message && <p style={{color: "crimson"}}>{message}</p>}
        </main>
    );
}
