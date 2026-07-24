import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { channelMembers } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db
      .select()
      .from(channelMembers)
      .where(
        and(
          eq(channelMembers.channelId, id),
          eq(channelMembers.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ message: "Déjà membre" });
    }

    await db
      .insert(channelMembers)
      .values({ channelId: id, userId });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Join channel error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
