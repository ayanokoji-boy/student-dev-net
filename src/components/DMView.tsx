"use client";

import { useState, useEffect, useRef } from "react";
import type { UserData } from "./Dashboard";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ConversationData {
  other_user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface DMMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean | null;
  isEdited: boolean | null;
  createdAt: string;
}

export default function DMView({
  user,
  selectedUser,
  onSelectUser,
}: {
  user: UserData;
  selectedUser: UserData | null;
  onSelectUser: (u: UserData | null) => void;
}) {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [showNewDM, setShowNewDM] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadConversations();
    loadAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadDMMessages(selectedUser.id);
      pollRef.current = setInterval(() => loadDMMessages(selectedUser.id), 3000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    try {
      const res = await fetch("/api/dm");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      console.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  async function loadAllUsers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users.filter((u: UserData) => u.id !== user.id));
      }
    } catch {
      console.error("Failed to load users");
    }
  }

  async function loadDMMessages(withUserId: string) {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/dm?withUser=${withUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {
      console.error("Failed to load DM messages");
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const content = newMessage.trim();
    setNewMessage("");

    const optimisticMsg: DMMessage = {
      id: `temp-${Date.now()}`,
      content,
      senderId: user.id,
      receiverId: selectedUser.id,
      isRead: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, receiverId: selectedUser.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setNewMessage(content);
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const filteredUsers = allUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex bg-dark-950">
      {/* Conversations list */}
      <div
        className={`w-full md:w-80 border-r border-dark-700 bg-dark-900 flex flex-col ${
          selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-dark-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">✉️ Messages</h2>
            <button
              onClick={() => setShowNewDM(!showNewDM)}
              className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-primary-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {showNewDM && (
            <div className="animate-fade-in">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un membre..."
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                autoFocus
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      setShowNewDM(false);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-800 text-sm transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {getInitials(u.displayName)}
                    </div>
                    <span className="truncate">{u.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-dark-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dark-800 rounded w-28" />
                    <div className="h-3 bg-dark-800 rounded w-44" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <span className="text-4xl block mb-3">💌</span>
              <h3 className="font-semibold text-dark-300 mb-1">
                Aucune conversation
              </h3>
              <p className="text-dark-500 text-sm mb-3">
                Envoie ton premier message !
              </p>
              <button
                onClick={() => setShowNewDM(true)}
                className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm transition-all"
              >
                Nouvelle conversation
              </button>
            </div>
          ) : (
            <div className="py-2">
              {conversations.map((conv) => (
                <button
                  key={conv.other_user_id}
                  onClick={() =>
                    onSelectUser({
                      id: conv.other_user_id,
                      username: conv.username,
                      displayName: conv.display_name,
                      email: "",
                      avatarUrl: conv.avatar_url,
                      isOnline: conv.is_online,
                    })
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-800 transition-colors ${
                    selectedUser?.id === conv.other_user_id
                      ? "bg-dark-800"
                      : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold">
                      {getInitials(conv.display_name)}
                    </div>
                    {conv.is_online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {conv.display_name}
                      </p>
                      <span className="text-xs text-dark-500">
                        {formatDistanceToNow(new Date(conv.last_message_at), {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <p className="text-dark-400 text-xs truncate">
                      {conv.last_message}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col ${
          !selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center gap-3">
              <button
                onClick={() => onSelectUser(null)}
                className="md:hidden p-2 hover:bg-dark-800 rounded-lg text-dark-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold">
                  {getInitials(selectedUser.displayName)}
                </div>
                {selectedUser.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900" />
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedUser.displayName}</p>
                <p className="text-dark-400 text-xs">
                  @{selectedUser.username} ·{" "}
                  {selectedUser.isOnline ? "En ligne" : "Hors ligne"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messagesLoading && messages.length === 0 ? (
                <div className="space-y-3 py-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}
                    >
                      <div className="h-10 bg-dark-800 rounded-2xl w-48 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl block mb-3">👋</span>
                    <p className="text-dark-400 text-sm">
                      Envoie un premier message à {selectedUser.displayName} !
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : ""}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-primary-600 text-white"
                            : "bg-dark-800 text-dark-200"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMine ? "text-primary-200" : "text-dark-500"
                          }`}
                        >
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-dark-900 border-t border-dark-700 p-4">
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message à ${selectedUser.displayName}...`}
                  className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl block mb-4">✉️</span>
              <h3 className="text-xl font-semibold text-dark-300 mb-2">
                Messages privés
              </h3>
              <p className="text-dark-500">
                Sélectionne une conversation ou commence-en une nouvelle
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
