import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, channelMembers, channels } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { username, displayName, email, password } = await request.json();

    if (!username || !displayName || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Check existing user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà pris" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        username,
        displayName,
        email,
        passwordHash,
        isOnline: true,
      })
      .returning();

    // Auto-join general and off-topic channels
    const generalChannels = await db
      .select()
      .from(channels)
      .where(eq(channels.isPrivate, false));

    const genChannel = generalChannels.find((c) => c.name === "général");
    const offTopic = generalChannels.find((c) => c.name === "off-topic");

    const autoJoin = [genChannel, offTopic].filter(Boolean);
    for (const ch of autoJoin) {
      if (ch) {
        await db
          .insert(channelMembers)
          .values({ channelId: ch.id, userId: user.id });
      }
    }

    const token = await createToken(user.id);

    const response = NextResponse.json({ user: { id: user.id, username: user.username, displayName: user.displayName, email: user.email } });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
