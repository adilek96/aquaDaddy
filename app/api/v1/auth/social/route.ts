import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { signApiToken } from "@/lib/apiAuth";
import { verifyAppleIdToken } from "@/lib/appleAuth";

const googleClient = new OAuth2Client(process.env.AUTH_GOOGLE_ID);

type SocialProfile = {
  provider: "google" | "apple";
  providerAccountId: string;
  email: string;
  name?: string;
  image?: string;
};

async function resolveGoogle(idToken: string): Promise<SocialProfile> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.AUTH_GOOGLE_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.email || !payload.sub) {
    throw new Error("Invalid token");
  }

  return {
    provider: "google",
    providerAccountId: payload.sub,
    email: payload.email,
    name: payload.name,
    image: payload.picture,
  };
}

async function resolveApple(
  idToken: string,
  fallbackName?: string
): Promise<SocialProfile> {
  const payload = await verifyAppleIdToken(idToken);

  // Apple отдаёт email только при первом входе, дальше — лишь sub.
  // Поэтому аккаунт ищем по providerAccountId, а email нужен только для нового.
  const existing = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "apple",
        providerAccountId: payload.sub,
      },
    },
    select: { user: { select: { email: true } } },
  });

  const email = payload.email ?? existing?.user.email;
  if (!email) {
    throw new Error(
      "Apple не передал email, а связанный аккаунт не найден — повторите вход, отозвав доступ в настройках Apple ID"
    );
  }

  return {
    provider: "apple",
    providerAccountId: payload.sub,
    email,
    name: fallbackName,
  };
}

export async function POST(request: Request) {
  try {
    const { idToken, provider = "google", name } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    if (provider !== "google" && provider !== "apple") {
      return NextResponse.json(
        { error: `Неподдерживаемый провайдер: ${provider}` },
        { status: 400 }
      );
    }

    let profile: SocialProfile;
    try {
      profile =
        provider === "google"
          ? await resolveGoogle(idToken)
          : await resolveApple(idToken, name);
    } catch (error) {
      console.error(`Social auth (${provider}) verification failed:`, error);
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Invalid token",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {
        name: profile.name || undefined,
        image: profile.image || undefined,
      },
      create: {
        email: profile.email,
        name: profile.name || "",
        image: profile.image,
        role: "USER",
      },
    });

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: "oauth",
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
      token: signApiToken({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
    });
  } catch (error) {
    console.error("Social Auth Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
