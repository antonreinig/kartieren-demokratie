import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Email from "next-auth/providers/nodemailer"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    ...authConfig.providers,
    Email({
      server: process.env.EMAIL_SERVER || "smtp://mock:mock@localhost:2525",
      from: process.env.EMAIL_FROM || "noreply@example.com",
    }),
  ],
})
