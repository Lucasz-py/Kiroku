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

export const Home = () => {
  const [upcoming, setUpcoming] = useState<Anime[]>([]);
  const [topRated, setTopRated] = useState<Anime[]>([]);
  const [topPopular, setTopPopular] = useState<Anime[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [upcomingRes, topRatedRes, topPopularRes] = await Promise.all([
          getUpcomingAnimes(),
          getTopAnimes(10),
          getTopAnimes(10, 'bypopularity'),
        ]);
        setUpcoming(upcomingRes.data);
        setTopRated(topRatedRes.data);
        setTopPopular(topPopularRes.data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    fetchHomeData();
  }, []);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('.reveal-section');
      sections.forEach((section) => {
        const content = section.querySelector('.section-content');
        if (content) {
          gsap.fromTo(
            content,
            { y: 80, opacity: 0, filter: 'blur(15px)' },
            {
              y: 0, opacity: 1, filter: 'blur(0px)',
              scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 40%', scrub: 1 },
              ease: 'power2.out',
            }
          );
        }
      });

      ['.estrenos-section', '.rankings-section'].forEach((selector) => {
        gsap.fromTo(
          selector,
          { borderTopLeftRadius: '50% 150px', borderTopRightRadius: '50% 150px', y: 150 },
          {
            borderTopLeftRadius: '0% 0px', borderTopRightRadius: '0% 0px', y: 0,
            scrollTrigger: { trigger: selector, start: 'top 95%', end: 'top 10%', scrub: 1 },
          }
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, [upcoming, topRated, topPopular]);

  return (
    <div ref={mainRef} className="block font-sans bg-[#0D0F15] overflow-hidden relative w-full">
      <HeroSection />
      <SeasonalCarousel upcoming={upcoming} />
      <RankingsSection topRated={topRated} topPopular={topPopular} />
    </div>
  );
};
