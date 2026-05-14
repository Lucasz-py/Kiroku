import { Users } from 'lucide-react';
import type { Character } from '../../types/anime';

interface CharactersGridProps {
  characters: Character[];
}

export const CharactersGrid = ({ characters }: CharactersGridProps) => (
  <section className="mb-12">
    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
      <Users size={24} className="text-[#FF3B3B]" /> Personajes
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {characters.length > 0 ? (
        characters.map((char) => (
          <div
            key={char.character.mal_id}
            className="bg-[#11131A] relative group border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,59,59,0.1)] rounded-xl overflow-hidden"
          >
            <div className="aspect-[3/4] overflow-hidden relative bg-[#0D0F15]">
              <img
                src={char.character.images.jpg.image_url}
                alt={char.character.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11131A] via-transparent to-transparent opacity-90" />
            </div>
            <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-[#11131A] to-transparent">
              <h4 className="text-white text-xs font-bold truncate mb-1 drop-shadow-md">{char.character.name}</h4>
              <p className="text-[#FF7777] text-[10px] font-bold">{char.role}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full bg-[#11131A]/50 border border-[#FF3B3B]/15 rounded-xl p-8 flex justify-center text-center">
          <p className="text-zinc-500 font-bold italic">No se encontraron personajes.</p>
        </div>
      )}
    </div>
  </section>
);
