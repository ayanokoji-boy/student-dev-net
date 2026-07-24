"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatView from "./ChatView";
import FeedView from "./FeedView";
import MembersView from "./MembersView";
import DMView from "./DMView";
import ProfileView from "./ProfileView";
import BrowseChannels from "./BrowseChannels";

export interface UserData {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string | null;
  location?: string | null;
  techStack?: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean | null;
  createdAt?: string;
}

export interface ChannelData {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  isPrivate: boolean | null;
  createdAt: string;
  memberCount: number;
}

export type ViewType =
  | "chat"
  | "feed"
  | "members"
  | "dm"
  | "profile"
  | "browse";

export default function Dashboard({
  user,
  onLogout,
  onUserUpdate,
}: {
  user: UserData;
  onLogout: () => void;
  onUserUpdate: (u: UserData) => void;
}) {
  const [view, setView] = useState<ViewType>("chat");
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(
    null
  );
  const [selectedDMUser, setSelectedDMUser] = useState<UserData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [channelsLoading, setChannelsLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    try {
      const res = await fetch("/api/channels");
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels);
        if (data.channels.length > 0 && !selectedChannel) {
          setSelectedChannel(data.channels[0]);
        }
      }
    } catch {
      console.error("Failed to load channels");
    } finally {
      setChannelsLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onLogout();
  }

  function handleSelectChannel(channel: ChannelData) {
    setSelectedChannel(channel);
    setView("chat");
    setMobileMenuOpen(false);
  }

  function handleDMUser(u: UserData) {
    setSelectedDMUser(u);
    setView("dm");
    setMobileMenuOpen(false);
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40 
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar
          user={user}
          channels={channels}
          channelsLoading={channelsLoading}
          selectedChannel={selectedChannel}
          view={view}
          onSelectChannel={handleSelectChannel}
          onChangeView={(v: ViewType) => {
            setView(v);
            setMobileMenuOpen(false);
          }}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-dark-900 border-b border-dark-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <span className="font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              DevLycée
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {view === "chat" && selectedChannel && (
            <ChatView channel={selectedChannel} user={user} />
          )}
          {view === "chat" && !selectedChannel && (
            <div className="h-full flex items-center justify-center bg-dark-950">
              <div className="text-center">
                <span className="text-6xl block mb-4">💬</span>
                <h2 className="text-xl font-semibold text-dark-300 mb-2">
                  Aucun canal sélectionné
                </h2>
                <p className="text-dark-500">
                  Choisis un canal dans la barre latérale pour commencer à
                  discuter
                </p>
              </div>
            </div>
          )}
          {view === "feed" && <FeedView user={user} />}
          {view === "members" && (
            <MembersView user={user} onDM={handleDMUser} />
          )}
          {view === "dm" && (
            <DMView
              user={user}
              selectedUser={selectedDMUser}
              onSelectUser={setSelectedDMUser}
            />
          )}
          {view === "profile" && (
            <ProfileView user={user} onUpdate={onUserUpdate} />
          )}
          {view === "browse" && (
            <BrowseChannels
              onJoined={() => {
                loadChannels();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
