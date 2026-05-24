import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { SavedAnime } from '../types/profile';

interface UserDataContextType {
  session: Session | null;
  savedAnimes: SavedAnime[];
  getSavedStatus: (animeId: number) => string | null;
  isFavorited: (animeId: number) => boolean;
  getUserScore: (animeId: number) => number | null;
  refreshSavedAnimes: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType>({
  session: null,
  savedAnimes: [],
  getSavedStatus: () => null,
  isFavorited: () => false,
  getUserScore: () => null,
  refreshSavedAnimes: async () => {},
});

export const useUserData = () => useContext(UserDataContext);

export const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [savedAnimes, setSavedAnimes] = useState<SavedAnime[]>([]);

  const fetchSaved = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('saved_animes')
      .select('anime_id, status, is_favorite, user_score, id, title, image_url, episodes_total, score, year, genres, studios, duration, progress, created_at')
      .eq('user_id', userId);
    if (data) setSavedAnimes(data as SavedAnime[]);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchSaved(s.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) fetchSaved(s.user.id);
      else setSavedAnimes([]);
    });
    return () => subscription.unsubscribe();
  }, [fetchSaved]);

  const getSavedStatus = useCallback(
    (animeId: number) => savedAnimes.find(a => a.anime_id === animeId)?.status ?? null,
    [savedAnimes],
  );

  const isFavorited = useCallback(
    (animeId: number) => savedAnimes.find(a => a.anime_id === animeId)?.is_favorite ?? false,
    [savedAnimes],
  );

  const getUserScore = useCallback(
    (animeId: number) => savedAnimes.find(a => a.anime_id === animeId)?.user_score ?? null,
    [savedAnimes],
  );

  const refreshSavedAnimes = useCallback(async () => {
    if (session) await fetchSaved(session.user.id);
  }, [session, fetchSaved]);

  return (
    <UserDataContext.Provider value={{ session, savedAnimes, getSavedStatus, isFavorited, getUserScore, refreshSavedAnimes }}>
      {children}
    </UserDataContext.Provider>
  );
};
