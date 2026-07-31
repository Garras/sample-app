import type {NextConfig} from "next";

export default {
    // Emits .next/standalone with only the dependencies actually reached, so the runtime
    // image needs no node_modules copy and no install step.
    output: "standalone",

    // better-sqlite3 is a native module - bundling it breaks the .node binding.
    serverExternalPackages: ["better-sqlite3"],
} satisfies NextConfig;
