"use client";

import { useState, useEffect } from "react";
import type { UserData } from "./Dashboard";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface PostData {
  id: string;
  title: string;
  content: string;
  tags: string | null;
  likesCount: number | null;
  userId: string;
  createdAt: string;
  userName: string;
  userUsername: string;
  userAvatar: string | null;
  commentCount: number;
  isLiked: boolean;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string | null;
}

export default function FeedView({ user }: { user: UserData }) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {
      console.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tags.trim() || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [data.post, ...prev]);
        setTitle("");
        setContent("");
        setTags("");
        setShowCreateForm(false);
      }
    } catch {
      console.error("Failed to create post");
    } finally {
      setCreating(false);
    }
  }

  async function handleLike(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: (p.likesCount || 0) + (p.isLiked ? -1 : 1),
            }
          : p
      )
    );

    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? post : p))
      );
    }
  }

  async function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    } catch {
      loadPosts();
    }
  }

  async function handleEdit(postId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, title: editTitle, content: editContent }
              : p
          )
        );
        setEditingPostId(null);
      }
    } catch {
      console.error("Failed to edit");
    }
  }

  async function loadComments(postId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch {
      console.error("Failed to load comments");
    }
  }

  async function handleComment(postId: string) {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, commentCount: p.commentCount + 1 }
              : p
          )
        );
        setNewComment("");
      }
    } catch {
      console.error("Failed to add comment");
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

  return (
    <div className="h-full overflow-y-auto bg-dark-950">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">📰 Fil d&apos;actualité</h1>
            <p className="text-dark-400 text-sm mt-1">
              Découvre les dernières publications de la communauté
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary-600/25"
          >
            ✍️ Publier
          </button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="bg-dark-900 rounded-2xl border border-dark-700 p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold mb-4">Nouvelle publication</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de ta publication..."
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Qu'est-ce que tu veux partager ? 💡"
                rows={5}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                required
              />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (séparés par des virgules, ex: react, javascript)"
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                >
                  {creating ? "Publication..." : "Publier"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-dark-800 hover:bg-dark-700 text-dark-300 px-6 py-2.5 rounded-xl text-sm transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-dark-900 rounded-2xl border border-dark-700 p-6 animate-pulse"
              >
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-dark-800" />
                  <div className="space-y-2">
                    <div className="h-4 bg-dark-800 rounded w-32" />
                    <div className="h-3 bg-dark-800 rounded w-24" />
                  </div>
                </div>
                <div className="h-5 bg-dark-800 rounded w-48 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-dark-800 rounded w-full" />
                  <div className="h-4 bg-dark-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">📝</span>
            <h3 className="text-xl font-semibold text-dark-300 mb-2">
              Pas encore de publications
            </h3>
            <p className="text-dark-500 mb-4">
              Sois le premier à partager quelque chose !
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm"
            >
              ✍️ Créer une publication
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-dark-900 rounded-2xl border border-dark-700 p-6 animate-fade-in hover:border-dark-600 transition-all"
              >
                {/* Post header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {getInitials(post.userName)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{post.userName}</p>
                    <p className="text-dark-400 text-xs">
                      @{post.userUsername} ·{" "}
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {post.userId === user.id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingPostId(post.id);
                          setEditTitle(post.title);
                          setEditContent(post.content);
                        }}
                        className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-red-400 transition-colors"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Post content */}
                {editingPostId === post.id ? (
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="bg-dark-800 hover:bg-dark-700 text-dark-300 px-4 py-2 rounded-xl text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                    <p className="text-dark-300 text-sm whitespace-pre-wrap leading-relaxed mb-3">
                      {post.content}
                    </p>
                  </>
                )}

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.split(",").map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary-600/15 text-primary-300 text-xs px-2.5 py-1 rounded-lg font-medium"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-dark-800">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.isLiked
                        ? "text-red-400"
                        : "text-dark-400 hover:text-red-400"
                    }`}
                  >
                    <svg
                      className="w-4.5 h-4.5"
                      fill={post.isLiked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {post.likesCount || 0}
                  </button>
                  <button
                    onClick={() => {
                      if (expandedPost === post.id) {
                        setExpandedPost(null);
                      } else {
                        setExpandedPost(post.id);
                        loadComments(post.id);
                      }
                    }}
                    className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-primary-400 transition-colors"
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
                    {post.commentCount}
                  </button>
                </div>

                {/* Comments section */}
                {expandedPost === post.id && (
                  <div className="mt-4 pt-4 border-t border-dark-800 animate-fade-in">
                    {comments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {getInitials(comment.userName)}
                            </div>
                            <div className="flex-1 bg-dark-800 rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs">
                                  {comment.userName}
                                </span>
                                <span className="text-xs text-dark-500">
                                  {formatDistanceToNow(
                                    new Date(comment.createdAt),
                                    { addSuffix: true, locale: fr }
                                  )}
                                </span>
                              </div>
                              <p className="text-dark-300 text-sm mt-0.5">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleComment(post.id);
                        }}
                        placeholder="Ajouter un commentaire..."
                        className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!newComment.trim()}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
