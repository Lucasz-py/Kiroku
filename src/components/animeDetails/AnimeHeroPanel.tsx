import { type RefObject } from 'react';
import { Trophy, Flame } from 'lucide-react';
import type { AnimeFull } from '../../types/anime';
import { getHighResImageUrl } from '../../utils/animeUtils';
import { MetadataBox } from './MetadataBox';
import { AnimeSaveControls } from './AnimeSaveControls';

const getRankingBadgeStyle = (rank: number) => {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black shadow-[0_0_30px_rgba(251,191,36,0.8)] border border-amber-300';
    case 2: return 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-black shadow-[0_0_20px_rgba(203,213,225,0.7)] border border-white';
    case 3: return 'bg-gradient-to-r from-amber-700 to-orange-700 text-white font-black shadow-[0_0_20px_rgba(180,83,9,0.7)] border border-amber-500';
    case 4: return 'bg-[#FF3B3B]/10 text-[#FF7777] border border-[#FF3B3B]/30 font-bold shadow-[0_0_10px_rgba(255,59,59,0.15)]';
    case 5: return 'bg-[#FF3B3B]/5 text-[#FF9B9B] border border-[#FF3B3B]/20 font-bold';
    default: return 'bg-[#11131A] border border-zinc-800 text-zinc-500';
  }
};

const getPopularityBadgeStyle = (popularity: number) => {
  switch (popularity) {
    case 1: return 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-black shadow-[0_0_30px_rgba(217,70,239,0.8)] border border-fuchsia-300';
    case 2: return 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-black shadow-[0_0_20px_rgba(168,85,247,0.7)] border border-purple-300';
    case 3: return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black shadow-[0_0_20px_rgba(139,92,246,0.7)] border border-violet-400';
    case 4: return 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 font-bold shadow-[0_0_10px_rgba(217,70,239,0.15)]';
    case 5: return 'bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold';
    default: return 'bg-[#1A1C24] border border-zinc-700/50 text-zinc-300';
  }
};

interface AnimeHeroPanelProps {
  anime: AnimeFull;
  displayYear: string | number;
  savedStatus: string | null;
  isFavorite: boolean;
  isSaving: boolean;
  isDropdownOpen: boolean;
  pendingStatus: string | null;
  progress: number;
  availableStatuses: string[];
  dropdownRef: RefObject<HTMLDivElement>;
  onToggleDropdown: () => void;
  onToggleFavorite: () => void;
  onStatusSelect: (status: string) => void;
  onSaveWithProgress: (status: string, progress: number) => void;
  onRemove: () => void;
  onPendingStatus: (status: string | null) => void;
  onProgressChange: (value: number) => void;
  onProgressDecrement: () => void;
  onProgressIncrement: () => void;
}

export const AnimeHeroPanel = ({
  anime, displayYear, savedStatus, isFavorite, isSaving, isDropdownOpen,
  pendingStatus, progress, availableStatuses, dropdownRef,
  onToggleDropdown, onToggleFavorite, onStatusSelect, onSaveWithProgress,
  onRemove, onPendingStatus, onProgressChange, onProgressDecrement, onProgressIncrement,
}: AnimeHeroPanelProps) => (
  <div className="bg-[#11131A]/90 backdrop-blur-xl mb-12 relative flex flex-col md:flex-row border border-[#FF3B3B]/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden">
    <div className="w-full md:w-[360px] bg-[#0D0F15] p-5 flex justify-center items-center shrink-0 z-10">
      <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-[#FF3B3B]/15 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <img
          src={getHighResImageUrl(anime.images.webp?.large_image_url || anime.images.jpg.large_image_url || anime.images.jpg.image_url)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = anime.images.jpg.large_image_url || anime.images.jpg.image_url;
          }}
          alt={anime.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    </div>

    <div className="p-8 md:p-10 flex-1 flex flex-col relative z-10">
      <div className="flex flex-col xl:flex-row justify-between items-start mb-8 gap-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            {anime.title}
          </h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres.map(g => (
              <span
                key={g.name}
                className="bg-[#1A1C24] text-zinc-300 border border-[#FF3B3B]/20 text-[10px] px-3 py-1.5 uppercase tracking-widest font-bold rounded-md"
              >
                {g.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {anime.rank && (
              <div className={`px-5 py-2 text-[11px] uppercase tracking-widest flex items-center gap-2 rounded-lg ${getRankingBadgeStyle(anime.rank)}`}>
                <Trophy size={13} /> Rank #{anime.rank}
              </div>
            )}
            {anime.popularity && (
              <div className={`px-5 py-2 text-[11px] uppercase tracking-widest flex items-center gap-2 rounded-lg ${getPopularityBadgeStyle(anime.popularity)}`}>
                <Flame size={13} /> Popularidad #{anime.popularity}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start xl:items-end gap-5 min-w-max">
          <div className="bg-[#1A1C24] p-4 rounded-xl border border-[#FF3B3B]/20 w-full xl:w-auto">
            <div className="text-5xl font-black text-[#FF3B3B] drop-shadow-[0_0_10px_rgba(255,59,59,0.3)]">
              {anime.score || 'N/A'}
            </div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">Puntuación Global</div>
          </div>

          <AnimeSaveControls
            anime={anime}
            savedStatus={savedStatus}
            isFavorite={isFavorite}
            isSaving={isSaving}
            isDropdownOpen={isDropdownOpen}
            pendingStatus={pendingStatus}
            progress={progress}
            availableStatuses={availableStatuses}
            dropdownRef={dropdownRef}
            onToggleDropdown={onToggleDropdown}
            onToggleFavorite={onToggleFavorite}
            onStatusSelect={onStatusSelect}
            onSaveWithProgress={onSaveWithProgress}
            onRemove={onRemove}
            onPendingStatus={onPendingStatus}
            onProgressChange={onProgressChange}
            onProgressDecrement={onProgressDecrement}
            onProgressIncrement={onProgressIncrement}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <MetadataBox label="Formato" value={anime.type || 'Desconocido'} />
        <MetadataBox label="Estado" value={anime.status} />
        <MetadataBox label="Episodios" value={anime.episodes || 'En emisión'} />
        <MetadataBox label="Año" value={displayYear} />
        <MetadataBox
          label="Estudio"
          value={anime.studios?.[0]?.name || 'Desconocido'}
          isLink
          link={`/search?studioId=${anime.studios?.[0]?.mal_id}&studioName=${encodeURIComponent(anime.studios?.[0]?.name || '')}`}
        />
      </div>

      <div className="mt-auto">
        <h3 className="text-xl font-black text-white mb-4">Sinopsis</h3>
        <p className="text-zinc-400 text-base leading-relaxed">
          {anime.synopsis || 'Sinopsis no disponible en la base de datos.'}
        </p>
      </div>
    </div>
  </div>
);
