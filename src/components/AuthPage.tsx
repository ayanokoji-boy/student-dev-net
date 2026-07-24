"use client";

import { useState } from "react";

interface UserData {
  id: string;
  username: string;
  displayName: string;
  email: string;
}

export default function AuthPage({
  onAuth,
}: {
  onAuth: (user: UserData) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, username, displayName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      onAuth(data.user);
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("alice@lycee-dev.fr");
    setPassword("password123");
    setMode("login");
  }

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-900 via-dark-900 to-accent-700 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">{"{"}</div>
          <div className="absolute top-32 right-20 text-6xl opacity-50">
            {"</>"}
          </div>
          <div className="absolute bottom-20 left-20 text-7xl opacity-30">
            {"()"}
          </div>
          <div className="absolute bottom-40 right-10 text-9xl opacity-20">
            {"}"}
          </div>
          <div className="absolute top-1/2 left-1/3 text-5xl opacity-40">
            {"//"}
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-6xl">🚀</span>
            <h1 className="text-5xl font-black bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
              DevLycée
            </h1>
          </div>
          <p className="text-2xl text-primary-100 font-medium mb-6">
            Le réseau mondial des lycéens développeurs
          </p>
          <p className="text-primary-200/80 text-lg leading-relaxed mb-10">
            Rejoins des milliers de lycéens passionnés de code à travers le
            monde. Discute, partage tes projets, et apprends avec la
            communauté.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: "💬", text: "Chat en temps réel" },
              { emoji: "🌍", text: "Réseau mondial" },
              { emoji: "🚀", text: "Partage de projets" },
              { emoji: "🤝", text: "Entraide & collab" },
            ].map((f) => (
              <div
                key={f.text}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <span className="text-2xl">{f.emoji}</span>
                <p className="text-sm mt-2 text-white/90 font-medium">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-4xl">🚀</span>
              <h1 className="text-3xl font-black bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                DevLycée
              </h1>
            </div>
            <p className="text-dark-400 text-sm">
              Le réseau mondial des lycéens développeurs
            </p>
          </div>

          <div className="bg-dark-900 rounded-2xl border border-dark-700 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">
              {mode === "login" ? "Connexion" : "Créer un compte"}
            </h2>
            <p className="text-dark-400 mb-6">
              {mode === "login"
                ? "Content de te revoir ! 👋"
                : "Rejoins la communauté ! 🎉"}
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Nom d&apos;utilisateur
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="mon_pseudo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                      Nom affiché
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Prénom Nom"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Chargement...
                  </span>
                ) : mode === "login" ? (
                  "Se connecter"
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
              >
                {mode === "login"
                  ? "Pas encore de compte ? Inscris-toi"
                  : "Déjà un compte ? Connecte-toi"}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700">
              <button
                onClick={fillDemo}
                className="w-full bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white text-sm py-2.5 rounded-xl transition-all border border-dark-600"
              >
                🎮 Essayer avec un compte démo
              </button>
              <p className="text-xs text-dark-500 text-center mt-2">
                alice@lycee-dev.fr / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
