import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { channels, channelMembers } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

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
      })
      .from(channels)
      .innerJoin(
        channelMembers,
        sql`${channelMembers.channelId} = ${channels.id} AND ${channelMembers.userId} = ${userId}`
      )
      .orderBy(channels.name);

    return NextResponse.json({ channels: result });
  } catch (error) {
    console.error("Channels error:", error);
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

    const { name, description, emoji } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: "Le nom du canal est requis" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(channels)
      .where(eq(channels.name, name.toLowerCase().replace(/\s+/g, "-")))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ce canal existe déjà" },
        { status: 409 }
      );
    }

    const [channel] = await db
      .insert(channels)
      .values({
        name: name.toLowerCase().replace(/\s+/g, "-"),
        description,
        emoji: emoji || "💬",
        createdBy: userId,
      })
      .returning();

    // Creator auto-joins
    await db
      .insert(channelMembers)
      .values({ channelId: channel.id, userId });

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    console.error("Create channel error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
