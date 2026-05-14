# Kiroku Agent Instructions

## Commands
- `npm run dev`: Starts Vite dev server.
- `npm run build`: Typechecks (`tsc -b`) and builds the project.
- `npm run lint`: Runs ESLint on the project.

## Tech Stack & Architecture
- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS 4 (using `@tailwindcss/vite` plugin). Config in `tailwind.config.js`.
- **Animations**: GSAP with `ScrollTrigger` and `@gsap/react`.
- **Backend/DB**: Supabase (Client in `src/lib/supabase.ts`).
- **External API**: Jikan API (V4) for anime data (Services in `src/services/jikanApi.ts`).
- **Routing**: `react-router-dom` v7.

## Key Directories
- `src/components/`: Reusable UI parts.
- `src/pages/`: Main route components (`Home`, `Search`, `AnimeDetails`, etc.).
- `src/services/`: API interaction logic (mostly Jikan).
- `src/ui/`: Complex UI/Visual components (e.g., `AnimeScrollCanvas`).
- `public/sequence/`: Image sequences for scroll animations (WebP frames).

## Critical Context
- **Environment Variables**: Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
- **Scrolling**: `src/App.tsx` contains a `ScrollToTop` component that triggers on route changes (except for `/`).
- **Canvas Animations**: `AnimeScrollCanvas.tsx` handles frame-by-frame scroll animations using GSAP and canvas. Images are preloaded from `public/sequence/`.
- **API Filtering**: `jikanApi.ts` includes custom logic to filter for "quality" (score > 7) in random/recommended fetches.
- **Type Safety**: Global anime types are defined in `src/types/anime.ts`.

## Verification Flow
1. `npm run lint` (ESLint)
2. `npm run build` (Typecheck + Vite build)
