import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        location: users.location,
        techStack: users.techStack,
        avatarUrl: users.avatarUrl,
        isOnline: users.isOnline,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.displayName);

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("Users error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
