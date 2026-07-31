import {betterAuth} from "better-auth";
import {oauthProvider} from "@better-auth/oauth-provider";
import {jwt} from "better-auth/plugins";
import Database from "better-sqlite3";

/**
 * Better Auth configured as an OIDC provider.
 *
 * Kept in its own module because two things import it: the route handler that serves the
 * endpoints, and `better-auth migrate`, which reads this to work out what tables to
 * create without ever starting the server.
 *
 * SQLite on a volume rather than postgres - this is a demonstration provider, and a file
 * keeps it to one container with nothing to provision. Point `database` at postgres when
 * it becomes more than that.
 */
export const auth = betterAuth({
    /**
     * The address the browser AND the gateway both use.
     *
     * Better Auth builds its discovery document from this, and the URLs in that document
     * are what lua-resty-openidc will redirect the browser to - so it has to be the
     * external URL, never http://auth:3000.
     */
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

    secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-change-me",

    database: new Database(process.env.DATABASE_PATH ?? "./data/auth.db"),

    // The only way in, for now. Social providers would be a change here, not at the
    // gateway.
    emailAndPassword: {enabled: true},

    plugins: [
        // Required by oauthProvider, which fails to start without it: it signs the access
        // and id tokens, and serves the JWKS the gateway fetches to verify them.
        jwt(),

        // `oauthProvider`, not the `oidcProvider` from better-auth/plugins that most
        // guides still show: that one logs a deprecation on every boot and goes away in
        // the next major.
        oauthProvider({
            // Better Auth ships no UI at all - these point at the two pages in app/.
            // Neither has a default; the plugin refuses to type-check without them.
            loginPage: "/login",
            consentPage: "/consent",
        }),
    ],

    // The domains the gateway will serve, once something is actually protected by this.
    trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
});
