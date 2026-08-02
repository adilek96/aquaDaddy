import { createPublicKey } from "crypto";
import { decode, verify, type JwtPayload } from "jsonwebtoken";

const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_KEYS_URL = `${APPLE_ISSUER}/auth/keys`;

type AppleJwk = {
  kid: string;
  kty: string;
  use: string;
  alg: string;
  n: string;
  e: string;
};

let cachedKeys: { keys: AppleJwk[]; fetchedAt: number } | null = null;
const KEYS_TTL_MS = 60 * 60 * 1000;

/**
 * Идентификаторы клиентов Apple, чьи токены принимаем (aud).
 * Для нативного приложения это bundle id, для веба — Services ID,
 * поэтому допускается список через запятую.
 */
export function getAppleClientIds(): string[] {
  const raw = process.env.AUTH_APPLE_CLIENT_IDS ?? process.env.AUTH_APPLE_ID;
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function getAppleKeys(): Promise<AppleJwk[]> {
  if (cachedKeys && Date.now() - cachedKeys.fetchedAt < KEYS_TTL_MS) {
    return cachedKeys.keys;
  }

  const response = await fetch(APPLE_KEYS_URL);
  if (!response.ok) {
    throw new Error(`Не удалось получить ключи Apple: ${response.status}`);
  }

  const { keys } = (await response.json()) as { keys: AppleJwk[] };
  cachedKeys = { keys, fetchedAt: Date.now() };
  return keys;
}

export type ApplePayload = {
  sub: string;
  email?: string;
  emailVerified: boolean;
};

/**
 * Проверяет identity token Apple: подпись по JWKS, издателя и аудиторию.
 */
export async function verifyAppleIdToken(
  idToken: string
): Promise<ApplePayload> {
  const clientIds = getAppleClientIds();
  if (clientIds.length === 0) {
    throw new Error(
      "Вход через Apple не настроен: задайте AUTH_APPLE_CLIENT_IDS (bundle id приложения)"
    );
  }

  const decoded = decode(idToken, { complete: true });
  const kid = decoded?.header?.kid;
  if (!kid) {
    throw new Error("В токене Apple отсутствует kid");
  }

  const jwk = (await getAppleKeys()).find((key) => key.kid === kid);
  if (!jwk) {
    throw new Error("Ключ Apple с таким kid не найден");
  }

  const publicKey = createPublicKey({ key: jwk, format: "jwk" });

  const payload = verify(idToken, publicKey, {
    algorithms: ["RS256"],
    issuer: APPLE_ISSUER,
    audience: clientIds as [string, ...string[]],
  }) as JwtPayload;

  if (!payload.sub) {
    throw new Error("В токене Apple отсутствует sub");
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    // Apple присылает email_verified строкой "true" или булевым значением
    emailVerified:
      payload.email_verified === true || payload.email_verified === "true",
  };
}
