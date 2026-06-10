export type Category =
  | "Board"
  | "Strategy"
  | "Puzzle"
  | "Action"
  | "Arcade";

export type Game = {
  slug: string;
  title: string;
  /** Short tagline shown on the card. */
  tagline: string;
  /** Longer description shown on the game page. */
  description: string;
  /** Emoji or short string used as a fallback thumbnail. */
  icon: string;
  /** Optional path to a thumbnail image under /public. */
  thumbnail?: string;
  categories: Category[];
  /** Path to the standalone game entry under /public. */
  embed: string;
  /** Flags for home-page sections. */
  isNew?: boolean;
  isPopular?: boolean;
};

export const games: Game[] = [
  {
    slug: "quoridor",
    title: "Quoridor",
    tagline: "Blok jalur lawan sebelum mereka sampai duluan.",
    description:
      "Game papan strategi klasik. Gerakkan pion ke sisi seberang sambil memasang dinding untuk menghadang lawan. Main 2 pemain lokal atau lawan AI.",
    icon: "♟️",
    categories: ["Board", "Strategy"],
    embed: "/games/quoridor/index.html",
    isNew: true,
    isPopular: true,
  },
];

export const categories: Category[] = [
  "Board",
  "Strategy",
  "Puzzle",
  "Action",
  "Arcade",
];

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}
