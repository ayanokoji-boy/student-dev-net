import { NextResponse } from "next/server";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const result = await db
      .select({
        id: channels.id,
        name: channels.name,
        description: channels.description,
        emoji: channels.emoji,
        isPrivate: channels.isPrivate,
        createdAt: channels.createdAt,
        memberCount: sql<number>`(SELECT COUNT(*) FROM channel_members WHERE channel_id = ${channels.id})::int`,
        isMember: sql<boolean>`EXISTS(SELECT 1 FROM channel_members WHERE channel_id = ${channels.id} AND user_id = ${userId})`,
      })
      .from(channels)
      .orderBy(channels.name);

    return NextResponse.json({ channels: result });
  } catch (error) {
    console.error("Browse channels error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
