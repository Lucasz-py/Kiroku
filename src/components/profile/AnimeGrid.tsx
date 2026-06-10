import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ChevronLeft, ChevronRight, Search, Star, BookmarkCheck, Eye, Clock } from 'lucide-react';
import type { SavedAnime } from '../../types/profile';
import { PROFILE_TABS } from '../../constants/profile';

const ITEMS_PER_PAGE = 28;

interface AnimeGridProps {
  animes: SavedAnime[];
  onRemove?: (id: string) => void;
}

// Empty state ilustrado (#15)
const EmptyGridState = ({ tab }: { tab: string }) => (
  <div className="text-center py-24 flex flex-col items-center gap-4 my-auto">
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="opacity-25">
      <rect x="8" y="8" width="56" height="56" rx="8" stroke="#FF3B3B" strokeWidth="2.5" strokeDasharray="6 4" />
      <path d="M26 36h20M36 26v20" stroke="#FF3B3B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
    <p className="text-zinc-400 text-base font-black">
      {tab === 'Favoritos' ? 'Sin favoritos aún' :
       tab === 'Todos' ? 'Lista vacía' :
       tab === 'Completado' ? 'Sin animes completados' :
       tab === 'Mirando' ? 'No estás mirando nada' :
       'Sin pendientes'}
    </p>
    <p className="text-zinc-600 text-sm">
      {tab === 'Favoritos'
        ? 'Marca un anime con ♥ para agregarlo aquí.'
        : 'Agrega animes desde la página de detalles.'}
    </p>
    <Link
      to="/search"
      className="mt-2 text-[#FF3B3B] font-bold hover:bg-[#FF3B3B]/10 bg-[#11131A] border border-[#FF3B3B]/30 hover:border-[#FF3B3B]/60 px-8 py-3 uppercase tracking-widest transition-all rounded-lg text-xs flex items-center gap-2"
    >
      <Search size={13} /> Explorar Catálogo
    </Link>
  </div>
);

export const AnimeGrid = ({ animes, onRemove }: AnimeGridProps) => {
  const [activeTab, setActiveTab] = useState('Favoritos');
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const filteredAnimes = animes.filter(a => {
    if (activeTab === 'Favoritos') return a.is_favorite;
    if (activeTab === 'Todos') return true;
    return a.status === activeTab;
  });

  const totalPages = Math.ceil(filteredAnimes.length / ITEMS_PER_PAGE);
  const effectivePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const paginatedAnimes = filteredAnimes.slice((effectivePage - 1) * ITEMS_PER_PAGE, effectivePage * ITEMS_PER_PAGE);

  return (
    <div className="lg:col-span-8 xl:col-span-8">
      <div className="bg-[#11131A]/90 backdrop-blur-xl rounded-2xl border border-[#FF3B3B]/20 min-h-[800px] flex flex-col">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-[#FF3B3B]/15 bg-[#11131A]/50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0 pt-4 px-4 rounded-t-2xl">
          {PROFILE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[130px] py-4 px-4 text-[13px] font-bold uppercase tracking-widest transition-colors relative flex items-center justify-center gap-2 ${activeTab === tab.id ? 'text-[#FF3B3B] bg-[#FF3B3B]/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#FF3B3B]/5'}`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? 'text-[#FF3B3B]' : 'text-zinc-600'} />
              {tab.id}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF3B3B]" />}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col">
          {paginatedAnimes.length === 0 ? (
            <EmptyGridState tab={activeTab} />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 mb-8">
                {paginatedAnimes.map(anime => {
                  const statusCfgs: Record<string, { icon: typeof Eye; color: string }> = {
                    Completado: { icon: BookmarkCheck, color: 'text-[#FF3B3B]' },
                    Mirando:    { icon: Eye,           color: 'text-[#FF7777]' },
                    Pendiente:  { icon: Clock,         color: 'text-[#FF9B9B]' },
                  };
                  const sCfg = statusCfgs[anime.status] ?? { icon: Clock, color: 'text-zinc-500' };
                  const StatusIcon = sCfg.icon;

                  return (
                    <div key={anime.id} className="group relative bg-[#11131A] overflow-hidden rounded-lg border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 transition-all duration-300">
                      <Link to={`/anime/${anime.anime_id}`} className="block relative aspect-[3/4] overflow-hidden">
                        <img
                          src={anime.image_url}
                          alt={anime.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#11131A] via-transparent to-transparent opacity-90" />
                        <div className="absolute bottom-0 left-0 w-full p-3">
                          <h4 className="text-white text-xs md:text-sm font-bold line-clamp-2 leading-tight mb-2">{anime.title}</h4>
                          <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${sCfg.color}`}>
                            <StatusIcon size={11} />
                            {anime.status}
                          </span>
                        </div>
                      </Link>

                      {onRemove && (
                        <button
                          onClick={() => onRemove(anime.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-[#11131A]/80 backdrop-blur-md flex items-center justify-center text-zinc-500 hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {anime.is_favorite && (
                        <div className="absolute top-2 left-2 w-8 h-8 bg-[#11131A]/80 backdrop-blur-md flex items-center justify-center border border-[#FF3B3B]/15 rounded-lg">
                          <Heart size={14} className="fill-[#FF3B3B] text-[#FF7777]" />
                        </div>
                      )}

                      {/* Puntuación del usuario (#2) */}
                      {anime.user_score && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-[#0D0F15]/90 backdrop-blur-sm border border-[#FF3B3B]/20 px-1.5 py-1 rounded-md">
                          <Star size={11} className="fill-[#FF3B3B] text-[#FF3B3B]" />
                          <span className="text-white text-xs font-black tabular-nums">{anime.user_score}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-auto pt-6 border-t border-[#FF3B3B]/15 flex justify-center items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={effectivePage === 1} className="p-2 bg-[#11131A] border border-[#FF3B3B]/15 text-zinc-500 hover:text-[#FF3B3B] disabled:opacity-30 transition-colors rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-1 px-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center font-bold text-xs transition-all rounded-lg ${effectivePage === i + 1 ? 'bg-[#FF3B3B] text-white' : 'bg-[#11131A] border border-[#FF3B3B]/15 text-zinc-500 hover:bg-[#FF3B3B]/10 hover:text-zinc-200'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={effectivePage === totalPages} className="p-2 bg-[#11131A] border border-[#FF3B3B]/15 text-zinc-500 hover:text-[#FF3B3B] disabled:opacity-30 transition-colors rounded-lg">
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
