import { useEffect, useRef, useState } from 'react';
import type { Anime } from '../../types/anime';
import { AnimeCard } from '../AnimeCard';
import { getCurrentSeason } from '../../services/jikanApi';

interface SeasonalCarouselProps {
  upcoming: Anime[];
}

export const SeasonalCarousel = ({ upcoming }: SeasonalCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isHovered = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const [isDraggingUI, setIsDraggingUI] = useState(false);

  const { year, label } = getCurrentSeason();

  // Auto-scroll — pauses while hovering or dragging
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
    if (upcoming.length > 0) animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [upcoming]);

  // Window-level listeners so drag works even when cursor leaves the container
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
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeftPos.current = carouselRef.current.scrollLeft;
    e.preventDefault();
  };

  const handleMouseEnter = () => { isHovered.current = true; };
  const handleMouseLeave = () => { isHovered.current = false; };

  if (upcoming.length === 0) return null;

  return (
    <section className="estrenos-section reveal-section pt-32 pb-48 relative z-20 bg-[#11131A] -mt-[150px]">
      <div className="section-content">
        <div className="container mx-auto px-4 mb-10">
          <h2 className="text-3xl font-black text-white flex items-center gap-4">
            Estrenos de Temporada
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-[#FF3B3B]/20 bg-[#11131A] px-4 py-2 rounded-lg">
              {label} {year}
            </span>
          </h2>
        </div>
        <div className="relative w-full">
          <div
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`flex gap-6 overflow-x-auto px-6 pb-8 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none ${isDraggingUI ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {[...upcoming, ...upcoming].map((anime, index) => (
              <div
                key={`${anime.mal_id}-${index}`}
                className={`inline-block w-64 shrink-0 transition-transform duration-200 ${isDraggingUI ? 'pointer-events-none scale-[0.98] opacity-75' : ''}`}
              >
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
