import NextAuth from "next-auth"
import Apple from "next-auth/providers/apple"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Apple, Google],
})
