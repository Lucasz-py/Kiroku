import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tv, Heart, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SavedAnime } from '../../types/profile';
import { PROFILE_TABS } from '../../constants/profile';

const ITEMS_PER_PAGE = 24;

interface AnimeGridProps {
  animes: SavedAnime[];
  onRemove: (id: string) => void;
}

export const AnimeGrid = ({ animes, onRemove }: AnimeGridProps) => {
  const [activeTab, setActiveTab] = useState('Favoritos');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredAnimes = animes.filter(a => {
    if (activeTab === 'Favoritos') return a.is_favorite;
    if (activeTab === 'Todos') return true;
    return a.status === activeTab;
  });

  const totalPages = Math.ceil(filteredAnimes.length / ITEMS_PER_PAGE);
  const paginatedAnimes = filteredAnimes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="lg:col-span-8 xl:col-span-8">
      <div className="bg-[#11131A]/90 backdrop-blur-xl rounded-2xl border border-[#FF3B3B]/20 min-h-[800px] flex flex-col">
        <div className="flex overflow-x-auto border-b border-[#FF3B3B]/15 bg-[#11131A]/50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0 pt-4 px-4 rounded-t-2xl">
          {PROFILE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[130px] py-4 px-4 text-xs font-bold uppercase tracking-widest transition-colors relative flex items-center justify-center gap-2 ${activeTab === tab.id ? 'text-[#FF3B3B] bg-[#FF3B3B]/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#FF3B3B]/5'}`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? 'text-[#FF3B3B]' : 'text-zinc-600'} /> {tab.id}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF3B3B]"></div>}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          {paginatedAnimes.length === 0 ? (
            <div className="text-center py-32 flex flex-col items-center my-auto">
              <Tv size={48} className="text-zinc-700 mb-4" />
              <p className="text-zinc-600 text-sm uppercase tracking-widest">No hay animes registrados en esta sección.</p>
              <Link to="/search" className="mt-8 text-[#FF3B3B] font-bold hover:bg-[#FF3B3B]/10 bg-[#11131A] border border-[#FF3B3B]/30 hover:border-[#FF3B3B]/60 px-8 py-3 uppercase tracking-widest transition-all rounded-lg">
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 mb-8">
                {paginatedAnimes.map(anime => {
                  let dotColor = 'bg-zinc-600';
                  if (anime.status === 'Completado') dotColor = 'bg-[#FF3B3B]';
                  if (anime.status === 'Mirando') dotColor = 'bg-[#FF7777]';
                  if (anime.status === 'Pendiente') dotColor = 'bg-[#FF9B9B]';

                  return (
                    <div key={anime.id} className="group relative bg-[#11131A] overflow-hidden rounded-lg border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 transition-all duration-300">
                      <Link to={`/anime/${anime.anime_id}`} className="block relative aspect-[3/4] overflow-hidden">
                        <img src={anime.image_url} alt={anime.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#11131A] via-transparent to-transparent opacity-90"></div>
                        <div className="absolute bottom-0 left-0 w-full p-3">
                          <h4 className="text-white text-[11px] md:text-xs font-bold line-clamp-2 leading-tight mb-2">{anime.title}</h4>
                          <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                            {anime.status}
                          </span>
                        </div>
                      </Link>
                      <button onClick={() => onRemove(anime.id)} className="absolute top-2 right-2 w-8 h-8 bg-[#11131A]/80 backdrop-blur-md flex items-center justify-center text-zinc-500 hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                        <Trash2 size={14} />
                      </button>
                      {anime.is_favorite && (
                        <div className="absolute top-2 left-2 w-8 h-8 bg-[#11131A]/80 backdrop-blur-md flex items-center justify-center border border-[#FF3B3B]/15 rounded-lg">
                          <Heart size={14} className="fill-[#FF3B3B] text-[#FF7777]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-auto pt-6 border-t border-[#FF3B3B]/15 flex justify-center items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-[#11131A] border border-[#FF3B3B]/15 text-zinc-500 hover:text-[#FF3B3B] disabled:opacity-30 transition-colors rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-1 px-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center font-bold text-xs transition-all rounded-lg ${currentPage === i + 1 ? 'bg-[#FF3B3B] text-white' : 'bg-[#11131A] border border-[#FF3B3B]/15 text-zinc-500 hover:bg-[#FF3B3B]/10 hover:text-zinc-200'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-[#11131A] border border-[#FF3B3B]/15 text-zinc-500 hover:text-[#FF3B3B] disabled:opacity-30 transition-colors rounded-lg">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
