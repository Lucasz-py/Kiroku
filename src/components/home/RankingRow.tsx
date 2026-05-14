import { Link } from 'react-router-dom';
import type { Anime } from '../../types/anime';
import { getHighResImageUrl } from '../../utils/animeUtils';

const getRankStyle = (index: number) => {
  switch (index) {
    case 0: return 'bg-gradient-to-br from-amber-400 to-yellow-600 text-amber-950 font-black';
    case 1: return 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950 font-black';
    case 2: return 'bg-gradient-to-br from-amber-700 to-orange-800 text-white font-black';
    default: return 'bg-[#1A1C24] text-zinc-500 font-bold';
  }
};

export const RankingRow = ({ anime, index }: { anime: Anime; index: number }) => (
  <Link
    to={`/anime/${anime.mal_id}`}
    className="group flex bg-[#11131A] rounded-xl border border-[#FF3B3B]/10 hover:border-[#FF3B3B]/40 transition-all duration-300 overflow-hidden hover:shadow-[0_0_24px_rgba(255,59,59,0.08)]"
  >
    <div className={`w-14 md:w-16 flex items-center justify-center text-lg md:text-xl shrink-0 rounded-l-xl ${getRankStyle(index)}`}>
      {index + 1}
    </div>
    <div className="w-20 md:w-28 h-28 md:h-40 overflow-hidden shrink-0 relative">
      <img
        src={getHighResImageUrl(anime.images.jpg.large_image_url || anime.images.jpg.image_url)}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = anime.images.jpg.image_url;
        }}
        alt={anime.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    </div>
    <div className="p-4 md:p-5 flex flex-col justify-center flex-1 min-w-0">
      <h3 className="text-white text-sm md:text-base font-bold truncate mb-2 group-hover:text-[#FF3B3B] transition-colors">
        {anime.title}
      </h3>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {anime.genres?.slice(0, 2).map(genre => (
          <span
            key={genre.mal_id}
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#0D0F15] text-zinc-500 border border-zinc-800"
          >
            {genre.name}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-auto">
        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          {anime.episodes ? `${anime.episodes} Eps.` : 'En Emisión'}
        </span>
        <div className="flex items-center gap-1 bg-[#0D0F15] px-2.5 py-1 rounded-lg border border-zinc-800 group-hover:border-[#FF3B3B]/30 transition-colors">
          <span className="text-[#FF3B3B] text-[10px]">★</span>
          <span className="text-white font-black text-[11px]">{anime.score || 'N/A'}</span>
        </div>
      </div>
    </div>
  </Link>
);
