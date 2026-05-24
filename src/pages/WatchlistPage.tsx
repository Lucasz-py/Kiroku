import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, BookmarkCheck, Eye, Clock, Heart, List, Search, Star, type LucideIcon } from 'lucide-react';
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

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#080A0F]">
      <Loader2 className="animate-spin text-[#FF3B3B]" size={28} />
    </div>
  );

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

        {/* Tabs + search */}
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

          <div className="sm:ml-auto">
            <input
              type="text"
              placeholder="Filtrar por nombre..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-[#11131A] border border-[#FF3B3B]/15 focus:border-[#FF3B3B] focus:outline-none text-white text-xs font-bold rounded-xl placeholder:text-zinc-600 transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {filtered.length === 0
            ? <WatchlistEmpty />
            : filtered.map(anime => (
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
              ))
          }
        </div>
      </div>
    </div>
  );
};
