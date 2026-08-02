import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { signApiToken } from '@/lib/apiAuth';

const client = new OAuth2Client(process.env.AUTH_GOOGLE_ID);

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.AUTH_GOOGLE_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
        image: picture || undefined,
      } as any,
      create: {
        email,
        name: name || '',
        image: picture,
        role: 'USER',
      } as any,
    }) as any;

    // Sync Account (matching NextAuth pattern)
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: googleId,
      },
    });

    const token = signApiToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
      token: token,
    });
  } catch (error) {
    console.error('Social Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
