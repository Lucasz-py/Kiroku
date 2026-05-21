import { Link } from 'react-router-dom';
import type { Anime } from '../types/anime';
import { Calendar } from 'lucide-react';
import { getHighResImageUrl } from '../utils/animeUtils';

interface AnimeCardProps {
  anime: Anime;
}

const TYPE_LABELS: Record<string, string> = {
  TV: 'TV', Movie: 'Film', OVA: 'OVA', ONA: 'ONA',
  Special: 'SP', Music: 'Music',
};

export const AnimeCard = ({ anime }: AnimeCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  const releaseDate = formatDate(anime.aired?.from);
  const typeLabel = anime.type ? (TYPE_LABELS[anime.type] ?? anime.type) : null;

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="flex flex-col bg-transparent group font-sans h-full cursor-pointer"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#11131A] border border-[#FF3B3B]/10 group-hover:border-[#FF3B3B]/40 transition-all duration-500 shadow-sm group-hover:shadow-[0_0_24px_rgba(255,59,59,0.12)]">
        <img
          src={getHighResImageUrl(anime.images.jpg.large_image_url || anime.images.jpg.image_url)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = anime.images.jpg.large_image_url || anime.images.jpg.image_url;
          }}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Tipo de anime — esquina superior izquierda */}
        {typeLabel && (
          <div className="absolute top-2 left-2 z-10 bg-[#0D0F15]/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10">
            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wider">{typeLabel}</span>
          </div>
        )}

        {/* Score — esquina inferior derecha */}
        {anime.score && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-[#0D0F15]/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-[#FF3B3B]/25">
            <span className="text-[#FF3B3B] text-[10px] leading-none">★</span>
            <span className="text-white font-black text-[11px] tabular-nums leading-none">{anime.score}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F15]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-4">
          <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-[#0D0F15]/80 backdrop-blur-md border border-[#FF3B3B]/50 px-5 py-2 rounded-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
            Ver Detalles
          </span>
        </div>
      </div>

      <div className="pt-3 flex flex-col flex-1">
        <h3
          className="font-bold text-white text-sm line-clamp-2 leading-tight group-hover:text-[#FF3B3B] transition-colors"
          title={anime.title}
        >
          {anime.title}
        </h3>
        <div className="mt-1.5 flex flex-col gap-1">
          {releaseDate && (
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={10} className="text-[#FF3B3B]/70" /> {releaseDate}
            </p>
          )}
          <p className="text-[10px] text-zinc-600 font-bold">
            {anime.episodes ? `${anime.episodes} episodios` : 'En emisión'}
          </p>
        </div>
      </div>
    </Link>
  );
};
