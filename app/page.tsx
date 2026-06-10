import GameBrowser from "@/components/GameBrowser";
import { games } from "@/lib/games";

export default function HomePage() {
  return (
    <div>
      <section className="mb-10 text-center">
        <h1 className="brand-gradient text-4xl font-extrabold tracking-wide sm:text-5xl">
          GAMES HUB
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-dim">
          Kumpulan game iseng buatan sendiri. Pilih satu, langsung main di
          browser — nggak perlu install.
        </p>
      </section>

      <GameBrowser games={games} />
    </div>
  );
}
