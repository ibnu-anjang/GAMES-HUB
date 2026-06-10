"use client";

import { useMemo, useState } from "react";
import { categories, type Category, type Game } from "@/lib/games";
import GameCard from "./GameCard";

export default function GameBrowser({ games }: { games: Game[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Category | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      const matchCategory = active === "All" || g.categories.includes(active);
      const matchQuery =
        q === "" ||
        g.title.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [games, query, active]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari game…"
          className="w-full rounded-xl border border-border bg-panel px-4 py-2.5 text-sm outline-none transition focus:border-brand sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {(["All", ...categories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active === c
                  ? "border-brand bg-brand text-white"
                  : "border-border text-ink-dim hover:border-brand hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-ink-dim">
          Nggak ada game yang cocok. Coba kata kunci lain.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
