import { Search, UserCircle, LogOut } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchAnime } from '../services/jikanApi';
import type { Anime } from '../types/anime';
import debounce from 'lodash.debounce';
import { LoginModal } from './LoginModal';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
}

export const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [instantResults, setInstantResults] = useState<Anime[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data as UserProfile);
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if(session) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session) fetchProfile(session.user.id); else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const debouncedFetchResults = useMemo(
    () => debounce(async (query: string) => {
        if (query.trim()) {
          try {
            const response = await searchAnime(query, 3);
            setInstantResults(response.data);
          } catch (error) { console.error(error); }
        } else setInstantResults([]);
      }, 300), []
  );

  useEffect(() => { return () => debouncedFetchResults.cancel(); }, [debouncedFetchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchResults(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setInstantResults([]);
      navigate(`/search?q=${searchTerm}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setInstantResults([]);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[1200px] flex items-center justify-between px-6 py-4 bg-[#11131A]/90 backdrop-blur-xl border border-[#FF3B3B]/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] font-sans rounded-2xl">
        <Link to="/" className="flex items-center gap-3 text-2xl font-black tracking-widest hover:opacity-80 transition-opacity" onClick={() => setInstantResults([])}>
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span>KIROKU<span className="text-[#FF3B3B]">.</span></span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6 relative hidden md:block" ref={dropdownRef}>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Buscar animes, películas..."
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full py-2.5 pl-5 pr-12 text-white bg-[#11131A]/80 border border-[#FF3B3B]/20 focus:border-[#FF3B3B] focus:outline-none focus:ring-1 focus:ring-[#FF3B3B]/50 transition-all placeholder:text-zinc-600 text-xs font-bold tracking-widest rounded-lg"
            />
            <button type="submit" className="absolute right-4 text-zinc-500 hover:text-[#FF3B3B] transition-colors">
              <Search size={16} />
            </button>
          </div>

          {instantResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-[#11131A] border border-[#FF3B3B]/30 mt-4 shadow-[0_0_30px_rgba(255,59,59,0.1)] max-h-72 overflow-y-auto z-10 p-2 custom-scrollbar rounded-lg">
              {instantResults.map((anime) => (
                <Link key={anime.mal_id} to={`/anime/${anime.mal_id}`} onClick={() => setInstantResults([])} className="flex items-center gap-3 p-2 hover:bg-[#1A1C24] border border-transparent hover:border-[#FF3B3B]/20 transition-colors rounded-lg">
                  <div className="w-10 h-14 bg-[#1A1C24] shrink-0 overflow-hidden rounded">
                    <img src={anime.images.jpg.image_url} alt={anime.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate tracking-wide">{anime.title}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{anime.episodes ? `${anime.episodes} eps` : 'En emisión'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </form>

        {session ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-3 bg-[#11131A]/80 px-4 py-2 border border-[#FF3B3B]/20 hover:border-[#FF3B3B]/50 hover:shadow-[0_0_15px_rgba(255,59,59,0.15)] transition-all cursor-pointer group rounded-lg">
              <div className="w-7 h-7 overflow-hidden flex items-center justify-center font-black text-white text-[10px] uppercase bg-[#FF3B3B] rounded-md">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : (profile?.username?.charAt(0) || session.user.email?.charAt(0))}
              </div>
              <span className="hidden sm:inline text-[10px] font-bold tracking-widest uppercase text-zinc-400 group-hover:text-[#FF3B3B] transition-colors">
                {profile?.username || 'Usuario'}
              </span>
            </Link>

            <button onClick={handleLogout} title="Cerrar sesión" className="text-zinc-500 hover:text-[#FF3B3B] transition-colors p-2 bg-[#11131A]/80 border border-[#FF3B3B]/20 hover:border-[#FF3B3B]/50 rounded-lg">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsLoginOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#11131A]/80 border border-[#FF3B3B]/20 text-zinc-400 hover:text-[#FF3B3B] hover:border-[#FF3B3B]/50 transition-colors rounded-lg">
            <UserCircle size={18} />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Mi Cuenta</span>
          </button>
        )}
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};