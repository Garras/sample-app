const express = require("express");
const app = express();
const port = 8080;

/**
 * The gateway sets X-USER to the OIDC *access token*, not a username - see
 * `ngx.req.set_header("X-USER", res.access_token)` in the generated authentik.lua /
 * keycloak.lua. Both providers set the same thing, so one decoder covers both; what
 * differs is which claims are inside.
 *
 * The signature is NOT checked here. lua-resty-openidc already validated the token at the
 * gateway before the request was proxied, and this service is only reachable through it.
 * That assumption is the whole security model: if the container is ever exposed directly,
 * anyone can send whatever X-USER they like and this would believe it.
 */
function decodeJwtPayload(token) {
  const parts = token.split(".");

  // Not a JWT - Authentik can be configured to issue opaque tokens, in which case the
  // username has to come from the provider's userinfo endpoint instead.
  if (parts.length !== 3) return null;

  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * The claims the two providers actually populate, most specific first.
 *
 *   Keycloak   preferred_username, plus email/name from the profile and email scopes
 *   Authentik  preferred_username and name; `sub` is a UUID or user id depending on the
 *              provider's sub_mode, so it is the last resort rather than the first
 *
 * `sub` is always present and always unique, but it is an identifier rather than a name -
 * useful to log, useless to read.
 */
const USERNAME_CLAIMS = ["preferred_username", "username", "email", "name", "sub"];

function usernameFrom(claims) {
  for (const claim of USERNAME_CLAIMS)
    if (typeof claims[claim] === "string" && claims[claim])
      return {username: claims[claim], claim};

  return null;
}

app.get("/api", (req, res) => {
  const token = req.get("X-USER");

  if (!token) {
    // Either the location is not behind authentication, or something reached this
    // service without passing through the gateway.
    console.log("[/api] no X-USER header - request did not come through the gateway");
    return res.send("<b>Backend Hello World!</b><br /> (anonymous)");
  }

  const claims = decodeJwtPayload(token);

  if (!claims) {
    // Deliberately not logging the token itself: it is a live credential.
    console.log("[/api] X-USER is not a decodable JWT (opaque token?)");
    return res.send("<b>Backend Hello World!</b><br /> (unknown user)");
  }

  const found = usernameFrom(claims);

  // `iss` tells you which provider and realm issued it, which is what distinguishes
  // Authentik from Keycloak, and one Keycloak realm from another.
  console.log(
    `[/api] user=${found ? found.username : "<no name claim>"}` +
      `${found ? ` (from ${found.claim})` : ""} iss=${claims.iss ?? "<none>"}`,
  );

  res.send(`<b>Backend Hello World!</b><br /> Hello ${found ? found.username : "unknown user"}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
