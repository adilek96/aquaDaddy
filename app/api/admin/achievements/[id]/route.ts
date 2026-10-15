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

type Ctx = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);
  const { id } = await params;

  let body: { category?: unknown; threshold?: unknown; active?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const current = await prisma.achievementDef.findUnique({ where: { id } });
  if (!current) return json({ error: "Not found" }, 404);

  const category =
    body.category === undefined ? current.category : String(body.category);
  const threshold =
    body.threshold === undefined ? current.threshold : Number(body.threshold);

  if (!ACHIEVEMENT_CATEGORIES.includes(category as never)) {
    return json({ error: "Unknown category" }, 400);
  }
  if (!Number.isInteger(threshold) || threshold < 1) {
    return json({ error: "Threshold must be a positive integer" }, 400);
  }

  const data: {
    category: string;
    threshold: number;
    key: string;
    active?: boolean;
  } = {
    category,
    threshold,
    // Ключ всегда следует за категорией и порогом
    key: achievementKey(category, threshold),
  };
  if (body.active !== undefined) data.active = Boolean(body.active);

  try {
    const def = await prisma.achievementDef.update({ where: { id }, data });
    return json({ def });
  } catch {
    // Чаще всего — конфликт уникального ключа с другой наградой
    return json({ error: "Such milestone already exists" }, 409);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);
  const { id } = await params;

  try {
    await prisma.achievementDef.delete({ where: { id } });
  } catch {
    return json({ error: "Not found" }, 404);
  }
  return json({ success: true });
}
