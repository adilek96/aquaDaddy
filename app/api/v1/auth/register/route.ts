import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signApiToken } from "@/lib/apiAuth";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов` },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        role: "USER",
      },
    });

    const { password: _password, ...userWithoutPassword } = user;

    // Токен выдаём сразу, чтобы после регистрации не требовался отдельный вход
    return NextResponse.json(
      {
        user: userWithoutPassword,
        token: signApiToken({
          id: user.id,
          email: user.email,
          role: user.role,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
