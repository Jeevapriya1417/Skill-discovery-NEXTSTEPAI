import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    /**
     * The base URL of the auth server.
     */
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
