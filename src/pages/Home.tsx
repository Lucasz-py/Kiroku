import { useEffect, useRef, useState } from 'react';
import { getUpcomingAnimes, getTopAnimes } from '../services/jikanApi';
import type { Anime } from '../types/anime';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { HeroSection } from '../components/home/HeroSection';
import { SeasonalCarousel } from '../components/home/SeasonalCarousel';
import { RankingsSection } from '../components/home/RankingsSection';

gsap.registerPlugin(ScrollTrigger);

// ── Persistencia de datos ─────────────────────────────────────────────────────
// Dos niveles:
//   1. memCache   → navegación dentro de la misma sesión (instantáneo)
//   2. localStorage → persiste entre recargas (F5) con TTL de 10 minutos

interface HomeData {
  upcoming:   Anime[];
  topRated:   Anime[];
  topPopular: Anime[];
  savedAt:    number;
}

const CACHE_KEY = 'kiroku_home_v2';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

const readStorage = (): HomeData | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as HomeData;
    return Date.now() - d.savedAt < CACHE_TTL ? d : null;
  } catch { return null; }
};

const writeStorage = (d: HomeData) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch { }
};

// Inicializar memCache desde localStorage al cargar el módulo
let memCache: HomeData | null = readStorage();

// ── Componente ────────────────────────────────────────────────────────────────
export const Home = () => {
  // Estado inicializado desde cache → datos disponibles en el primer render
  const [upcoming,   setUpcoming]   = useState<Anime[]>(memCache?.upcoming   ?? []);
  const [topRated,   setTopRated]   = useState<Anime[]>(memCache?.topRated   ?? []);
  const [topPopular, setTopPopular] = useState<Anime[]>(memCache?.topPopular ?? []);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cache fresco → no hay nada que hacer
    if (memCache && Date.now() - memCache.savedAt < CACHE_TTL) return;

    let cancelled = false;
    const wait = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

    const fetchWithRetry = async <T,>(
      fn: () => Promise<{ data: T[] }>,
      maxRetries = 4,
      baseMs = 600,
    ): Promise<T[]> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (cancelled) return [];
        try {
          const res = await fn();
          if (res.data?.length > 0) return res.data;
        } catch { /* reintentar */ }
        if (attempt < maxRetries) await wait(baseMs * Math.pow(1.8, attempt));
      }
      return [];
    };

    const fetchHomeData = async () => {
      const [upcomingRaw, topRatedData, topPopularData] = await Promise.all([
        fetchWithRetry(getUpcomingAnimes),
        fetchWithRetry(() => getTopAnimes(10)),
        fetchWithRetry(() => getTopAnimes(10, 'bypopularity')),
      ]);
      if (cancelled) return;

      const seen = new Set<number>();
      const upcomingData = upcomingRaw.filter(a => seen.has(a.mal_id) ? false : (seen.add(a.mal_id), true));

      setUpcoming(upcomingData);
      setTopRated(topRatedData);
      setTopPopular(topPopularData);

      // Guardar en ambos niveles de cache si todo cargó
      if (upcomingData.length && topRatedData.length && topPopularData.length) {
        const entry: HomeData = {
          upcoming: upcomingData, topRated: topRatedData,
          topPopular: topPopularData, savedAt: Date.now(),
        };
        memCache = entry;
        writeStorage(entry);
      }
    };

    fetchHomeData();
    return () => { cancelled = true; };
  }, []);

  // ── Animaciones GSAP ────────────────────────────────────────────────────────
  // Sin guard de datos: los elementos del DOM siempre están presentes
  // (con skeletons o con tarjetas reales). Las animaciones funcionan en ambos casos.
  // ScrollTrigger.refresh() re-calcula posiciones cuando el layout cambia.
  useGSAP(() => {
    ['.estrenos-section', '.rankings-section'].forEach((sel) => {
      gsap.fromTo(sel,
        { borderTopLeftRadius: '50% 120px', borderTopRightRadius: '50% 120px', y: 100 },
        {
          borderTopLeftRadius: '0% 0px', borderTopRightRadius: '0% 0px', y: 0,
          ease: 'none',
          scrollTrigger: { trigger: sel, start: 'top 95%', end: 'top 10%', scrub: 1 },
        }
      );
    });

    gsap.fromTo('.seasonal-label',
      { x: -28, opacity: 0 },
      { x: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.estrenos-section', start: 'top 80%', end: 'top 42%', scrub: 0.8 } }
    );
    gsap.fromTo('.seasonal-title',
      { x: -36, opacity: 0 },
      { x: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.estrenos-section', start: 'top 75%', end: 'top 38%', scrub: 0.8 } }
    );
    gsap.fromTo('.seasonal-carousel',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.estrenos-section', start: 'top 70%', end: 'top 25%', scrub: 1 } }
    );
    gsap.fromTo('.ranking-card-left',
      { x: -55, opacity: 0, filter: 'blur(5px)' },
      { x: 0, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', scrollTrigger: { trigger: '.rankings-section', start: 'top 90%', end: 'top 52%', scrub: 0.9 } }
    );
    gsap.fromTo('.ranking-card-right',
      { x: 55, opacity: 0, filter: 'blur(5px)' },
      { x: 0, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', scrollTrigger: { trigger: '.rankings-section', start: 'top 90%', end: 'top 52%', scrub: 0.9 } }
    );
    gsap.fromTo('.ranking-label',
      { y: -14, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: '.rankings-section', start: 'top 85%', end: 'top 58%', scrub: 0.8 } }
    );
    gsap.fromTo('.ranking-title',
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: '.rankings-section', start: 'top 82%', end: 'top 55%', scrub: 0.8 } }
    );

    // Re-calcular posiciones si el layout cambia (skeletons → tarjetas reales)
    ScrollTrigger.refresh();

  }, { scope: mainRef, dependencies: [upcoming, topRated, topPopular] });

  return (
    <div ref={mainRef} className="block font-sans bg-[#0D0F15] overflow-hidden relative w-full">
      <HeroSection />
      <SeasonalCarousel upcoming={upcoming} />
      <RankingsSection topRated={topRated} topPopular={topPopular} />
    </div>
  );
};
