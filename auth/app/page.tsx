import {AUTH_API} from "../lib/paths";

export default function Home() {
    return (
        <main>
            <h1>Better Auth</h1>
            <p>OIDC provider.</p>
            <ul>
                <li>
                    <a href={`${AUTH_API}/.well-known/openid-configuration`}>
                        discovery document
                    </a>
                </li>
                <li>
                    <a href="/auth/login">login</a>
                </li>
            </ul>
        </main>
    );
}
