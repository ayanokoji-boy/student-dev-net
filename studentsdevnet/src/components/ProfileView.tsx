"use client";

import { useState } from "react";
import type { UserData } from "./Dashboard";

export default function ProfileView({
  user,
  onUpdate,
}: {
  user: UserData;
  onUpdate: (u: UserData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [techStack, setTechStack] = useState(user.techStack || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, location, techStack }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data.user);
        setEditing(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      console.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-full overflow-y-auto bg-dark-950">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">👤 Mon profil</h1>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 mb-6 animate-fade-in flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Profil mis à jour avec succès !
          </div>
        )}

        <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-3xl font-bold border-4 border-dark-900 shadow-xl">
                {initials}
              </div>
            </div>
          </div>

          {/* Profile info */}
          <div className="pt-16 pb-6 px-6">
            {!editing ? (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{user.displayName}</h2>
                    <p className="text-dark-400">@{user.username}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-dark-800 hover:bg-dark-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all border border-dark-600"
                  >
                    ✏️ Modifier
                  </button>
                </div>

                {user.bio && (
                  <p className="text-dark-200 mb-4 leading-relaxed">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-dark-400 mb-4">
                  {user.location && (
                    <span className="flex items-center gap-1.5">📍 {user.location}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    📧 {user.email}
                  </span>
                  {user.createdAt && (
                    <span className="flex items-center gap-1.5">
                      📅 Membre depuis{" "}
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {user.techStack && (
                  <div>
                    <h3 className="text-sm font-semibold text-dark-300 mb-2">
                      🛠️ Stack technique
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.techStack.split(",").map((tech) => (
                        <span
                          key={tech}
                          className="bg-primary-600/15 text-primary-300 text-sm px-3 py-1 rounded-lg font-medium"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!user.bio && !user.techStack && (
                  <div className="text-center py-6 bg-dark-800/50 rounded-xl mt-4">
                    <p className="text-dark-400 text-sm mb-2">
                      Ton profil est un peu vide...
                    </p>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                    >
                      Complète-le maintenant →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Nom affiché
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Parle de toi en quelques mots..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Paris, France 🇫🇷"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Stack technique
                  </label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="React, TypeScript, Python (séparés par des virgules)"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 shadow-lg shadow-primary-600/25"
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setDisplayName(user.displayName);
                      setBio(user.bio || "");
                      setLocation(user.location || "");
                      setTechStack(user.techStack || "");
                    }}
                    className="bg-dark-800 hover:bg-dark-700 text-dark-300 px-6 py-2.5 rounded-xl text-sm transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
