import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { games, getGame } from "@/lib/games";
import GamePlayer from "@/components/GamePlayer";

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Game tidak ditemukan" };
  return { title: `${game.title} · Games Hub`, description: game.description };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-dim transition hover:text-ink"
      >
        ← Kembali ke semua game
      </Link>

      <GamePlayer src={game.embed} title={game.title} />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{game.title}</h1>
          <p className="mt-2 max-w-2xl text-ink-dim">{game.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {game.categories.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-ink-dim"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
