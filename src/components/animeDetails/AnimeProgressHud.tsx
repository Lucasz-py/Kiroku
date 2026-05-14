import type { AnimeFull } from '../../types/anime';

interface AnimeProgressHudProps {
  anime: AnimeFull;
  progress: number;
  isSaving: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
}

export const AnimeProgressHud = ({ anime, progress, isSaving, onDecrement, onIncrement }: AnimeProgressHudProps) => (
  <div className="flex items-center justify-between bg-[#1A1C24] rounded-xl border border-[#FF3B3B]/20 px-4 py-2.5 w-full">
    <span className="text-[10px] font-mono text-[#FF3B3B]/80 uppercase tracking-widest flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse"></span>
      Progreso
    </span>
    <div className="flex items-center gap-4">
      <button
        onClick={onDecrement}
        disabled={progress <= 0 || isSaving}
        className="w-6 h-6 flex items-center justify-center bg-[#11131A] text-zinc-400 border border-[#FF3B3B]/15 hover:text-[#FF3B3B] disabled:opacity-50 transition-colors rounded-md"
      >-</button>
      <span className="text-white font-mono text-sm font-bold w-12 text-center">
        {progress} <span className="text-zinc-600 text-xs">/ {anime.episodes || '?'}</span>
      </span>
      <button
        onClick={onIncrement}
        disabled={isSaving}
        className="w-6 h-6 flex items-center justify-center bg-[#11131A] text-zinc-400 border border-[#FF3B3B]/15 hover:text-[#FF3B3B] disabled:opacity-50 transition-colors rounded-md"
      >+</button>
    </div>
  </div>
);
