import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { displayName, bio, location, techStack } = await request.json();

    const [updated] = await db
      .update(users)
      .set({
        displayName,
        bio,
        location,
        techStack,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        bio: users.bio,
        location: users.location,
        techStack: users.techStack,
        avatarUrl: users.avatarUrl,
        isOnline: users.isOnline,
        createdAt: users.createdAt,
      });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
