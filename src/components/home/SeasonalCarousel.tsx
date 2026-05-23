import { useEffect, useRef, useState } from 'react';
import { Tv, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Anime } from '../../types/anime';
import { AnimeCard } from '../AnimeCard';
import { getCurrentSeason } from '../../services/jikanApi';

interface SeasonalCarouselProps {
  upcoming: Anime[];
}

const SkeletonAnimeCard = () => (
  <div className="w-56 shrink-0">
    <div className="aspect-[3/4] bg-[#1A1C24] rounded-xl animate-pulse border border-[#FF3B3B]/[0.05]" />
    <div className="pt-3 flex flex-col gap-2">
      <div className="h-3.5 bg-[#1A1C24] rounded animate-pulse w-4/5" />
      <div className="h-2.5 bg-[#1A1C24] rounded animate-pulse w-2/5" />
    </div>
  </div>
);

export const SeasonalCarousel = ({ upcoming }: SeasonalCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isHovered = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const [isDraggingUI, setIsDraggingUI] = useState(false);

  const { year, label } = getCurrentSeason();
  const isLoading = upcoming.length === 0;

  useEffect(() => {
    let animId: number;
    const step = () => {
      const el = carouselRef.current;
      if (el && !isDragging.current && !isHovered.current) {
        el.scrollLeft += 1;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      animId = requestAnimationFrame(step);
    };
    if (!isLoading) animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [upcoming, isLoading]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !carouselRef.current) return;
      const walk = (e.clientX - startX.current) * 1.5;
      carouselRef.current.scrollLeft = scrollLeftPos.current - walk;
      if (Math.abs(walk) > 4) setIsDraggingUI(true);
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setTimeout(() => setIsDraggingUI(false), 50);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current || isLoading) return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeftPos.current = carouselRef.current.scrollLeft;
    e.preventDefault();
  };

  const handleMouseEnter = () => { isHovered.current = true; };
  const handleMouseLeave = () => { isHovered.current = false; };

  return (
    <section className="estrenos-section reveal-section relative z-20 bg-[#11131A] -mt-[120px] pt-[160px] pb-40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/15 to-transparent" />

      {/* Glow ambiente — conecta visualmente con el hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 z-0"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(255,59,59,0.055) 0%, transparent 70%)' }}
      />

      <div className="section-content">
        <div className="container mx-auto px-4 md:px-8 max-w-[1400px] mb-8">
          <p className="seasonal-label text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2 leading-none">
            <Tv size={15} className="text-[#FF3B3B]/50 shrink-0" /> Esta temporada
          </p>
          <div className="seasonal-title flex items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
                Estrenos
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 border border-[#FF3B3B]/20 bg-[#11131A] px-3 py-1.5 rounded-lg mb-0.5">
                {label} {year}
              </span>
            </div>
            <Link
              to="/seasonal"
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[#FF3B3B] transition-colors duration-200 mb-0.5 shrink-0"
            >
              Ver todo <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        <div className="seasonal-carousel relative w-full">
          <div
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`flex gap-5 overflow-x-auto px-6 md:px-8 pb-6 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none ${!isLoading && isDraggingUI ? 'cursor-grabbing' : !isLoading ? 'cursor-grab' : ''}`}
          >
            {isLoading
              ? [...Array(8)].map((_, i) => <SkeletonAnimeCard key={i} />)
              : [...upcoming, ...upcoming].map((anime, index) => (
                  <div
                    key={`${anime.mal_id}-${index}`}
                    className={`inline-block w-56 shrink-0 transition-transform duration-200 ${isDraggingUI ? 'pointer-events-none scale-[0.98] opacity-75' : ''}`}
                  >
                    <AnimeCard anime={anime} />
                  </div>
                ))
            }
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#11131A] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#11131A] to-transparent" />
        </div>
      </div>
    </section>
  );
};
