import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopAnimes } from '../services/jikanApi';
import type { Anime } from '../types/anime';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { RankingRow } from '../components/home/RankingRow';

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

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#11131A]">
      <Loader2 className="animate-spin text-[#FF3B3B]" size={50} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0F15] pt-32 pb-20 px-4 font-sans">
      <div className="container mx-auto max-w-[900px]">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#FF3B3B] mb-12 transition-colors uppercase text-[10px] font-bold tracking-widest px-4 py-2.5 border border-zinc-800 hover:border-[#FF3B3B]/30 bg-[#11131A] rounded-lg"
        >
          <ArrowLeft size={14} /> Volver
        </Link>

        <div className="mb-16 pb-8 border-b border-zinc-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Top 100</p>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            {title} <span className="text-[#FF3B3B]">{isPopular ? '🔥' : '★'}</span>
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          {animes?.map((anime, index) => (
            <RankingRow key={`${anime.mal_id}-${index}`} anime={anime} index={index} />
          ))}
        </div>

        {animes.length < 100 && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-3 px-8 py-4 bg-[#11131A] border border-zinc-700 hover:border-[#FF3B3B] text-zinc-300 hover:text-[#FF3B3B] font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 rounded-lg"
            >
              {loadingMore
                ? <><Loader2 size={18} className="animate-spin text-[#FF3B3B]" /> Cargando...</>
                : <>Cargar más registros <Plus size={16} className="text-[#FF3B3B]" /></>
              }
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
