"use client";

import type { UserData, ChannelData, ViewType } from "./Dashboard";

interface SidebarProps {
  user: UserData;
  channels: ChannelData[];
  channelsLoading: boolean;
  selectedChannel: ChannelData | null;
  view: ViewType;
  onSelectChannel: (channel: ChannelData) => void;
  onChangeView: (view: ViewType) => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  channels,
  channelsLoading,
  selectedChannel,
  view,
  onSelectChannel,
  onChangeView,
  onLogout,
}: SidebarProps) {
  const navItems: { id: ViewType; label: string; emoji: string }[] = [
    { id: "feed", label: "Fil d'actualité", emoji: "📰" },
    { id: "members", label: "Membres", emoji: "👥" },
    { id: "dm", label: "Messages privés", emoji: "✉️" },
    { id: "browse", label: "Explorer", emoji: "🔍" },
    { id: "profile", label: "Mon profil", emoji: "👤" },
  ];

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-72 h-screen bg-dark-900 border-r border-dark-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <h1 className="font-black text-lg bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              DevLycée
            </h1>
            <p className="text-xs text-dark-400">Réseau mondial</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${
                view === item.id
                  ? "bg-primary-600/20 text-primary-300"
                  : "text-dark-300 hover:bg-dark-800 hover:text-white"
              }`}
          >
            <span className="text-lg">{item.emoji}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between mb-2 px-3">
          <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
            Canaux
          </h3>
        </div>

        {channelsLoading ? (
          <div className="space-y-2 px-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 bg-dark-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-6 px-3">
            <p className="text-dark-500 text-sm">Aucun canal</p>
            <button
              onClick={() => onChangeView("browse")}
              className="text-primary-400 text-sm mt-1 hover:underline"
            >
              Explorer les canaux
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all
                  ${
                    view === "chat" && selectedChannel?.id === channel.id
                      ? "bg-primary-600/20 text-primary-300"
                      : "text-dark-300 hover:bg-dark-800 hover:text-white"
                  }`}
              >
                <span className="text-base">{channel.emoji || "💬"}</span>
                <span className="truncate">{channel.name}</span>
                <span className="ml-auto text-xs text-dark-500">
                  {channel.memberCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User section */}
      <div className="p-3 border-t border-dark-700">
        <div className="flex items-center gap-3 p-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-dark-400 truncate">@{user.username}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-red-400 transition-colors"
            title="Déconnexion"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
