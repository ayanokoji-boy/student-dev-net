import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { postComments, users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
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

    if (!content) {
      return NextResponse.json(
        { error: "Contenu requis" },
        { status: 400 }
      );
    }

    const [comment] = await db
      .insert(postComments)
      .values({ content, postId: id, userId })
      .returning();

    const [user] = await db
      .select({
        displayName: users.displayName,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json(
      {
        comment: {
          ...comment,
          userName: user.displayName,
          userUsername: user.username,
          userAvatar: user.avatarUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
