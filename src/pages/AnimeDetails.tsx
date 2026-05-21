import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getAnimeById, getAnimeCharacters, getAnimeStreaming } from '../services/jikanApi';
import { getHighResImageUrl } from '../utils/animeUtils';
import type { AnimeFull, Character } from '../types/anime';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { AnimeHeroPanel } from '../components/animeDetails/AnimeHeroPanel';
import { RelatedContentSection } from '../components/animeDetails/RelatedContentSection';
import { StreamingSection } from '../components/animeDetails/StreamingSection';
import { TrailerSection } from '../components/animeDetails/TrailerSection';
import { CharactersGrid } from '../components/animeDetails/CharactersGrid';

export const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeFull | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [streaming, setStreaming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState<Session | null>(null);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [relatedImages, setRelatedImages] = useState<Record<number, string | null>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  const getAvailableStatuses = () => {
    if (!anime) return [];
    if (anime.status === 'Currently Airing') return ['Mirando', 'Pendiente'];
    if (anime.status === 'Not yet aired') return ['Pendiente'];
    return ['Completado', 'Mirando', 'Pendiente'];
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const [animeRes, charsRes, streamingRes] = await Promise.all([
          getAnimeById(id),
          getAnimeCharacters(id),
          getAnimeStreaming(id),
        ]);
        setAnime(animeRes.data);
        const byFav = (a: Character, b: Character) => (b.favorites ?? 0) - (a.favorites ?? 0);
        const mains = charsRes.data.filter(c => c.role === 'Main').sort(byFav);
        const supporting = charsRes.data.filter(c => c.role === 'Supporting').sort(byFav).slice(0, 15);
        setCharacters([...mains, ...supporting]);
        setStreaming(streamingRes.data || []);

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession) {
          const { data: savedData } = await supabase
            .from('saved_animes')
            .select('status, is_favorite, progress')
            .eq('user_id', currentSession.user.id)
            .eq('anime_id', animeRes.data.mal_id)
            .maybeSingle();
          if (savedData) {
            setSavedStatus(savedData.status);
            setIsFavorite(savedData.is_favorite);
            setProgress(savedData.progress || 0);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Queue related-entry image fetches one at a time to respect Jikan's rate limit
  useEffect(() => {
    if (!anime?.relations) return;
    const entries = anime.relations
      .filter(rel => rel.relation.toLowerCase() !== 'adaptation')
      .flatMap(rel => rel.entry)
      .filter(e => e.type === 'anime' || e.type === 'manga');
    if (entries.length === 0) return;
    let cancelled = false;
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    const run = async () => {
      for (const entry of entries) {
        if (cancelled) break;
        try {
          let res = await fetch(`https://api.jikan.moe/v4/${entry.type}/${entry.mal_id}`);
          if (res.status === 429) {
            await delay(1500);
            if (cancelled) break;
            res = await fetch(`https://api.jikan.moe/v4/${entry.type}/${entry.mal_id}`);
          }
          if (res.ok) {
            const data = await res.json();
            const url = getHighResImageUrl(
              data.data?.images?.jpg?.large_image_url || data.data?.images?.jpg?.image_url
            );
            if (!cancelled) setRelatedImages(prev => ({ ...prev, [entry.mal_id]: url || null }));
          } else {
            if (!cancelled) setRelatedImages(prev => ({ ...prev, [entry.mal_id]: null }));
          }
        } catch {
          if (!cancelled) setRelatedImages(prev => ({ ...prev, [entry.mal_id]: null }));
        }
        await delay(350);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [anime]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setPendingStatus(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveAnime = async (newStatus: string, episodesWatched = 0) => {
    if (!session || !anime) return;
    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from('saved_animes')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('anime_id', anime.mal_id)
        .maybeSingle();
      const payload = {
        status: newStatus,
        progress: episodesWatched,
        user_id: session.user.id,
        anime_id: anime.mal_id,
        title: anime.title,
        image_url: anime.images.jpg.image_url,
        episodes_total: anime.episodes,
        score: anime.score,
        is_favorite: isFavorite,
        genres: anime.genres?.map(g => g.name) || [],
        studios: anime.studios?.map(s => s.name) || [],
        duration: anime.duration || null,
      };
      if (existing) {
        await supabase.from('saved_animes').update({ status: newStatus, progress: episodesWatched }).eq('id', existing.id);
      } else {
        await supabase.from('saved_animes').insert(payload);
      }
      setSavedStatus(newStatus);
      setProgress(episodesWatched);
      setPendingStatus(null);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session || !anime || !savedStatus) return;
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    await supabase.from('saved_animes').update({ is_favorite: newFavoriteState }).eq('user_id', session.user.id).eq('anime_id', anime.mal_id);
  };

  const handleRemoveAnime = async () => {
    if (!session || !anime) return;
    setIsSaving(true);
    await supabase.from('saved_animes').delete().eq('user_id', session.user.id).eq('anime_id', anime.mal_id);
    setSavedStatus(null);
    setIsFavorite(false);
    setIsSaving(false);
    setIsDropdownOpen(false);
  };

  const handleStatusSelect = (status: string) => {
    if (status === 'Mirando') setPendingStatus('Mirando');
    else if (status === 'Completado') handleSaveAnime('Completado', anime?.episodes || 0);
    else handleSaveAnime(status, 0);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#0D0F15]">
      <Loader2 size={28} className="animate-spin text-[#FF3B3B]" />
    </div>
  );

  if (!anime) return (
    <div className="flex justify-center items-center h-screen bg-[#0D0F15] text-zinc-400 font-bold uppercase tracking-widest">
      Registro no encontrado.
    </div>
  );

  const filteredRelations = anime.relations?.filter(rel => rel.relation.toLowerCase() !== 'adaptation') || [];
  const filteredStreaming = streaming.filter(s =>
    s.name.toLowerCase().includes('netflix') || s.name.toLowerCase().includes('crunchyroll')
  );
  const displayYear = anime.year || (anime.aired?.from ? anime.aired.from.substring(0, 4) : 'TBA');

  return (
    <div className="relative min-h-screen bg-[#0D0F15] font-sans overflow-hidden">
      <div className="relative z-10 container mx-auto p-4 md:p-8 pt-32 md:pt-36 max-w-[1350px]">
        <AnimeHeroPanel
          anime={anime}
          displayYear={displayYear}
          savedStatus={savedStatus}
          isFavorite={isFavorite}
          isSaving={isSaving}
          isDropdownOpen={isDropdownOpen}
          pendingStatus={pendingStatus}
          progress={progress}
          availableStatuses={getAvailableStatuses()}
          dropdownRef={dropdownRef}
          onToggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
          onToggleFavorite={handleToggleFavorite}
          onStatusSelect={handleStatusSelect}
          onSaveWithProgress={handleSaveAnime}
          onRemove={handleRemoveAnime}
          onPendingStatus={setPendingStatus}
          onProgressChange={setProgress}
          onProgressDecrement={() => handleSaveAnime('Mirando', Math.max(0, progress - 1))}
          onProgressIncrement={() => {
            const newProg = progress + 1;
            if (anime.episodes && newProg >= anime.episodes) handleSaveAnime('Completado', anime.episodes);
            else handleSaveAnime('Mirando', newProg);
          }}
        />

        <RelatedContentSection relations={filteredRelations} imageMap={relatedImages} />
        <StreamingSection streaming={filteredStreaming} />
        <TrailerSection trailer={anime.trailer} title={anime.title} />
        <CharactersGrid characters={characters} />
      </div>
    </div>
  );
};
