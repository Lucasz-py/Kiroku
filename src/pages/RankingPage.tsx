import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopAnimes } from '../services/jikanApi';
import type { Anime } from '../types/anime';
import { Flame, Star, Plus, Loader2 } from 'lucide-react';
import { RankingRow } from '../components/home/RankingRow';

const SkeletonRow = () => (
  <div className="flex bg-[#0D0F15] rounded-xl border border-[#FF3B3B]/[0.07] overflow-hidden animate-pulse">
    <div className="w-14 bg-[#1A1C24] shrink-0" />
    <div className="w-24 md:w-28 h-32 md:h-36 bg-[#1A1C24] shrink-0" />
    <div className="p-4 md:p-5 flex flex-col justify-center flex-1 gap-3">
      <div className="h-4 bg-[#1A1C24] rounded-lg w-3/4" />
      <div className="flex gap-2">
        <div className="h-3 bg-[#1A1C24] rounded-lg w-16" />
        <div className="h-3 bg-[#1A1C24] rounded-lg w-16" />
      </div>
      <div className="h-3 bg-[#1A1C24] rounded-lg w-28" />
    </div>
  </div>
);

export const RankingPage = () => {
  const { filter } = useParams();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isPopular = filter === 'popular';
  const jikanFilter = isPopular ? 'bypopularity' : '';
  const title = isPopular ? 'Más Populares' : 'Mejor Valoradas';

  const fetchRankings = useCallback(async (page: number, append: boolean = false) => {
    if (page === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await getTopAnimes(25, jikanFilter, page);
      const newAnimes = res?.data || [];
      setAnimes(prev => append ? [...prev, ...newAnimes] : newAnimes);
    } catch (error) { console.error(error); setAnimes([]); } finally { setLoading(false); setLoadingMore(false); }
  }, [jikanFilter]);

  useEffect(() => { setCurrentPage(1); fetchRankings(1, false); window.scrollTo(0, 0); }, [filter, jikanFilter, fetchRankings]);

  const handleLoadMore = () => { const nextPage = currentPage + 1; setCurrentPage(nextPage); fetchRankings(nextPage, true); };

  return (
    <div className="min-h-screen bg-[#080A0F] pt-28 md:pt-32 pb-24 px-4 font-sans">
      <div className="container mx-auto max-w-[860px]">

        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
            {isPopular
              ? <Flame size={15} className="text-[#FF3B3B]/50" />
              : <Star size={15} className="text-[#FF3B3B]/50" />
            }
            {isPopular ? 'Tendencias' : 'Mejor puntuados'}
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            {title}
          </h1>
        </div>

        <div className="bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-4 md:p-6 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/20 to-transparent rounded-t-2xl" />

          <div className="flex flex-col gap-3">
            {loading
              ? [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
              : animes.map((anime, index) => (
                  <RankingRow key={`${anime.mal_id}-${index}`} anime={anime} index={index} />
                ))
            }
          </div>

          {!loading && animes.length < 100 && animes.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#FF3B3B]/10 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 border border-[#FF3B3B]/20 bg-[#0D0F15] text-zinc-400 font-bold uppercase tracking-widest text-[11px] hover:bg-[#FF3B3B] hover:text-white hover:border-[#FF3B3B] transition-all disabled:opacity-40 rounded-xl"
              >
                {loadingMore
                  ? <><Loader2 size={14} className="animate-spin" /> Cargando...</>
                  : <><Plus size={14} /> Cargar más</>
                }
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
