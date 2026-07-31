import {auth} from "../../../../../lib/auth";
import {toNextJsHandler} from "better-auth/next-js";

// Every Better Auth endpoint hangs off this one catch-all route: the OIDC discovery
// document, authorize, token, userinfo and jwks, plus sign-in and sign-up.
export const {GET, POST} = toNextJsHandler(auth);
