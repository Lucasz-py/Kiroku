import { useState } from 'react';
import { Trophy, X, Info } from 'lucide-react';
import type { Achievement } from '../../types/profile';

interface AchievementGalleryProps {
  unlockedAchievements: Achievement[];
}

export const AchievementGallery = ({ unlockedAchievements }: AchievementGalleryProps) => {
  const [selected, setSelected] = useState<Achievement | null>(null);

  return (
    <>
      <div className="bg-[#11131A]/90 backdrop-blur-md p-6 rounded-xl border border-[#FF3B3B]/20 mb-8">
        <h2 className="text-lg font-bold text-[#FF3B3B] mb-5 flex items-center gap-2">
          <Trophy size={20} /> Vitrina de Logros
        </h2>
        {unlockedAchievements.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {unlockedAchievements.map(ach => (
              <div
                key={ach.id}
                onClick={() => setSelected(ach)}
                className={`relative p-2.5 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer rounded-lg ${ach.containerClass ?? 'bg-[#11131A]/80 border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 hover:bg-[#FF3B3B]/5'}`}
              >
                <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-[150px] bg-[#11131A] border border-[#FF3B3B]/30 text-zinc-200 text-[10px] px-3 py-2 shadow-lg z-20 animate-in fade-in pointer-events-none rounded-lg">
                  {ach.desc}
                </div>
                <div className={`transition-transform duration-300 group-hover:scale-110 mb-2 relative ${ach.glowClass ?? ''}`}>
                  {ach.animatedLight ? (
                    <div className="w-10 h-10 relative flex items-center justify-center overflow-hidden bg-[#11131A]" style={ach.shape ? { clipPath: ach.shape } : { borderRadius: '9999px' }}>
                      <div className={`absolute w-[250%] h-[250%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${ach.animatedLight}`}></div>
                      <div className={`absolute inset-[2px] bg-gradient-to-br ${ach.color} flex items-center justify-center`} style={ach.shape ? { clipPath: ach.shape } : { borderRadius: '9999px' }}>
                        <ach.icon size={16} className="text-white drop-shadow-md relative z-10" />
                      </div>
                    </div>
                  ) : (
                    <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${ach.color}`} style={ach.shape ? { clipPath: ach.shape } : { borderRadius: '9999px' }}>
                      <ach.icon size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-zinc-400 leading-tight mt-1 line-clamp-1">{ach.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-600 text-center py-4">Aún no hay logros registrados.</p>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11131A]/80 backdrop-blur-md animate-in fade-in" onClick={() => setSelected(null)}>
          <div className="bg-[#11131A] border border-[#FF3B3B]/25 p-10 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 rounded-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-[#FF3B3B] transition-colors bg-[#11131A] border border-[#FF3B3B]/20 p-2 z-10 rounded-lg">
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <div className={`mb-10 relative ${selected.glowClass ?? ''}`}>
                {selected.animatedLight ? (
                  <div className="w-36 h-36 relative flex items-center justify-center overflow-hidden bg-[#11131A]" style={selected.shape ? { clipPath: selected.shape } : { borderRadius: '9999px' }}>
                    <div className={`absolute w-[250%] h-[250%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${selected.animatedLight}`}></div>
                    <div className={`absolute inset-[3px] bg-gradient-to-br ${selected.color} flex items-center justify-center`} style={selected.shape ? { clipPath: selected.shape } : { borderRadius: '9999px' }}>
                      <selected.icon size={64} className="text-white drop-shadow-lg relative z-10" />
                    </div>
                  </div>
                ) : (
                  <div className={`w-36 h-36 flex items-center justify-center bg-gradient-to-br ${selected.color}`} style={selected.shape ? { clipPath: selected.shape } : { borderRadius: '9999px' }}>
                    <selected.icon size={64} className="text-white drop-shadow-md" />
                  </div>
                )}
              </div>

              <h3 className="text-3xl font-black text-white mb-4">{selected.name}</h3>

              <div className="bg-[#1A1C24] p-6 border border-[#FF3B3B]/20 w-full relative text-left mt-2 rounded-lg">
                <Info size={18} className="absolute top-6 left-5 text-[#FF3B3B]/60" />
                <p className="text-[#FF3B3B]/80 font-bold text-[10px] uppercase tracking-widest mb-2 ml-8">Requisito Desbloqueado</p>
                <p className="text-zinc-300 font-medium text-sm ml-8 leading-relaxed">{selected.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
