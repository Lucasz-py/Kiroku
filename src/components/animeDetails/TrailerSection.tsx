import { Film } from 'lucide-react';
import type { AnimeFull } from '../../types/anime';

interface TrailerSectionProps {
  trailer: AnimeFull['trailer'];
  title: string;
}

export const TrailerSection = ({ trailer, title }: TrailerSectionProps) => (
  <section className="mb-16">
    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
      <Film size={24} className="text-[#FF3B3B]" /> Trailer Oficial
    </h3>
    {trailer?.embed_url || trailer?.youtube_id ? (
      <div className="aspect-video w-full bg-[#0D0F15] relative shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-[#FF3B3B]/20 hover:border-[#FF3B3B]/40 transition-colors rounded-2xl overflow-hidden">
        <iframe
          src={trailer.embed_url || `https://www.youtube.com/embed/${trailer.youtube_id}`}
          title="Trailer"
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    ) : (
      <div className="bg-[#11131A]/90 py-16 px-8 border border-[#FF3B3B]/15 rounded-2xl flex flex-col items-center justify-center text-center">
        <span className="text-zinc-400 font-bold text-lg mb-6">No se encontró trailer oficial.</span>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer oficial')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1A1C24] text-white font-bold text-sm px-6 py-3 hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 hover:border-[#FF3B3B]/50 hover:text-[#FF3B3B] transition-all rounded-xl"
        >
          Buscar en YouTube
        </a>
      </div>
    )}
  </section>
);
