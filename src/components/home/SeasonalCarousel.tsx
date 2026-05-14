import { useEffect, useRef, useState } from 'react';
import type { Anime } from '../../types/anime';
import { AnimeCard } from '../AnimeCard';

const cyberClipCard = { clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' };

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

  useEffect(() => {
    let animationId: number;
    const scrollStep = () => {
      if (carouselRef.current && !isDragging.current && !isHovered.current) {
        carouselRef.current.scrollLeft += 1;
        if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
          carouselRef.current.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scrollStep);
    };
    if (upcoming.length > 0) animationId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationId);
  }, [upcoming]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftPos.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 5) {
      if (!isDraggingUI) setIsDraggingUI(true);
      e.preventDefault();
      carouselRef.current.scrollLeft = scrollLeftPos.current - walk * 2;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setTimeout(() => setIsDraggingUI(false), 50);
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setIsDraggingUI(false);
    isHovered.current = false;
  };

  const handleMouseEnter = () => { isHovered.current = true; };

  if (upcoming.length === 0) return null;

  return (
    <section className="estrenos-section reveal-section pt-32 pb-48 relative z-20 bg-[#11131A] -mt-[150px]">
      <div className="section-content">
        <div className="container mx-auto px-4 mb-10">
          <h2 className="text-3xl font-black text-white flex items-center gap-4">
            Estrenos de Temporada
            <span
              className="bg-[#FF3B3B] text-white text-xs px-4 py-1.5 font-bold shadow-[0_0_15px_rgba(255,59,59,0.4)]"
              style={cyberClipCard}
            >
              Primavera 2026
            </span>
          </h2>
        </div>
        <div className="relative w-full">
          <div
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-6 overflow-x-auto px-6 pb-8 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all ${isDraggingUI ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {[...upcoming, ...upcoming].map((anime, index) => (
              <div
                key={`${anime.mal_id}-${index}`}
                className={`inline-block w-64 shrink-0 transition-transform duration-300 ${isDraggingUI ? 'pointer-events-none scale-[0.98] opacity-80' : ''}`}
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
