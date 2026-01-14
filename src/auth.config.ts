import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [], // Providers added in auth.ts
    pages: {
        signIn: '/login', // Optional custom login
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // Optional: protected routes logic
            return true
        },
    },
} satisfies NextAuthConfig
