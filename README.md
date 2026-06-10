<div align="center">

# 🎮 Games Hub

**Portal game ala [CrazyGames](https://www.crazygames.com) — kumpulan game buatan sendiri, langsung main di browser.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ Tentang

Games Hub adalah portal web tempat mengumpulkan berbagai game mini dalam satu tempat. Setiap game bisa dimainkan langsung di browser tanpa perlu install. Dibangun dengan Next.js sebagai "kulit" portal, sementara tiap game tetap berupa aplikasi statis mandiri yang di-embed lewat iframe — jadi gampang menambah game baru tanpa harus menulis ulang ke React.

## 🚀 Fitur

- **Grid game responsif** dengan kartu interaktif (hover effect, badge *New*)
- **Pencarian** game secara real-time
- **Filter kategori** (Board, Strategy, Puzzle, Action, Arcade)
- **Halaman main per-game** — game terbuka embed di dalam portal
- **Arsitektur plug-and-play** — tambah game cukup drop folder + satu entry registry

## 🕹️ Daftar Game

| Game | Kategori | Mode |
|------|----------|------|
| **Quoridor** | Board · Strategy | 2 Pemain / vs AI |

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Deploy**: [Vercel](https://vercel.com)
- **Game engine**: Vanilla HTML / CSS / JavaScript (per game)

## 📦 Menjalankan Secara Lokal

```bash
# Install dependency
npm install

# Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

```bash
# Build production
npm run build && npm start
```

## 🗂️ Struktur Proyek

```
GAMES-HUB/
├── app/
│   ├── layout.tsx            # Header, branding, footer
│   ├── page.tsx              # Home: hero + browser game
│   └── game/[slug]/page.tsx  # Halaman main game (iframe)
├── components/
│   ├── GameCard.tsx          # Kartu game
│   └── GameBrowser.tsx       # Search + filter kategori
├── lib/
│   └── games.ts              # Registry metadata semua game
└── public/
    └── games/
        └── quoridor/         # Game statis mandiri (target iframe)
```

## ➕ Menambah Game Baru

1. Taruh folder game (HTML/CSS/JS statis) ke `public/games/<slug>/`
2. Tambahkan satu entry di `lib/games.ts`:

```ts
{
  slug: "nama-game",
  title: "Nama Game",
  tagline: "Deskripsi singkat untuk kartu.",
  description: "Deskripsi lengkap untuk halaman game.",
  icon: "🎲",
  categories: ["Puzzle"],
  embed: "/games/nama-game/index.html",
  isNew: true,
}
```

Game otomatis muncul di grid dan mendapat halaman `/game/<slug>` sendiri.

## 📄 Lisensi

Dirilis di bawah lisensi [MIT](LICENSE).
