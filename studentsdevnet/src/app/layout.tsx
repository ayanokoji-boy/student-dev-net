import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLycée — Réseau des Lycéens Développeurs",
  description:
    "La communauté mondiale des lycéens passionnés de développement. Discutez, partagez, et apprenez ensemble.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-dark-950 text-white antialiased">{children}</body>
    </html>
  );
}
