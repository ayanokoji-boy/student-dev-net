import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { channels, channelMembers } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, id))
      .limit(1);

    if (!channel) {
      return NextResponse.json({ error: "Canal non trouvé" }, { status: 404 });
    }

    if (channel.createdBy !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await db.delete(channels).where(eq(channels.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete channel error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const { name, description, emoji } = await request.json();

    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, id))
      .limit(1);

    if (!channel) {
      return NextResponse.json({ error: "Canal non trouvé" }, { status: 404 });
    }

    if (channel.createdBy !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const [updated] = await db
      .update(channels)
      .set({
        name: name || channel.name,
        description: description !== undefined ? description : channel.description,
        emoji: emoji || channel.emoji,
        updatedAt: new Date(),
      })
      .where(eq(channels.id, id))
      .returning();

    return NextResponse.json({ channel: updated });
  } catch (error) {
    console.error("Update channel error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
