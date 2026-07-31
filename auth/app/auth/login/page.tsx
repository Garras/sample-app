"use client";

import {useState} from "react";
import {AUTH_API} from "../../../lib/paths";

type Action = "in" | "up";

/**
 * The login page Better Auth redirects to.
 *
 * Better Auth ships no UI, so this is it. It posts straight to the sign-in and sign-up
 * endpoints rather than pulling in the client library - fewer moving parts, and it keeps
 * the actual HTTP calls visible.
 *
 * When an OIDC client sends a user here, Better Auth stores the authorization request
 * first and appends its id as ?client_id. After a successful sign-in the browser goes back
 * to the authorize endpoint to carry on where it left off.
 */
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function submit(action: Action) {
        setMessage("");

        const response = await fetch(`${AUTH_API}/sign-${action}/email`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            // `name` is required on sign-up and ignored on sign-in.
            body: JSON.stringify({email, password, name: email}),
        });

        // A non-JSON answer means the request never reached Better Auth - most likely the
        // path resolved to something else on this domain. Worth naming, because fetch
        // follows redirects: a login page returned as 200 otherwise looks like success and
        // the flow silently bounces back here.
        if (!response.headers.get("content-type")?.includes("json")) {
            setMessage(
                `unexpected non-JSON reply from ${AUTH_API} (HTTP ${response.status}) - ` +
                    "check that path is really Better Auth",
            );
            return;
        }

        if (!response.ok) {
            const body: {message?: string} = await response.json().catch(() => ({}));
            setMessage(body.message ?? `failed (HTTP ${response.status})`);
            return;
        }

        // Resume the OIDC flow if one was in progress, otherwise land somewhere that
        // proves the session exists.
        const params = new URLSearchParams(window.location.search);
        window.location.href = params.has("client_id")
            ? `${AUTH_API}/oauth2/authorize?${params.toString()}`
            : "/";
    }

    return (
        <main>
            <h1>Sign in</h1>

            <div style={{display: "grid", gap: "0.5rem", maxWidth: "20rem"}}>
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <div style={{display: "flex", gap: "0.5rem"}}>
                    <button onClick={() => void submit("in")}>Sign in</button>
                    <button onClick={() => void submit("up")}>Sign up</button>
                </div>
            </div>

            {message && <p style={{color: "crimson"}}>{message}</p>}
        </main>
    );
}
