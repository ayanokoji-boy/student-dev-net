"use client";

import { useState, useEffect } from "react";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";

interface UserData {
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

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">🚀</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              DevLycée
            </h1>
          </div>
          <div className="flex gap-1 justify-center">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse-dot" />
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse-dot" style={{ animationDelay: "0.3s" }} />
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse-dot" style={{ animationDelay: "0.6s" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={() => setUser(null)}
      onUserUpdate={setUser}
    />
  );
}
