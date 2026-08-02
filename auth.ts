import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';



export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !(user as any).password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          (user as any).password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: (user as any).role,
        };
      }
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
  // В .env лежит AUTH_SECRET (имя из Auth.js v5); NEXTAUTH_SECRET — для старых окружений
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signIn",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.country = (user as any).country;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        (session.user as any).country = token.country;
        (session.user as any).role = token.role;
      }
      return session;
    }
  }


});
