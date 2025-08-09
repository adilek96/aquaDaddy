import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from './lib/prisma';



export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 2,  // 2 дня (в секундах)
    updateAge: 60 * 60 * 12,   // продлеваем раз в 12 часов при активности
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 2,  // JWT тоже живёт 2 дня
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signIn",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string; // <- записываем ID в токен
        token.country = user.country;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.country = token.country;
      }
      return session;
    }
  }


});
