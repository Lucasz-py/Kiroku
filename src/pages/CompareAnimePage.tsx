import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnimeById } from '../services/jikanApi';
import { getHighResImageUrl } from '../utils/animeUtils';
import type { AnimeFull } from '../types/anime';
import {
  Loader2, Star, Tv, Calendar, Clock, Trophy, Users,
  ArrowLeft, GitCompareArrows, X, Check,
} from 'lucide-react';

const COMPARE_KEY = 'kiroku_compare_anime';

const StatusLabel: Record<string, string> = {
  'Finished Airing':  'Finalizado',
  'Currently Airing': 'En emisión',
  'Not yet aired':    'Próximamente',
};

interface StatRowProps {
  label: string;
  v1: string | number | null | undefined;
  v2: string | number | null | undefined;
  higherIsBetter?: boolean;
  icon: React.ElementType;
}

const StatRow = ({ label, v1, v2, higherIsBetter = true, icon: Icon }: StatRowProps) => {
  const n1 = typeof v1 === 'number' ? v1 : parseFloat(String(v1 ?? ''));
  const n2 = typeof v2 === 'number' ? v2 : parseFloat(String(v2 ?? ''));
  const bothNumeric = !isNaN(n1) && !isNaN(n2) && (v1 !== null && v1 !== undefined) && (v2 !== null && v2 !== undefined);

  const winner = bothNumeric
    ? (higherIsBetter ? (n1 > n2 ? 1 : n1 < n2 ? 2 : 0) : (n1 < n2 ? 1 : n1 > n2 ? 2 : 0))
    : 0;

  const cellClass = (side: 1 | 2) =>
    `flex-1 text-center px-3 py-3 text-sm font-black tabular-nums transition-colors rounded-lg ${
      winner === side ? 'text-white bg-[#FF3B3B]/15 border border-[#FF3B3B]/30' : 'text-zinc-300 bg-[#0D0F15] border border-transparent'
    }`;

  const display = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return '—';
    return String(v);
  };

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 text-center">
        <span className={cellClass(1)}>{display(v1)}</span>
      </div>
      <div className="flex flex-col items-center shrink-0 w-28 gap-0.5">
        <Icon size={12} className="text-[#FF3B3B]/50" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center leading-tight">{label}</span>
      </div>
      <div className="flex-1 text-center">
        <span className={cellClass(2)}>{display(v2)}</span>
      </div>
    </div>
  );
};

const GenreChips = ({ genres, highlight }: { genres: string[]; highlight?: boolean }) => (
  <div className="flex flex-wrap gap-1 justify-center">
    {genres.length > 0
      ? genres.map(g => (
          <span
            key={g}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
              highlight ? 'bg-[#FF3B3B]/15 text-[#FF7777] border border-[#FF3B3B]/20' : 'bg-[#0D0F15] text-zinc-500 border border-[#FF3B3B]/10'
            }`}
          >{g}</span>
        ))
      : <span className="text-zinc-600 text-xs">—</span>}
  </div>
);

const AnimeColumn = ({ anime }: { anime: AnimeFull }) => (
  <div className="flex flex-col items-center gap-3">
    <Link to={`/anime/${anime.mal_id}`} className="group block w-full max-w-[160px]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[#FF3B3B]/20 group-hover:border-[#FF3B3B]/50 transition-colors">
        <img
          src={getHighResImageUrl(anime.images?.jpg?.large_image_url)}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/60 to-transparent" />
      </div>
    </Link>
    <div className="text-center w-full">
      <Link
        to={`/anime/${anime.mal_id}`}
        className="text-white font-black text-sm leading-tight hover:text-[#FF3B3B] transition-colors line-clamp-2"
      >
        {anime.title}
      </Link>
      {anime.title_english && anime.title_english !== anime.title && (
        <p className="text-zinc-600 text-[10px] mt-0.5 line-clamp-1">{anime.title_english}</p>
      )}
      {anime.score && (
        <div className="inline-flex items-center gap-1 mt-2 bg-[#0D0F15] border border-[#FF3B3B]/20 px-2.5 py-1 rounded-lg">
          <Star size={10} className="fill-[#FF3B3B] text-[#FF3B3B]" />
          <span className="text-white text-xs font-black tabular-nums">{anime.score}</span>
        </div>
      )}
    </div>
  </div>
);

export const CompareAnimePage = () => {
  const { id1, id2 } = useParams<{ id1: string; id2: string }>();
  const navigate = useNavigate();
  const [anime1, setAnime1] = useState<AnimeFull | null>(null);
  const [anime2, setAnime2] = useState<AnimeFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id1 || !id2) return;
      setLoading(true);
      setError(false);
      try {
        const [r1, r2] = await Promise.all([getAnimeById(id1), getAnimeById(id2)]);
        setAnime1(r1.data);
        setAnime2(r2.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id1, id2]);

  const handleClear = () => {
    localStorage.removeItem(COMPARE_KEY);
    navigate(-1);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#080A0F]">
      <Loader2 className="animate-spin text-[#FF3B3B]" size={28} />
    </div>
  );

  if (error || !anime1 || !anime2) return (
    <div className="min-h-screen bg-[#080A0F] flex flex-col items-center justify-center gap-6 px-4">
      <GitCompareArrows size={48} className="text-zinc-700" />
      <div className="text-center">
        <h1 className="text-2xl font-black text-white mb-2">Error al cargar</h1>
        <p className="text-zinc-500 text-sm">No se pudieron obtener los datos de los animes.</p>
      </div>
      <Link
        to="/search"
        className="flex items-center gap-2 px-6 py-3 bg-[#FF3B3B] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#FF6B6B] transition-colors"
      >
        <ArrowLeft size={14} /> Volver
      </Link>
    </div>
  );

  const genres1 = anime1.genres?.map(g => g.name) ?? [];
  const genres2 = anime2.genres?.map(g => g.name) ?? [];
  const studios1 = anime1.studios?.map(s => s.name) ?? [];
  const studios2 = anime2.studios?.map(s => s.name) ?? [];

  const score1Wins = (anime1.score ?? 0) >= (anime2.score ?? 0);
  const score2Wins = (anime2.score ?? 0) > (anime1.score ?? 0);

  return (
    <div className="min-h-screen bg-[#080A0F] font-sans">
      <div className="container mx-auto px-4 md:px-8 pt-32 md:pt-36 pb-24 max-w-[1100px]">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#FF3B3B] text-xs font-bold uppercase tracking-widest transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <GitCompareArrows size={32} className="text-[#FF3B3B]/60" />
              Comparar
            </h1>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#11131A] border border-[#FF3B3B]/20 hover:border-[#FF3B3B]/50 text-zinc-400 hover:text-[#FF3B3B] text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            <X size={13} /> Limpiar comparación
          </button>
        </div>

        {/* Main comparison card */}
        <div className="bg-[#11131A]/90 backdrop-blur-xl rounded-2xl border border-[#FF3B3B]/20 overflow-hidden">

          {/* Posters row */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-6 md:p-10 bg-[#0D0F15]/60 border-b border-[#FF3B3B]/15">
            <AnimeColumn anime={anime1} />
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#11131A] border border-[#FF3B3B]/30 flex items-center justify-center">
                <span className="text-[#FF3B3B] font-black text-xs">VS</span>
              </div>
            </div>
            <AnimeColumn anime={anime2} />
          </div>

          {/* Stats comparison */}
          <div className="p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
              <Trophy size={13} className="text-[#FF3B3B]/50" /> Estadísticas
            </p>

            <div className="flex flex-col gap-2">
              <StatRow label="Score MAL"   v1={anime1.score}      v2={anime2.score}      higherIsBetter icon={Star}    />
              <StatRow label="Ranking"     v1={anime1.rank}       v2={anime2.rank}       higherIsBetter={false} icon={Trophy}  />
              <StatRow label="Popularidad" v1={anime1.popularity} v2={anime2.popularity} higherIsBetter={false} icon={Users}   />
              <StatRow label="Episodios"   v1={anime1.episodes}   v2={anime2.episodes}   icon={Tv}       />
              <StatRow label="Año"         v1={anime1.year}       v2={anime2.year}       icon={Calendar} />
              <StatRow label="Tipo"        v1={anime1.type}       v2={anime2.type}       icon={Tv}       />
              <StatRow
                label="Estado"
                v1={StatusLabel[anime1.status] ?? anime1.status}
                v2={StatusLabel[anime2.status] ?? anime2.status}
                icon={Clock}
              />
            </div>
          </div>

          {/* Winner banner */}
          {(anime1.score || anime2.score) && (
            <div className={`mx-6 md:mx-8 mb-6 p-4 rounded-xl border flex items-center gap-3 ${
              score1Wins && !score2Wins
                ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30'
                : score2Wins && !score1Wins
                ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30'
                : 'bg-[#11131A] border-[#FF3B3B]/15'
            }`}>
              <Check size={16} className="text-[#FF3B3B] shrink-0" />
              <p className="text-sm text-zinc-300 font-bold">
                {score1Wins && !score2Wins
                  ? <><span className="text-white">{anime1.title}</span> tiene mejor score MAL.</>
                  : score2Wins && !score1Wins
                  ? <><span className="text-white">{anime2.title}</span> tiene mejor score MAL.</>
                  : <>Ambos tienen el mismo score.</>}
              </p>
            </div>
          )}

          {/* Genres & Studios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8 border-t border-[#FF3B3B]/10">

            {/* Genres */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Géneros</p>
              <div className="grid grid-cols-2 gap-4">
                <GenreChips genres={genres1} highlight />
                <GenreChips genres={genres2} highlight />
              </div>
            </div>

            {/* Studios */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Estudios</p>
              <div className="grid grid-cols-2 gap-4">
                <GenreChips genres={studios1} />
                <GenreChips genres={studios2} />
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8 border-t border-[#FF3B3B]/10">
            {[anime1, anime2].map(anime => (
              <div key={anime.mal_id}>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">{anime.title}</p>
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-6">
                  {anime.synopsis || 'Sin sinopsis disponible.'}
                </p>
                <Link
                  to={`/anime/${anime.mal_id}`}
                  className="inline-flex items-center gap-1.5 mt-3 text-[#FF3B3B] hover:text-[#FF6B6B] text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Ver detalles →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
