import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { advancedSearchAnime, getRandomAnime, getRecommendedAnimes, type AdvancedSearchFilters } from '../services/jikanApi';
import type { Anime } from '../types/anime';
import { AnimeCard } from '../components/AnimeCard';
import debounce from 'lodash.debounce';
import { Dices, RefreshCw, Loader2, FilterX, Filter, X, Plus, Search as SearchIcon, Star } from 'lucide-react';

const ANIME_TYPES = [ { value: 'tv', label: 'TV (Serie)' }, { value: 'movie', label: 'Película (Cine)' }, { value: 'ova', label: 'OVA (Físico)' }, { value: 'special', label: 'Especial' }, { value: 'ona', label: 'ONA (Web / Netflix)' } ];
const ANIME_STATUS = [ { value: 'airing', label: 'En Emisión' }, { value: 'complete', label: 'Finalizado' }, { value: 'upcoming', label: 'Por Estrenar' } ];
const SEASONS = [ { value: 'winter', label: '❄️ Invierno (Ene-Mar)' }, { value: 'spring', label: '🌸 Primavera (Abr-Jun)' }, { value: 'summer', label: '☀️ Verano (Jul-Sep)' }, { value: 'fall', label: '🍂 Otoño (Oct-Dic)' } ];
const TOP_STUDIOS = [ { value: '2', label: 'Kyoto Animation' }, { value: '4', label: 'Bones' }, { value: '10', label: 'Production I.G' }, { value: '11', label: 'Madhouse' }, { value: '14', label: 'Sunrise' }, { value: '43', label: 'ufotable' }, { value: '56', label: 'A-1 Pictures' }, { value: '569', label: 'MAPPA' }, { value: '858', label: 'Wit Studio' }, { value: '1835', label: 'CloverWorks' } ];
const GENRES = [ { id: 1, name: 'Acción' }, { id: 2, name: 'Aventura' }, { id: 4, name: 'Comedia' }, { id: 8, name: 'Drama' }, { id: 10, name: 'Fantasía' }, { id: 14, name: 'Terror' }, { id: 7, name: 'Misterio' }, { id: 22, name: 'Romance' }, { id: 24, name: 'Sci-Fi' }, { id: 36, name: 'Slice of Life' }, { id: 30, name: 'Deportes' }, { id: 37, name: 'Sobrenatural' }, { id: 41, name: 'Suspenso' }, { id: 62, name: 'Isekai' }, { id: 9, name: 'Ecchi' } ];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: currentYear - 1970 + 2}, (_, i) => currentYear + 1 - i);

interface Option { value: string; label: string }
interface CustomDropdownProps { label: string; value: string; options: Option[]; onChange: (val: string) => void; disabled?: boolean; placeholder?: string; }

const CustomDropdown = ({ label, value, options, onChange, disabled = false, placeholder }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
      <label className={`text-xs font-bold text-zinc-500 uppercase tracking-widest ${disabled ? 'opacity-50' : ''}`}>{label}</label>
      <button type="button" disabled={disabled} onClick={() => setIsOpen(!isOpen)} className={`w-full bg-[#0D0F15] text-white border border-[#FF3B3B]/10 p-3.5 flex justify-between items-center transition-colors text-sm font-bold rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#FF3B3B]/40'}`}>
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`text-zinc-500 transition-transform duration-300 text-xs ${isOpen ? 'rotate-180 text-[#FF3B3B]' : ''}`}>▼</span>
      </button>
      {isOpen && !disabled && (
        <div className="absolute top-[75px] left-0 w-full bg-[#0D0F15] border border-[#FF3B3B]/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-50 max-h-60 overflow-y-auto rounded-lg">
          <button type="button" onClick={() => { onChange(''); setIsOpen(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors hover:bg-[#11131A] border-b border-[#FF3B3B]/[0.07] ${value === '' ? 'text-[#FF3B3B] bg-[#11131A]/80' : 'text-zinc-400'}`}>{placeholder}</button>
          {options.map((opt) => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors hover:bg-[#11131A] border-b border-[#FF3B3B]/[0.07] last:border-0 ${value === opt.value ? 'text-[#FF3B3B] bg-[#11131A]/80' : 'text-zinc-400'}`}>{opt.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<Anime[]>([]);
  const [instantResults, setInstantResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [randomAnime, setRandomAnime] = useState<Anime | null>(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [query, setQuery] = useState('');

  const [localFilters, setLocalFilters] = useState({
    type: '', status: '', year: '', season: '', studioId: '', studioName: '', genres: [] as string[]
  });

  useEffect(() => { handleLoadRecommendations(); }, []);

  const handleLoadRecommendations = async () => {
    setLoadingRecs(true);
    try { const response = await getRecommendedAnimes(); setRecommendations(response.data); }
    catch (error) { console.error(error); } finally { setLoadingRecs(false); }
  };

  const handlePickRandomAnime = async () => {
    setLoadingRandom(true); setRandomAnime(null);
    try { const response = await getRandomAnime(); setRandomAnime(response.data); }
    catch (error) { console.error(error); } finally { setLoadingRandom(false); }
  };

  const debouncedFetchInstantResults = useMemo(() =>
    debounce(async (searchTerm: string) => {
      if (searchTerm.trim()) {
        try { const response = await advancedSearchAnime({ q: searchTerm, limit: 5 }); setInstantResults(response.data); }
        catch (error) { console.error(error); }
      } else { setInstantResults([]); }
    }, 300), []);

  useEffect(() => { return () => debouncedFetchInstantResults.cancel(); }, [debouncedFetchInstantResults]);

  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    setQuery(qParam);
    setLocalFilters({
      type: searchParams.get('type') || '', status: searchParams.get('status') || '', year: searchParams.get('year') || '',
      season: searchParams.get('season') || '', studioId: searchParams.get('studioId') || '', studioName: searchParams.get('studioName') || '',
      genres: searchParams.get('genres') ? searchParams.get('genres')!.split(',') : []
    });
    if (Array.from(searchParams.keys()).length > 0) executeAdvancedSearch(searchParams, 1);
    else { setResults([]); setHasNextPage(false); }
  }, [searchParams]);

  const executeAdvancedSearch = async (params: URLSearchParams, pageNumber: number = 1) => {
    if (pageNumber === 1) { setLoading(true); setInstantResults([]); } else setLoadingMore(true);
    try {
      const apiFilters: AdvancedSearchFilters = { page: pageNumber };
      if (params.get('q')) apiFilters.q = params.get('q')!;
      if (params.get('type')) apiFilters.type = params.get('type')!;
      if (params.get('status')) apiFilters.status = params.get('status')!;
      if (params.get('genres')) apiFilters.genres = params.get('genres')!;
      if (params.get('studioId')) apiFilters.producers = params.get('studioId')!;

      let targetYear = params.get('year');
      if (params.get('season') && !targetYear) targetYear = currentYear.toString();

      if (targetYear) {
        if (params.get('season') === 'winter') { apiFilters.start_date = `${targetYear}-01-01`; apiFilters.end_date = `${targetYear}-03-31`; }
        else if (params.get('season') === 'spring') { apiFilters.start_date = `${targetYear}-04-01`; apiFilters.end_date = `${targetYear}-06-30`; }
        else if (params.get('season') === 'summer') { apiFilters.start_date = `${targetYear}-07-01`; apiFilters.end_date = `${targetYear}-09-30`; }
        else if (params.get('season') === 'fall') { apiFilters.start_date = `${targetYear}-10-01`; apiFilters.end_date = `${targetYear}-12-31`; }
        else { apiFilters.start_date = `${targetYear}-01-01`; apiFilters.end_date = `${targetYear}-12-31`; }
      }
      const response = await advancedSearchAnime(apiFilters);
      if (pageNumber === 1) setResults(response.data);
      else setResults(prev => {
          const existingIds = new Set(prev.map(a => a.mal_id));
          return [...prev, ...response.data.filter((a: Anime) => !existingIds.has(a.mal_id))];
      });
      setHasNextPage(response.pagination?.has_next_page || false); setPage(pageNumber);
    } catch (error) { console.error(error); } finally { setLoading(false); setLoadingMore(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); debouncedFetchInstantResults(e.target.value);
  };

  const toggleGenre = (id: number) => {
    setLocalFilters(p => ({ ...p, genres: p.genres.includes(id.toString()) ? p.genres.filter(g => g !== id.toString()) : [...p.genres, id.toString()] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setInstantResults([]);
    const newParams = new URLSearchParams();
    if (query.trim()) newParams.set('q', query);
    if (localFilters.type) newParams.set('type', localFilters.type);
    if (localFilters.status) newParams.set('status', localFilters.status);
    if (localFilters.year) newParams.set('year', localFilters.year);
    if (localFilters.season) newParams.set('season', localFilters.season);
    if (localFilters.studioId) newParams.set('studioId', localFilters.studioId);
    if (localFilters.studioName) newParams.set('studioName', localFilters.studioName);
    if (localFilters.genres.length > 0) newParams.set('genres', localFilters.genres.join(','));
    setSearchParams(newParams); setShowFilters(false);
  };

  const clearFilters = () => {
    setQuery(''); setLocalFilters({ type: '', status: '', year: '', season: '', studioId: '', studioName: '', genres: [] });
    setSearchParams({}); setPage(1); setHasNextPage(false);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).length > 0;
  const isDiscoverMode = !hasActiveFilters && results.length === 0 && !loading;

  const getActiveFilterTags = () => {
    const tags = [];
    if (searchParams.get('q')) tags.push(`"${searchParams.get('q')}"`);
    if (searchParams.get('type')) tags.push(ANIME_TYPES.find(t => t.value === searchParams.get('type'))?.label || searchParams.get('type')!);
    if (searchParams.get('status')) tags.push(ANIME_STATUS.find(s => s.value === searchParams.get('status'))?.label || searchParams.get('status')!);
    if (searchParams.get('year')) tags.push(`${searchParams.get('year')}`);
    if (searchParams.get('season')) tags.push((SEASONS.find(s => s.value === searchParams.get('season'))?.label || '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').trim());
    if (searchParams.get('studioName')) tags.push(searchParams.get('studioName')!);
    if (searchParams.get('genres')) {
      searchParams.get('genres')!.split(',').forEach(id => {
        const genre = GENRES.find(g => g.id.toString() === id);
        if (genre) tags.push(genre.name);
      });
    }
    return tags.filter(Boolean);
  };
  const activeTags = getActiveFilterTags();

  return (
    <div className="min-h-screen bg-[#080A0F] font-sans pt-28 md:pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">

        {/* ── Search bar + filters ── */}
        <div className={`max-w-4xl mx-auto transition-all duration-500 ${isDiscoverMode ? 'mt-4 mb-16' : 'mb-8'}`}>
          {isDiscoverMode && (
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center justify-center gap-2">
                <SearchIcon size={13} className="text-[#FF3B3B]/50" /> Catálogo
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Encuentra tu próximo anime
              </h1>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative z-20">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text" value={query} onChange={handleInputChange}
                placeholder="Buscar animes, peliculas..."
                className="flex-1 p-4 pl-6 text-white bg-[#11131A] border border-[#FF3B3B]/15 focus:border-[#FF3B3B] focus:outline-none focus:ring-1 focus:ring-[#FF3B3B]/30 transition-all font-bold text-sm rounded-xl placeholder:text-zinc-600"
              />
              <div className="flex gap-2 shrink-0">
                <button type="button" title="Filtros Avanzados" onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 font-bold transition-all border flex items-center justify-center rounded-xl ${showFilters ? 'bg-[#FF3B3B]/15 border-[#FF3B3B]/60 text-[#FF3B3B]' : 'bg-[#11131A] border-[#FF3B3B]/10 text-zinc-500 hover:text-white hover:border-[#FF3B3B]/30'}`}>
                  <Filter size={18} />
                </button>
                <button type="submit" className="bg-[#FF3B3B] text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-[#FF5555] transition-colors text-sm rounded-xl">
                  Buscar
                </button>
              </div>
            </div>

            {/* Instant results */}
            {instantResults.length > 0 && !showFilters && (
              <div className="absolute top-full left-0 w-full sm:w-[calc(100%-170px)] bg-[#11131A] mt-2 border border-[#FF3B3B]/20 shadow-[0_8px_30px_rgba(0,0,0,0.6)] z-50 overflow-hidden rounded-xl">
                {instantResults.map((anime) => (
                  <Link key={anime.mal_id} to={`/anime/${anime.mal_id}`} className="flex items-center gap-4 p-3 border-b border-[#FF3B3B]/[0.07] hover:bg-[#1A1C24] transition-colors last:border-0">
                    <div className="w-10 h-14 bg-[#0D0F15] shrink-0 overflow-hidden rounded-lg">
                      <img src={anime.images.jpg.image_url} alt={anime.title} className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{anime.title}</p>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{anime.episodes ? `${anime.episodes} eps` : 'En emisión'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Filter panel */}
            {showFilters && (
              <div className="mt-3 bg-[#11131A] border border-[#FF3B3B]/20 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)] animate-in fade-in rounded-xl relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/20 to-transparent rounded-t-xl" />
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#FF3B3B]/10">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Filter size={13} className="text-[#FF3B3B]/50" /> Filtros de Búsqueda
                  </p>
                  <button type="button" onClick={() => setShowFilters(false)} className="text-zinc-500 hover:text-white transition-colors bg-[#0D0F15] p-2 border border-[#FF3B3B]/10 hover:border-[#FF3B3B]/30 rounded-lg">
                    <X size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <CustomDropdown label="Formato" placeholder="Cualquier Formato" value={localFilters.type} options={ANIME_TYPES} onChange={(v) => setLocalFilters({...localFilters, type: v})} />
                  <CustomDropdown label="Estado" placeholder="Cualquier Estado" value={localFilters.status} options={ANIME_STATUS} onChange={(v) => setLocalFilters({...localFilters, status: v})} />
                  <CustomDropdown label="Año" placeholder="Cualquier Año" value={localFilters.year} options={YEARS.map(y=>({value: y.toString(), label: y.toString()}))} onChange={(v) => setLocalFilters({...localFilters, year: v})} />
                  <CustomDropdown label="Temporada" placeholder="Cualquier Temporada" value={localFilters.season} options={SEASONS} onChange={(v) => setLocalFilters({...localFilters, season: v})} />
                </div>

                <div className="mb-8">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-3">Géneros</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <button key={genre.id} type="button" onClick={() => toggleGenre(genre.id)}
                        className={`px-3 py-1.5 text-xs font-bold transition-all border rounded-lg ${localFilters.genres.includes(genre.id.toString()) ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/60 text-[#FF3B3B]' : 'bg-[#0D0F15] border-[#FF3B3B]/[0.07] text-zinc-500 hover:border-[#FF3B3B]/30 hover:text-white'}`}>
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-3">Estudios</label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setLocalFilters({...localFilters, studioId: '', studioName: ''})}
                      className={`px-3 py-1.5 border text-xs font-bold transition-colors rounded-lg ${!localFilters.studioId ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/60 text-[#FF3B3B]' : 'bg-[#0D0F15] border-[#FF3B3B]/[0.07] text-zinc-500 hover:text-white hover:border-[#FF3B3B]/30'}`}>
                      Todos
                    </button>
                    {TOP_STUDIOS.map(studio => (
                      <button key={studio.value} type="button" onClick={() => setLocalFilters({...localFilters, studioId: studio.value, studioName: studio.label})}
                        className={`px-3 py-1.5 border text-xs font-bold transition-colors rounded-lg ${localFilters.studioId === studio.value ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/60 text-[#FF3B3B]' : 'bg-[#0D0F15] border-[#FF3B3B]/[0.07] text-zinc-500 hover:bg-[#11131A] hover:text-white hover:border-[#FF3B3B]/30'}`}>
                        {studio.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Active filter tags */}
          {!isDiscoverMode && activeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Filtros:</span>
              {activeTags.map((tag, idx) => (
                <span key={idx} className="bg-[#FF3B3B]/8 text-[#FF3B3B] border border-[#FF3B3B]/20 text-[10px] font-bold px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
              <button onClick={clearFilters} className="text-[10px] font-bold text-zinc-600 hover:text-[#FF3B3B] uppercase tracking-widest transition-colors flex items-center gap-1 ml-1">
                <X size={11} /> Limpiar
              </button>
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-[#FF3B3B]" size={28} />
          </div>
        )}

        {/* ── Results ── */}
        {!loading && results.length > 0 && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-[#FF3B3B]/10 gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Búsqueda</p>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  Resultados
                  <span className="text-sm font-bold text-zinc-500 border border-[#FF3B3B]/10 bg-[#11131A] px-3 py-1 rounded-lg">{results.length}</span>
                </h2>
              </div>
              <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2.5 bg-[#11131A] border border-[#FF3B3B]/10 text-zinc-500 hover:text-[#FF3B3B] hover:border-[#FF3B3B]/30 transition-all text-xs font-bold uppercase tracking-widest rounded-xl">
                <FilterX size={13} /> Limpiar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {results.map((anime) => <AnimeCard key={anime.mal_id} anime={anime} />)}
            </div>

            {hasNextPage && (
              <div className="flex justify-center mt-12">
                <button onClick={() => executeAdvancedSearch(searchParams, page + 1)} disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 border border-[#FF3B3B]/20 bg-[#11131A] text-zinc-400 font-bold uppercase tracking-widest text-[11px] hover:bg-[#FF3B3B] hover:text-white hover:border-[#FF3B3B] transition-all disabled:opacity-40 rounded-xl">
                  {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Cargando...</> : <><Plus size={14} /> Cargar más</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Sin resultados ── */}
        {!loading && results.length === 0 && hasActiveFilters && (
          <div className="text-center py-20 bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl">
            <FilterX size={40} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-300 text-lg font-black mb-2">Sin resultados</p>
            <p className="text-zinc-600 text-sm mb-6">Ajusta los filtros para ampliar la búsqueda.</p>
            <button onClick={clearFilters} className="px-6 py-2.5 border border-[#FF3B3B]/20 bg-[#0D0F15] text-zinc-400 font-bold uppercase tracking-widest text-[11px] hover:bg-[#FF3B3B] hover:text-white hover:border-[#FF3B3B] transition-all rounded-xl">
              Reiniciar Filtros
            </button>
          </div>
        )}

        {/* ── Discover mode ── */}
        {isDiscoverMode && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-700">

            {/* Random anime */}
            <div className="bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/20 to-transparent" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xs text-center md:text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center justify-center md:justify-start gap-2">
                    <Dices size={13} className="text-[#FF3B3B]/50" /> Descubrimiento
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">¿No sabes qué ver?</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    Deja que el destino elija tu próxima aventura. Nuestra base de datos elegirá una serie o película al azar para ti.
                  </p>
                  <button onClick={handlePickRandomAnime} disabled={loadingRandom}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-[#FF3B3B] text-white font-black tracking-widest text-xs uppercase hover:bg-[#FF5555] transition-colors disabled:opacity-60 rounded-xl">
                    {loadingRandom ? <Loader2 size={16} className="animate-spin" /> : <Dices size={16} />}
                    {loadingRandom ? 'Calculando...' : 'Generar al Azar'}
                  </button>
                </div>
                                      
                {/* Contenedor fijo — mismo tamaño con o sin tarjeta */}
                <div className="w-52 md:w-60 shrink-0">
                  {randomAnime ? (
                    <AnimeCard anime={randomAnime} />
                  ) : (
                    <div>
                      <div className="aspect-[3/4] bg-[#0D0F15] border border-[#FF3B3B]/10 rounded-xl flex flex-col items-center justify-center gap-3 text-zinc-700">
                        <Dices size={36} className="opacity-40" />
                        <span className="text-xs font-bold uppercase tracking-widest">Esperando</span>
                      </div>
                      {/* Reserva el espacio del texto de AnimeCard */}
                      <div className="pt-3 flex flex-col gap-2">
                        <div className="h-3.5 bg-[#0D0F15] rounded w-4/5" />
                        <div className="h-2.5 bg-[#0D0F15] rounded w-2/5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6 md:p-8 relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/20 to-transparent" />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                    <Star size={13} className="text-[#FF3B3B]/50" /> Selección
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Recomendados</h2>
                </div>
                <button onClick={handleLoadRecommendations} disabled={loadingRecs}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[#FF3B3B]/10 bg-[#0D0F15] text-zinc-500 hover:text-[#FF3B3B] hover:border-[#FF3B3B]/30 transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 rounded-xl">
                  <RefreshCw size={13} className={loadingRecs ? 'animate-spin' : ''} /> Actualizar
                </button>
              </div>
              {loadingRecs ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i}>
                      <div className="aspect-[3/4] bg-[#0D0F15] border border-[#FF3B3B]/[0.07] animate-pulse rounded-xl" />
                      <div className="pt-3 flex flex-col gap-2">
                        <div className="h-3.5 bg-[#0D0F15] rounded animate-pulse w-4/5" />
                        <div className="h-2.5 bg-[#0D0F15] rounded animate-pulse w-2/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in">
                  {recommendations.map((anime) => <AnimeCard key={anime.mal_id} anime={anime} />)}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
