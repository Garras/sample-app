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

Then http://localhost:3100/auth/login to sign up, with the discovery document at
`/auth/api/auth/.well-known/openid-configuration`.

## What is here

| File | Purpose |
|---|---|
| `lib/auth.ts` | the Better Auth instance — imported by the route handler *and* by `better-auth migrate` |
| `app/auth/api/auth/[...all]/route.ts` | every endpoint hangs off this one catch-all |
| `app/auth/login/page.tsx` | Better Auth ships no login UI |
| `app/auth/consent/page.tsx` | nor a consent screen; `consentPage` has no default |
| `lib/paths.ts` | the `/auth` prefix, as the browser sees it |

SQLite on a bind mount (`./data`). Migrations run on every container start — idempotent,
so an empty volume becomes a working database with nothing to remember.

## Everything is served under `/auth`

This app is an example wired for one specific mount point, and **four things carry that
`/auth` prefix independently**:

| | |
|---|---|
| the folder nesting | `app/auth/...` — what makes Next serve the routes there |
| `assetPrefix` in `next.config.ts` | where the HTML asks for `/_next/*` |
| `lib/paths.ts` | `AUTH_API`, used by the pages' own fetch calls |
| `BETTER_AUTH_BASE_PATH` | `/auth/api/auth` — what Better Auth matches requests on |
| `loginPage` / `consentPage` in `lib/auth.ts` | `/auth/login`, `/auth/consent` |

Moving to a different prefix means changing all four. That is deliberate rather than
elegant: **Next's `basePath` cannot be used here.** Next strips it from the request before a
route handler sees it, and Better Auth then re-adds the path from `BETTER_AUTH_URL` when
matching, so the two cancel out — every endpoint 404s while the pages still render.

Two consequences worth knowing:

- `BETTER_AUTH_URL` must be the **origin only**, with no path. The prefix belongs in
  `BETTER_AUTH_BASE_PATH`. Better Auth routes on the second and builds its published URLs
  from the first.
- Assets are handled by **`assetPrefix: "/auth"`**, which is the half of `basePath` that is
  safe to use: it changes only where the HTML asks for `/_next/*`, leaving routing alone.
  The standalone server serves them under the prefix as well, so the gateway needs no extra
  location. Without it every chunk is requested at the domain root, comes back as the
  frontend's HTML, and the browser reports
  `Uncaught SyntaxError: Unexpected token '<'`.

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
