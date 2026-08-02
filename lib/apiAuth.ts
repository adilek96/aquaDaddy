import { auth } from "@/auth";
import { sign, verify, type JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";

export type ApiUser = {
  id: string;
  email: string;
  role: string;
};

const TOKEN_TTL = "30d";

/**
 * Секрет для подписи токенов мобильного приложения.
 * Auth.js v5 читает AUTH_SECRET, поэтому он же используется и здесь —
 * NEXTAUTH_SECRET оставлен как запасной вариант для старых окружений.
 */
export function getJwtSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET не задан: подписывать и проверять токены API нечем"
    );
  }
  return secret;
}

export function signApiToken(user: ApiUser): string {
  return sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: TOKEN_TTL }
  );
}

/**
 * Определяет пользователя запроса. Сначала пробуется Bearer-токен
 * (мобильное приложение), затем cookie-сессия Auth.js (веб).
 */
export async function getApiUser(req: Request): Promise<ApiUser | null> {
  const header = req.headers.get("authorization");

  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = verify(token, getJwtSecret()) as JwtPayload;
      if (payload && typeof payload.id === "string") {
        return {
          id: payload.id,
          email: typeof payload.email === "string" ? payload.email : "",
          role: typeof payload.role === "string" ? payload.role : "USER",
        };
      }
    } catch {
      // Просроченный или подделанный токен — не откатываемся на cookie
      return null;
    }
    return null;
  }

  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email ?? "",
      role: (session.user as { role?: string }).role ?? "USER",
    };
  }

  return null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}
