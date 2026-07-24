import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";

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
    const { content } = await request.json();

    const [msg] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    if (!msg) {
      return NextResponse.json({ error: "Message non trouvé" }, { status: 404 });
    }

    if (msg.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const [updated] = await db
      .update(messages)
      .set({ content, isEdited: true, updatedAt: new Date() })
      .where(eq(messages.id, id))
      .returning();

    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error("Update message error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

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

    const [msg] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    if (!msg) {
      return NextResponse.json({ error: "Message non trouvé" }, { status: 404 });
    }

    if (msg.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await db.delete(messages).where(eq(messages.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
