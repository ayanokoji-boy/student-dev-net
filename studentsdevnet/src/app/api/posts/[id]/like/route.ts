import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, postLikes } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

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
      .from(postLikes)
      .where(
        and(eq(postLikes.postId, id), eq(postLikes.userId, userId))
      )
      .limit(1);

    if (existing.length > 0) {
      // Unlike
      await db
        .delete(postLikes)
        .where(
          and(eq(postLikes.postId, id), eq(postLikes.userId, userId))
        );
      await db
        .update(posts)
        .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
        .where(eq(posts.id, id));

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await db
        .insert(postLikes)
        .values({ postId: id, userId });
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, id));

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
