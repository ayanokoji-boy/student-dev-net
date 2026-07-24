"use client";

import { useState, useEffect } from "react";
import type { UserData } from "./Dashboard";

interface MemberData {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  techStack: string | null;
  avatarUrl: string | null;
  isOnline: boolean | null;
  createdAt: string;
}

export default function MembersView({
  user,
  onDM,
}: {
  user: UserData;
  onDM: (u: UserData) => void;
}) {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.users);
      }
    } catch {
      console.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  const filtered = members.filter(
    (m) =>
      m.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.username.toLowerCase().includes(search.toLowerCase()) ||
      (m.techStack && m.techStack.toLowerCase().includes(search.toLowerCase()))
  );

  const online = filtered.filter((m) => m.isOnline);
  const offline = filtered.filter((m) => !m.isOnline);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="h-full overflow-y-auto bg-dark-950">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">👥 Membres</h1>
            <p className="text-dark-400 text-sm mt-1">
              {members.length} développeurs dans la communauté ·{" "}
              {members.filter((m) => m.isOnline).length} en ligne
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher un membre..."
              className="w-full sm:w-72 bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-dark-900 rounded-2xl border border-dark-700 p-5 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-dark-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dark-800 rounded w-32" />
                    <div className="h-3 bg-dark-800 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-xl font-semibold text-dark-300 mb-2">
              Aucun membre trouvé
            </h3>
            <p className="text-dark-500">
              Essaie avec un autre terme de recherche
            </p>
          </div>
        ) : (
          <>
            {online.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-dot" />
                  En ligne — {online.length}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {online.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isCurrentUser={member.id === user.id}
                      onDM={onDM}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              </>
            )}

            {offline.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-dark-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-dark-500 rounded-full" />
                  Hors ligne — {offline.length}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {offline.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isCurrentUser={member.id === user.id}
                      onDM={onDM}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MemberCard({
  member,
  isCurrentUser,
  onDM,
  getInitials,
}: {
  member: MemberData;
  isCurrentUser: boolean;
  onDM: (u: UserData) => void;
  getInitials: (name: string) => string;
}) {
  return (
    <div className="bg-dark-900 rounded-2xl border border-dark-700 p-5 hover:border-dark-600 transition-all animate-fade-in">
      <div className="flex gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold">
            {getInitials(member.displayName)}
          </div>
          {member.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-900" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">
              {member.displayName}
            </p>
            {isCurrentUser && (
              <span className="bg-primary-600/20 text-primary-300 text-xs px-2 py-0.5 rounded-md font-medium">
                Toi
              </span>
            )}
          </div>
          <p className="text-dark-400 text-xs">@{member.username}</p>
        </div>
        {!isCurrentUser && (
          <button
            onClick={() =>
              onDM({
                id: member.id,
                username: member.username,
                displayName: member.displayName,
                email: "",
                bio: member.bio,
                location: member.location,
                techStack: member.techStack,
                avatarUrl: member.avatarUrl,
                isOnline: member.isOnline,
              })
            }
            className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-primary-400 transition-colors flex-shrink-0"
            title="Envoyer un message"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        )}
      </div>
      {member.bio && (
        <p className="text-dark-300 text-xs mt-3 leading-relaxed line-clamp-2">
          {member.bio}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        {member.location && (
          <span className="text-xs text-dark-400 flex items-center gap-1">
            📍 {member.location}
          </span>
        )}
      </div>
      {member.techStack && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {member.techStack.split(",").slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="bg-dark-800 text-dark-300 text-xs px-2 py-0.5 rounded-md"
            >
              {tech.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
