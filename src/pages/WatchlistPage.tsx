import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookmarkCheck, Eye, Clock, Heart, List, Search, Star, LayoutGrid, AlignJustify, type LucideIcon } from 'lucide-react';
import type { SavedAnime } from '../types/profile';

const TABS = [
  { id: 'Todos',      icon: List,          label: 'Todos' },
  { id: 'Completado', icon: BookmarkCheck, label: 'Completados' },
  { id: 'Mirando',    icon: Eye,           label: 'Mirando' },
  { id: 'Pendiente',  icon: Clock,         label: 'Pendientes' },
  { id: 'Favoritos',  icon: Heart,         label: 'Favoritos' },
];

const STATUS_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  Completado: { icon: BookmarkCheck, color: 'text-[#FF3B3B]' },
  Mirando:    { icon: Eye,           color: 'text-[#FF7777]' },
  Pendiente:  { icon: Clock,         color: 'text-[#FF9B9B]' },
};

const WatchlistSkeleton = () => (
  <div className="min-h-screen bg-[#080A0F] pt-28 md:pt-32 pb-24 font-sans">
    <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
      <div className="mb-10">
        <div className="h-2.5 w-20 bg-[#11131A] rounded-full animate-pulse mb-3" />
        <div className="h-10 w-48 bg-[#11131A] rounded-xl animate-pulse" />
      </div>
      <div className="flex gap-2 mb-8 overflow-hidden">
        {[...Array(5)].map((_, i) => <div key={i} className="h-9 w-28 shrink-0 bg-[#11131A] rounded-xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-[#11131A] rounded-xl overflow-hidden border border-[#FF3B3B]/10 animate-pulse">
            <div className="aspect-[3/4] bg-[#0D0F15]" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-[#0D0F15] rounded w-4/5" />
              <div className="h-2.5 bg-[#0D0F15] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Empty state ilustrado (#15)
const WatchlistEmpty = () => (
  <div className="col-span-full flex flex-col items-center py-24 gap-4 text-center">
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-20">
      <rect x="14" y="8" width="42" height="64" rx="6" stroke="#FF3B3B" strokeWidth="2.5" />
      <line x1="24" y1="24" x2="46" y2="24" stroke="#FF3B3B" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="34" x2="46" y2="34" stroke="#FF3B3B" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="44" x2="38" y2="44" stroke="#FF3B3B" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <p className="text-zinc-300 text-xl font-black">Lista vacía</p>
    <p className="text-zinc-600 text-sm">Agrega animes desde su página de detalles para verlos aquí.</p>
    <Link to="/search" className="mt-2 flex items-center gap-2 px-6 py-3 bg-[#FF3B3B] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#FF6B6B] transition-colors">
      <Search size={14} /> Explorar
    </Link>
  </div>
);

export const WatchlistPage = () => {
  const [animes, setAnimes] = useState<SavedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchQ, setSearchQ] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); return; }
      const { data } = await supabase
        .from('saved_animes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) setAnimes(data as SavedAnime[]);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const filtered = useMemo(() => {
    let list = animes;
    if (activeTab === 'Favoritos') list = list.filter(a => a.is_favorite);
    else if (activeTab !== 'Todos') list = list.filter(a => a.status === activeTab);
    if (searchQ.trim()) list = list.filter(a => a.title.toLowerCase().includes(searchQ.toLowerCase()));
    return list;
  }, [animes, activeTab, searchQ]);

  const counts = useMemo(() => ({
    Todos:      animes.length,
    Completado: animes.filter(a => a.status === 'Completado').length,
    Mirando:    animes.filter(a => a.status === 'Mirando').length,
    Pendiente:  animes.filter(a => a.status === 'Pendiente').length,
    Favoritos:  animes.filter(a => a.is_favorite).length,
  }), [animes]);

  if (loading) return <WatchlistSkeleton />;

  return (
    <div className="min-h-screen bg-[#080A0F] pt-28 md:pt-32 pb-24 font-sans">
      <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
            <List size={15} className="text-[#FF3B3B]/50" /> Mi Colección
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
            Watchlist
          </h1>
        </div>

        {/* Tabs + search + toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#FF3B3B] text-white border-[#FF3B3B]'
                    : 'bg-[#11131A] text-zinc-500 border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 hover:text-zinc-300'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
                <span className={`text-[11px] tabular-nums ${activeTab === tab.id ? 'text-white/70' : 'text-zinc-600'}`}>
                  {counts[tab.id as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          <div className="sm:ml-auto flex gap-2">
            <input
              type="text"
              placeholder="Filtrar por nombre..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="flex-1 sm:w-56 px-4 py-2 bg-[#11131A] border border-[#FF3B3B]/15 focus:border-[#FF3B3B] focus:outline-none text-white text-xs font-bold rounded-xl placeholder:text-zinc-600 transition-all"
            />
            <button
              onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
              title={viewMode === 'grid' ? 'Vista lista' : 'Vista grid'}
              className="px-3 py-2 bg-[#11131A] border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 text-zinc-500 hover:text-zinc-200 rounded-xl transition-all shrink-0"
            >
              {viewMode === 'grid' ? <AlignJustify size={16} /> : <LayoutGrid size={16} />}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <WatchlistEmpty />
          </div>
        ) : viewMode === 'list' ? (
          /* ── Vista lista ── */
          <div className="flex flex-col gap-2">
            {filtered.map(anime => {
              const cfg = STATUS_ICON[anime.status];
              const Icon = cfg?.icon ?? Clock;
              const color = cfg?.color ?? 'text-zinc-500';
              return (
                <Link
                  key={anime.id}
                  to={`/anime/${anime.anime_id}`}
                  className="group flex items-center gap-4 p-3 bg-[#11131A] border border-[#FF3B3B]/10 hover:border-[#FF3B3B]/30 rounded-xl transition-all"
                >
                  <div className="w-11 h-16 shrink-0 overflow-hidden rounded-lg bg-[#0D0F15]">
                    <img src={anime.image_url} alt={anime.title} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-bold truncate group-hover:text-[#FF3B3B] transition-colors mb-1">{anime.title}</h4>
                    <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide ${color}`}>
                      <Icon size={11} />{anime.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {anime.is_favorite && <Heart size={13} className="fill-[#FF3B3B] text-[#FF3B3B]" />}
                    {anime.user_score && (
                      <div className="flex items-center gap-0.5 bg-[#0D0F15] border border-[#FF3B3B]/20 px-2 py-1 rounded-lg">
                        <Star size={11} className="fill-[#FF3B3B] text-[#FF3B3B]" />
                        <span className="text-white text-xs font-black">{anime.user_score}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── Vista grid ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {filtered.map(anime => (
              <Link
                key={anime.id}
                to={`/anime/${anime.anime_id}`}
                className="group relative bg-[#11131A] overflow-hidden rounded-xl border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 transition-all duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={anime.image_url}
                    alt={anime.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11131A] via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 w-full p-3">
                    <h4 className="text-white text-xs font-bold line-clamp-2 leading-tight mb-1.5 group-hover:text-[#FF3B3B] transition-colors">
                      {anime.title}
                    </h4>
                    {(() => {
                      const cfg = STATUS_ICON[anime.status];
                      const Icon = cfg?.icon ?? Clock;
                      const color = cfg?.color ?? 'text-zinc-500';
                      return (
                        <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${color}`}>
                          <Icon size={11} />
                          {anime.status}
                        </span>
                      );
                    })()}
                  </div>
                  {anime.is_favorite && (
                    <div className="absolute top-2 left-2 w-7 h-7 bg-[#11131A]/80 backdrop-blur-sm flex items-center justify-center border border-[#FF3B3B]/15 rounded-lg">
                      <Heart size={12} className="fill-[#FF3B3B] text-[#FF7777]" />
                    </div>
                  )}
                  {anime.user_score && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#0D0F15]/90 backdrop-blur-sm border border-[#FF3B3B]/20 px-1.5 py-1 rounded-md">
                      <Star size={11} className="fill-[#FF3B3B] text-[#FF3B3B]" />
                      <span className="text-white text-xs font-black">{anime.user_score}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
