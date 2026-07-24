"use client";

import { useState, useEffect, useRef } from "react";
import type { ChannelData, UserData } from "./Dashboard";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageData {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  isEdited: boolean | null;
  createdAt: string;
  userName: string;
  userUsername: string;
  userAvatar: string | null;
  userOnline: boolean | null;
}

export default function ChatView({
  channel,
  user,
}: {
  channel: ChannelData;
  user: UserData;
}) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    pollRef.current = setInterval(loadMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [channel.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages() {
    try {
      const res = await fetch(`/api/messages?channelId=${channel.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {
      console.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic update
    const optimisticMsg: MessageData = {
      id: `temp-${Date.now()}`,
      content,
      channelId: channel.id,
      userId: user.id,
      isEdited: false,
      createdAt: new Date().toISOString(),
      userName: user.displayName,
      userUsername: user.username,
      userAvatar: user.avatarUrl || null,
      userOnline: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, channelId: channel.id }),
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
    } finally {
      setSending(false);
    }
  }

  async function handleEdit(id: string) {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, content: editContent.trim(), isEdited: true }
              : m
          )
        );
        setEditingId(null);
        setEditContent("");
      }
    } catch {
      console.error("Failed to edit message");
    }
  }

  async function handleDelete(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" });
    } catch {
      loadMessages();
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

  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-violet-500",
    "from-teal-500 to-green-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-yellow-500",
  ];

  function getColor(userId: string) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="h-full flex flex-col bg-dark-950">
      {/* Channel header */}
      <div className="bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">{channel.emoji}</span>
        <div>
          <h2 className="font-bold text-lg">{channel.name}</h2>
          {channel.description && (
            <p className="text-dark-400 text-sm truncate max-w-lg">
              {channel.description}
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 text-dark-400 text-sm">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {channel.memberCount}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-dark-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-800 rounded w-32" />
                  <div className="h-4 bg-dark-800 rounded w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl block mb-4">🎉</span>
              <h3 className="text-xl font-semibold text-dark-300 mb-2">
                Premier message !
              </h3>
              <p className="text-dark-500">
                Sois le premier à écrire dans #{channel.name}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const showAvatar =
              i === 0 || messages[i - 1].userId !== msg.userId;
            return (
              <div
                key={msg.id}
                className={`group flex gap-3 hover:bg-dark-900/50 rounded-lg px-3 py-1 transition-colors ${
                  showAvatar ? "mt-4" : ""
                }`}
              >
                {showAvatar ? (
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColor(
                      msg.userId
                    )} flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5`}
                  >
                    {getInitials(msg.userName)}
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">
                        {msg.userName}
                      </span>
                      <span className="text-xs text-dark-500">
                        @{msg.userUsername}
                      </span>
                      <span className="text-xs text-dark-500">
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                      {msg.isEdited && (
                        <span className="text-xs text-dark-600">(modifié)</span>
                      )}
                    </div>
                  )}
                  {editingId === msg.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEdit(msg.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEdit(msg.id)}
                        className="px-3 py-1.5 bg-primary-600 rounded-lg text-sm hover:bg-primary-500 transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-dark-700 rounded-lg text-sm hover:bg-dark-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p className="text-dark-200 text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}
                </div>
                {msg.userId === user.id && editingId !== msg.id && (
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(msg.id);
                        setEditContent(msg.content);
                      }}
                      className="p-1.5 hover:bg-dark-700 rounded text-dark-400 hover:text-white transition-colors"
                      title="Modifier"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 hover:bg-dark-700 rounded text-dark-400 hover:text-red-400 transition-colors"
                      title="Supprimer"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-dark-900 border-t border-dark-700 p-4">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Écrire dans #${channel.name}...`}
            className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/25"
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
    </div>
  );
}
