import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ACHIEVEMENT_CATEGORIES,
  achievementKey,
} from "@/lib/achievements";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

function authorized(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return Boolean(token) && token === process.env.ADMIN_TOKEN;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);

  const defs = await prisma.achievementDef.findMany({
    orderBy: [{ category: "asc" }, { threshold: "asc" }],
  });
  return json({ defs });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);

  let body: { category?: unknown; threshold?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const category = String(body.category ?? "");
  const threshold = Number(body.threshold);

  if (!ACHIEVEMENT_CATEGORIES.includes(category as never)) {
    return json({ error: "Unknown category" }, 400);
  }
  if (!Number.isInteger(threshold) || threshold < 1) {
    return json({ error: "Threshold must be a positive integer" }, 400);
  }

  const key = achievementKey(category, threshold);

  // Такой порог уже есть — просто делаем его активным, без дубля
  const def = await prisma.achievementDef.upsert({
    where: { key },
    update: { active: true, category, threshold },
    create: { key, category, threshold },
  });

  return json({ def }, 201);
}
