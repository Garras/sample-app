export default function Home() {
    return (
        <main>
            <h1>Better Auth</h1>
            <p>OIDC provider. Nothing is protected by it yet.</p>
            <ul>
                <li>
                    <a href="/api/auth/.well-known/openid-configuration">
                        discovery document
                    </a>
                </li>
                <li>
                    <a href="/login">login</a>
                </li>
            </ul>
        </main>
    );
}
