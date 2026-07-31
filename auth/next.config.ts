import type {NextConfig} from "next";

export default {
    // Deliberately NO basePath, even though the app is served under /auth.
    //
    // Next strips basePath from the request before a route handler sees it, and Better
    // Auth then re-adds the path from BETTER_AUTH_URL when matching - so the two cancel
    // out and every endpoint 404s while the pages still render. Nesting the routes under
    // app/auth/ instead means the prefix survives end to end.
    //
    // The cost: assets stay at /_next/*, so the gateway needs a location for them. The
    // generated configuration adds one.
    output: "standalone",

    // better-sqlite3 is a native module - bundling it breaks the .node binding.
    serverExternalPackages: ["better-sqlite3"],
} satisfies NextConfig;
