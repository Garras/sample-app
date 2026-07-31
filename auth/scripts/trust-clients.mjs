/**
 * Marks every registered OIDC client as trusted, so no consent screen appears.
 *
 * Better Auth shows a consent screen unless the client record has `skipConsent` set, and
 * that field is reachable from neither `create-client` (its body is RFC 7591-shaped and
 * has no such field) nor `update-client`. Only the admin routes accept `skip_consent`, and
 * they are not reachable in this build - so the record is set directly.
 *
 * Appropriate here because every client of this provider is first-party: the consent screen
 * exists to protect a user from a THIRD-party app requesting their data, which is not the
 * situation when you own both sides. Do not do this on a provider with untrusted clients.
 *
 *   docker exec app-auth npm run trust-clients
 */
import Database from "better-sqlite3";

const path = process.env.DATABASE_PATH ?? "./data/auth.db";
const db = new Database(path);

const clients = db.prepare("select clientId, name, skipConsent from oauthClient").all();

if (clients.length === 0) {
    console.log(`No OIDC clients registered in ${path} - nothing to do.`);
    process.exit(0);
}

const {changes} = db
    .prepare("update oauthClient set skipConsent = 1 where skipConsent is not 1")
    .run();

console.log(`${clients.length} client(s) in ${path}, ${changes} newly trusted:`);
for (const client of clients) console.log(`  ${client.clientId}  ${client.name ?? ""}`);
console.log("Consent screen is now skipped for all of them.");
