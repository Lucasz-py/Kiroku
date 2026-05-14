import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import type { AnimeRelationEntry } from '../../types/anime';

interface RelatedEntryItemProps {
  entry: AnimeRelationEntry;
}

export const RelatedEntryItem = ({ entry }: RelatedEntryItemProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(entry.type === 'anime' || entry.type === 'manga');

  useEffect(() => {
    let isMounted = true;
    if (entry.type === 'anime' || entry.type === 'manga') {
      fetch(`https://api.jikan.moe/v4/${entry.type}/${entry.mal_id}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.data?.images?.jpg?.image_url)
            setImageUrl(data.data.images.jpg.image_url);
        })
        .finally(() => { if (isMounted) setIsLoading(false); });
    }
    return () => { isMounted = false; };
  }, [entry.mal_id, entry.type]);

  const isClickable = entry.type === 'anime';

  const ContentBody = (
    <div className={`flex items-center gap-3 p-2 bg-[#11131A] rounded-lg border border-[#FF3B3B]/15 transition-colors ${isClickable ? 'hover:border-[#FF3B3B]/40 hover:bg-[#1A1C24] group' : 'opacity-70'}`}>
      <div className="w-10 h-14 shrink-0 bg-[#1A1C24] flex items-center justify-center overflow-hidden rounded-md">
        {isLoading
          ? <Loader2 size={14} className="text-[#FF3B3B]/50 animate-spin" />
          : imageUrl
            ? <img src={imageUrl} alt={entry.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
            : <ImageIcon size={16} className="text-zinc-600" />
        }
      </div>
      <div className="flex flex-col flex-1 min-w-0 pr-2">
        <span className={`text-[11px] font-bold line-clamp-2 leading-snug ${isClickable ? 'text-white group-hover:text-[#FF3B3B] transition-colors' : 'text-zinc-400'}`}>
          {entry.name}
        </span>
        <span className="text-[9px] uppercase font-bold text-zinc-500 mt-1">Formato: {entry.type}</span>
      </div>
    </div>
  );

  return isClickable
    ? <Link to={`/anime/${entry.mal_id}`}>{ContentBody}</Link>
    : <div>{ContentBody}</div>;
};
