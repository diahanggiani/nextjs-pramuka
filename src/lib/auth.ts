/**
config utama NextAuth untuk setup:
- provider (CredentialsProvider)
- logic login (authorize)
- adapter ke Prisma
- session strategy (jwt)
- custom callback (jwt, session)
- halaman login custom (signIn)
*/

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { compare } from "bcrypt";

// konfigurasi next-auth
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if(!credentials?.username || !credentials?.password) {
                    console.log("Username or password not provided");
                    return null
                }

                const existingUser = await prisma.user.findUnique({
                    where: { username: credentials?.username }
                });
                if(!existingUser) {
                    console.log("User not found");
                    return null;
                }

                const passwordMatch = await compare(credentials.password, existingUser.password);
                if(!passwordMatch) {
                    console.log("Password not match");
                    return null;
                }

                return {
                    id: existingUser.id,
                    username: existingUser.username,
                    role: existingUser.role
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            console.log(token, user);
            if(user) {
                return {
                    ...token,
                    username: user.username
                }
            }
            return token
        },
        async session({ session, token }) {
            console.log(token);
            return {
                ...session,
                user: {
                    ...session.user,
                    username: token.username,
                    role: token.role,
                    kode_kwarcab: token.kode_kwarcab,
                    kode_kwaran: token.kode_kwaran,
                    kode_gusdep: token.kode_gusdep,
                }
            }
            return session
        },
    }
}
