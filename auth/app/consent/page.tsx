"use client";

import {useState} from "react";

/**
 * The consent screen, required by the oauth-provider plugin - `consentPage` has no
 * default.
 *
 * Better Auth redirects here with `client_id`, `scope` and `code` in the query. Answering
 * means POSTing that `code` back to /oauth2/consent with `accept`, after which Better Auth
 * sends the browser on to the client's redirect_uri.
 *
 * A client registered with `skipConsent` never reaches this page, which is usually what
 * you want for first-party applications.
 */
export default function Consent() {
    const [message, setMessage] = useState("");

    async function answer(accept: boolean) {
        setMessage("");

        const code = new URLSearchParams(window.location.search).get("code");

        if (!code) {
            setMessage("no code in the query - this page was opened directly");
            return;
        }

        const response = await fetch("/api/auth/oauth2/consent", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({code, accept}),
        });

        const body: {redirectURI?: string; message?: string} = await response
            .json()
            .catch(() => ({}));

        if (!response.ok || !body.redirectURI) {
            setMessage(body.message ?? `failed (HTTP ${response.status})`);
            return;
        }

        // Back to the client with the authorization code.
        window.location.href = body.redirectURI;
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
                <button onClick={() => void answer(true)}>Allow</button>
                <button onClick={() => void answer(false)}>Deny</button>
            </div>

            {message && <p style={{color: "crimson"}}>{message}</p>}
        </main>
    );
}
