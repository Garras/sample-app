# Build and run are separate so the final image carries no toolchain and no dev
# dependencies. `output: "standalone"` in next.config.ts is what makes that possible: it
# emits a server plus only the node_modules actually reached.
FROM node:22-slim AS build

WORKDIR /app

# Dependencies first, so a source-only change does not reinstall them.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Next collects page data by importing the route handler, which constructs the Better Auth
# instance, which opens the SQLite file - so the directory has to exist even though the
# database built here is thrown away with this stage. `data/` is dockerignored precisely
# so a development database never ships.
RUN mkdir -p data && npm run build

FROM node:22-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

# better-sqlite3 is native and lives outside the standalone bundle
# (serverExternalPackages), so it is copied across with the CLI needed to migrate.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/lib ./lib
# For `npm run trust-clients` - see scripts/trust-clients.mjs.
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./package.json

# The database file lives here; compose mounts a volume over it.
RUN mkdir -p /app/data

EXPOSE 3000

# Migrate on every start: it is idempotent, and it means an empty volume becomes a working
# database with no separate step to remember.
CMD ["sh", "-c", "npx --yes @better-auth/cli@1.4.21 migrate -y --config lib/auth.ts && node server.js"]
