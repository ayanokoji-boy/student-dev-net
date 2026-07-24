import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, users, postLikes, postComments } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const result = await db
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
      .orderBy(desc(posts.createdAt));

    return NextResponse.json({ posts: result });
  } catch (error) {
    console.error("Posts error:", error);
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

    const { title, content, tags } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Titre et contenu requis" },
        { status: 400 }
      );
    }

    const [post] = await db
      .insert(posts)
      .values({ title, content, tags, userId })
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
        post: {
          ...post,
          userName: user.displayName,
          userUsername: user.username,
          userAvatar: user.avatarUrl,
          commentCount: 0,
          isLiked: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
