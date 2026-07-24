import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, users, postComments, postLikes } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        tags: posts.tags,
        likesCount: posts.likesCount,
        userId: posts.userId,
        createdAt: posts.createdAt,
        userName: users.displayName,
        userUsername: users.username,
        userAvatar: users.avatarUrl,
        commentCount: sql<number>`(SELECT COUNT(*) FROM post_comments WHERE post_id = ${posts.id})::int`,
        isLiked: sql<boolean>`EXISTS(SELECT 1 FROM post_likes WHERE post_id = ${posts.id} AND user_id = ${userId})`,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Fetch comments
    const comments = await db
      .select({
        id: postComments.id,
        content: postComments.content,
        createdAt: postComments.createdAt,
        userId: postComments.userId,
        userName: users.displayName,
        userUsername: users.username,
        userAvatar: users.avatarUrl,
      })
      .from(postComments)
      .innerJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, id))
      .orderBy(postComments.createdAt);

    return NextResponse.json({ post, comments });
  } catch (error) {
    console.error("Get post error:", error);
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
    const { title, content, tags } = await request.json();

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    if (post.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const [updated] = await db
      .update(posts)
      .set({
        title: title || post.title,
        content: content || post.content,
        tags: tags !== undefined ? tags : post.tags,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error("Update post error:", error);
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

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    if (post.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await db.delete(posts).where(eq(posts.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
