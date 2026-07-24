import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const channelId = request.nextUrl.searchParams.get("channelId");
    if (!channelId) {
      return NextResponse.json(
        { error: "channelId requis" },
        { status: 400 }
      );
    }

    const result = await db
      .select({
        id: messages.id,
        content: messages.content,
        channelId: messages.channelId,
        userId: messages.userId,
        isEdited: messages.isEdited,
        createdAt: messages.createdAt,
        userName: users.displayName,
        userUsername: users.username,
        userAvatar: users.avatarUrl,
        userOnline: users.isOnline,
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.channelId, channelId))
      .orderBy(messages.createdAt)
      .limit(100);

    return NextResponse.json({ messages: result });
  } catch (error) {
    console.error("Messages error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { content, channelId } = await request.json();
    if (!content || !channelId) {
      return NextResponse.json(
        { error: "Contenu et channelId requis" },
        { status: 400 }
      );
    }

    const [message] = await db
      .insert(messages)
      .values({ content, channelId, userId })
      .returning();

    const [user] = await db
      .select({
        displayName: users.displayName,
        username: users.username,
        avatarUrl: users.avatarUrl,
        isOnline: users.isOnline,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json(
      {
        message: {
          ...message,
          userName: user.displayName,
          userUsername: user.username,
          userAvatar: user.avatarUrl,
          userOnline: user.isOnline,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
