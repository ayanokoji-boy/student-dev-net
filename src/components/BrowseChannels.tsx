"use client";

import { useState, useEffect } from "react";

interface BrowseChannel {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  isPrivate: boolean | null;
  createdAt: string;
  memberCount: number;
  isMember: boolean;
}

export default function BrowseChannels({
  onJoined,
}: {
  onJoined: () => void;
}) {
  const [channels, setChannels] = useState<BrowseChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEmoji, setNewEmoji] = useState("💬");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    try {
      const res = await fetch("/api/channels/browse");
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels);
      }
    } catch {
      console.error("Failed to browse channels");
    } finally {
      setLoading(false);
    }
  }

  async function joinChannel(id: string) {
    // Optimistic update
    setChannels((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isMember: true, memberCount: c.memberCount + 1 }
          : c
      )
    );

    try {
      await fetch(`/api/channels/${id}/join`, { method: "POST" });
      onJoined();
    } catch {
      loadChannels();
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim(),
          emoji: newEmoji,
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewDesc("");
        setNewEmoji("💬");
        setShowCreate(false);
        loadChannels();
        onJoined();
      }
    } catch {
      console.error("Failed to create channel");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-dark-950">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🔍 Explorer les canaux</h1>
            <p className="text-dark-400 text-sm mt-1">
              Découvre et rejoins les canaux de discussion
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary-600/25"
          >
            ➕ Créer un canal
          </button>
        </div>

        {showCreate && (
          <div className="bg-dark-900 rounded-2xl border border-dark-700 p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold mb-4">Nouveau canal</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Nom du canal
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="mon-canal"
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="De quoi parle ce canal ?"
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                >
                  {creating ? "Création..." : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="bg-dark-800 hover:bg-dark-700 text-dark-300 px-6 py-2.5 rounded-xl text-sm transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-dark-900 rounded-2xl border border-dark-700 p-5 animate-pulse"
              >
                <div className="h-8 bg-dark-800 rounded w-32 mb-3" />
                <div className="h-4 bg-dark-800 rounded w-full mb-2" />
                <div className="h-4 bg-dark-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-dark-900 rounded-2xl border border-dark-700 p-5 hover:border-dark-600 transition-all animate-fade-in"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{channel.emoji}</span>
                    <h3 className="font-bold">{channel.name}</h3>
                  </div>
                  {channel.isMember ? (
                    <span className="bg-green-500/15 text-green-400 text-xs px-2.5 py-1 rounded-lg font-medium">
                      ✓ Membre
                    </span>
                  ) : (
                    <button
                      onClick={() => joinChannel(channel.id)}
                      className="bg-primary-600 hover:bg-primary-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                    >
                      Rejoindre
                    </button>
                  )}
                </div>
                {channel.description && (
                  <p className="text-dark-400 text-sm mb-3 line-clamp-2">
                    {channel.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-dark-500">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {channel.memberCount} membre{channel.memberCount !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
