# auth — Better Auth OIDC provider

Barebones Next.js app running [Better Auth](https://www.better-auth.com) as an OIDC
identity provider, intended to replace or sit alongside Keycloak/Authentik later.

Its own compose project on purpose: separate lifecycle from `frontend`/`backend`, and the
build scripts in `app/` do not touch it.

## Run

```shell
cp .env.example .env      # then set BETTER_AUTH_SECRET
docker compose up -d --build
```

`custom_network` must exist already (the gateway stack creates it):

```shell
docker network create custom_network
```

Then http://localhost:3100 — sign up on `/login`, and the discovery document is at
`/api/auth/.well-known/openid-configuration`.

## What is here

| File | Purpose |
|---|---|
| `lib/auth.ts` | the Better Auth instance — imported by the route handler *and* by `better-auth migrate` |
| `app/api/auth/[...all]/route.ts` | every endpoint hangs off this one catch-all |
| `app/login/page.tsx` | Better Auth ships no login UI |
| `app/consent/page.tsx` | nor a consent screen; `consentPage` has no default |

SQLite on a bind mount (`./data`). Migrations run on every container start — idempotent,
so an empty volume becomes a working database with nothing to remember.

## Notes

**Use `@better-auth/oauth-provider`, not `oidcProvider` from `better-auth/plugins`.** The
latter is what most guides still show; it logs a deprecation on every boot and goes away in
the next major. The replacement additionally requires the `jwt()` plugin — it fails to
start with `BetterAuthError: jwt_config` without it.

**Endpoint paths differ from the documentation.** This build serves JWKS at
`/api/auth/jwks`, not `/api/auth/.well-known/jwks.json`. Always read the discovery document
rather than trusting a guide.

**No OIDC client is registered yet.** Nothing is protected by this. Registering one means
calling the Better Auth API or seeding the database, and the resulting client secret is
what the gateway's lua would need.

**`BETTER_AUTH_URL` must be the browser-facing address**, because the discovery document is
built from it and those URLs are where the browser gets redirected. Behind the gateway it
becomes the public origin, never `http://auth:3000`.
