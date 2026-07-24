import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { directMessages, users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq, or, and, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const withUserId = request.nextUrl.searchParams.get("withUser");

    if (withUserId) {
      // Get conversation with a specific user
      const result = await db
        .select({
          id: directMessages.id,
          content: directMessages.content,
          senderId: directMessages.senderId,
          receiverId: directMessages.receiverId,
          isRead: directMessages.isRead,
          isEdited: directMessages.isEdited,
          createdAt: directMessages.createdAt,
        })
        .from(directMessages)
        .where(
          or(
            and(
              eq(directMessages.senderId, userId),
              eq(directMessages.receiverId, withUserId)
            ),
            and(
              eq(directMessages.senderId, withUserId),
              eq(directMessages.receiverId, userId)
            )
          )
        )
        .orderBy(directMessages.createdAt)
        .limit(100);

      // Mark unread messages as read
      await db
        .update(directMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(directMessages.senderId, withUserId),
            eq(directMessages.receiverId, userId),
            eq(directMessages.isRead, false)
          )
        );

      return NextResponse.json({ messages: result });
    }

    // Get list of conversations (unique users)
    const conversations = await db.execute(sql`
      SELECT DISTINCT ON (other_user_id)
        other_user_id,
        u.display_name,
        u.username,
        u.avatar_url,
        u.is_online,
        last_message,
        last_message_at,
        unread_count
      FROM (
        SELECT
          CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END AS other_user_id,
          content AS last_message,
          created_at AS last_message_at,
          CASE WHEN receiver_id = ${userId} AND is_read = false THEN 1 ELSE 0 END AS unread_count
        FROM direct_messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
        ORDER BY created_at DESC
      ) sub
      JOIN users u ON u.id = sub.other_user_id
      ORDER BY other_user_id, last_message_at DESC
    `);

    return NextResponse.json({ conversations: conversations.rows });
  } catch (error) {
    console.error("DM error:", error);
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

    const { content, receiverId } = await request.json();
    if (!content || !receiverId) {
      return NextResponse.json(
        { error: "Contenu et destinataire requis" },
        { status: 400 }
      );
    }

    const [dm] = await db
      .insert(directMessages)
      .values({ content, senderId: userId, receiverId })
      .returning();

    return NextResponse.json({ message: dm }, { status: 201 });
  } catch (error) {
    console.error("Send DM error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
