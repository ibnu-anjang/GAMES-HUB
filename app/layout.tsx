import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Games Hub",
  description: "Kumpulan game iseng buatan sendiri — main langsung di browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <span className="brand-gradient text-xl font-extrabold tracking-wide">
                GAMES HUB
              </span>
            </Link>
            <nav className="text-sm text-ink-dim">
              <Link href="/" className="transition hover:text-ink">
                Semua Game
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="border-t border-border py-8 text-center text-sm text-ink-dim">
          Made for fun · Games Hub
        </footer>
      </body>
    </html>
  );
}
