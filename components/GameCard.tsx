import Link from "next/link";
import type { Game } from "@/lib/games";

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/game/${game.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-panel transition hover:-translate-y-1 hover:border-brand"
    >
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-brand/20 to-brand-2/20 text-6xl">
        {game.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.thumbnail}
            alt={game.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{game.icon}</span>
        )}
        {game.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            New
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold">{game.title}</h3>
        <p className="mt-1 flex-1 text-sm text-ink-dim">{game.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {game.categories.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-ink-dim"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
