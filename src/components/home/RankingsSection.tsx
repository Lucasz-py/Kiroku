import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import type { Anime } from '../../types/anime';
import { RankingRow } from './RankingRow';

interface RankingsSectionProps {
  topRated: Anime[];
  topPopular: Anime[];
}

export const RankingsSection = ({ topRated, topPopular }: RankingsSectionProps) => (
  <section className="rankings-section pt-32 pb-32 px-4 relative z-30 bg-[#0D0F15] -mt-[120px]">
    <div className="container mx-auto max-w-[1400px]">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-12 border-b border-[#FF3B3B]/20 pb-6 flex items-center gap-3">
            Top 10 Series
            <span className="text-[#FF3B3B] drop-shadow-[0_0_8px_rgba(255,59,59,0.6)]">★</span>
          </h2>
          <div className="flex flex-col gap-4">
            {topRated.map((anime, index) => (
              <RankingRow key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              to="/top/rated"
              className="px-8 py-3 rounded-xl border border-[#FF3B3B]/30 bg-[#11131A] text-zinc-300 font-bold uppercase tracking-widest text-xs hover:bg-[#FF3B3B] hover:text-white hover:border-[#FF3B3B] hover:shadow-[0_0_20px_rgba(255,59,59,0.3)] transition-all"
            >
              Explorar Ranking Completo
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-12 border-b border-[#FF3B3B]/20 pb-6 flex items-center gap-3">
            Más Populares
            <Flame size={22} className="text-[#FF3B3B] drop-shadow-[0_0_8px_rgba(255,59,59,0.6)]" />
          </h2>
          <div className="flex flex-col gap-4">
            {topPopular.map((anime, index) => (
              <RankingRow key={anime.mal_id} anime={anime} index={index} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              to="/top/popular"
              className="px-8 py-3 rounded-xl border border-[#FF3B3B]/30 bg-[#11131A] text-zinc-300 font-bold uppercase tracking-widest text-xs hover:bg-[#FF3B3B] hover:text-white hover:border-[#FF3B3B] hover:shadow-[0_0_20px_rgba(255,59,59,0.3)] transition-all"
            >
              Explorar Ranking Completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);
