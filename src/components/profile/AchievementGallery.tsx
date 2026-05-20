import { useState } from 'react';
import { Trophy, X, Info } from 'lucide-react';
import type { Achievement } from '../../types/profile';

interface AchievementGalleryProps {
  unlockedAchievements: Achievement[];
}

// ─── Corona config — spinning shape placed BEHIND the medal ──────────────────
// Larger than the medal so it extends visibly around the shape edges.

const CORONA_GRADIENT: Record<number, string> = {
  5: 'conic-gradient(from 0deg, transparent 0%, rgba(100,210,255,0.55) 4%, rgba(210,245,255,0.9) 6.5%, rgba(100,210,255,0.55) 9%, transparent 13%)',
  6: 'conic-gradient(from 0deg, transparent 0%, rgba(30,210,230,0.85) 20%, rgba(130,70,250,0.9) 42%, transparent 64%)',
  7: 'conic-gradient(from 0deg, #ff4080, #ff8800, #ffee00, #40ee80, #0088ff, #a040ff, #ff4080)',
};
const CORONA_SPEED: Record<number, string> = { 5: '4s', 6: '2.2s', 7: '0.8s' };

// Extra pixels added beyond the medal size per tier (scales proportionally)
const CORONA_EXTRA_PX: Record<number, number> = { 5: 12, 6: 16, 7: 20 };
const getCoronaPx = (diff: number, medalSizePx: number): number | undefined => {
  const extra = CORONA_EXTRA_PX[diff];
  return extra !== undefined ? medalSizePx + extra : undefined;
};

// Inline fill override for tier 6-7 (richer than 2-stop Tailwind)
const FILL_OVERRIDE: Partial<Record<number, React.CSSProperties>> = {
  6: { background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' },
  7: {
    background: 'linear-gradient(270deg, #fde68a, #f43f5e, #a855f7, #22d3ee, #fde68a)',
    backgroundSize: '300% 300%',
    animation: 'ach-gradient 3.5s ease infinite',
  },
};

const KEYFRAMES = `
  @keyframes ach-spin     { to { transform: rotate(360deg); } }
  @keyframes ach-gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
`;

// ─── Medal renderer ───────────────────────────────────────────────────────────

const Medal = ({ ach, sizePx }: { ach: Achievement; sizePx: number }) => {
  const diff      = ach.difficulty;
  const shapeStyle = ach.shape ? { clipPath: ach.shape } : { borderRadius: '9999px' };
  const fillStyle  = FILL_OVERRIDE[diff];
  const iconSize   = Math.round(sizePx * 0.44);
  const coronaPx   = getCoronaPx(diff, sizePx);

  return (
    // wrapper: glowClass (filter:drop-shadow) is applied here by the caller
    <div style={{ position: 'relative', width: sizePx, height: sizePx }}>

      {/* Spinning corona — behind the medal, same shape, slightly larger */}
      {coronaPx && (
        <div style={{
          position: 'absolute',
          width:  coronaPx,
          height: coronaPx,
          top:    '50%',
          left:   '50%',
          marginTop:  -(coronaPx / 2),
          marginLeft: -(coronaPx / 2),
          zIndex: 0,
        }}>
          <div
            className="w-full h-full"
            style={{
              ...shapeStyle,
              background: CORONA_GRADIENT[diff] ?? CORONA_GRADIENT[7],
              animation:  `ach-spin ${CORONA_SPEED[diff] ?? '2s'} linear infinite`,
            }}
          />
        </div>
      )}

      {/* Medal — clean gradient, no internal spinning light */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ ...shapeStyle, zIndex: 1 }}
      >
        <div
          className={fillStyle ? 'absolute inset-0' : `absolute inset-0 bg-gradient-to-br ${ach.color}`}
          style={fillStyle}
        />
        <ach.icon
          size={iconSize}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
          style={{ zIndex: 2, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.45))' }}
        />
      </div>
    </div>
  );
};

// ─── Gallery ──────────────────────────────────────────────────────────────────

export const AchievementGallery = ({ unlockedAchievements }: AchievementGalleryProps) => {
  const [selected, setSelected] = useState<Achievement | null>(null);

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6">

        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
          <Trophy size={14} className="text-[#FF3B3B]/50" /> Vitrina de Logros
        </p>

        {unlockedAchievements.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {unlockedAchievements.map(ach => (
              <div
                key={ach.id}
                onClick={() => setSelected(ach)}
                className="relative p-3 transition-all duration-200 flex flex-col items-center text-center group cursor-pointer rounded-xl bg-[#0D0F15] border border-[#FF3B3B]/[0.07] hover:border-[#FF3B3B]/25 hover:bg-[#FF3B3B]/5"
              >
                {/* Tooltip */}
                <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-[160px] bg-[#11131A] border border-[#FF3B3B]/20 text-zinc-300 text-[10px] px-3 py-2 shadow-lg z-20 animate-in fade-in pointer-events-none rounded-lg">
                  {ach.desc}
                </div>

                {/* Medal + glow wrapper */}
                <div
                  className={`transition-transform duration-200 group-hover:scale-110 mb-2.5 ${ach.glowClass ?? ''}`}
                >
                  <Medal ach={ach} sizePx={44} />
                </div>

                <span className="text-[11px] font-bold text-zinc-400 leading-tight line-clamp-2 group-hover:text-zinc-200 transition-colors">
                  {ach.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-3">
            <Trophy size={28} className="text-zinc-800" />
            <p className="text-xs text-zinc-600 text-center font-bold uppercase tracking-widest">
              Sin logros desbloqueados
            </p>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#080A0F]/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#11131A] border border-[#FF3B3B]/20 p-10 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-[#FF3B3B] transition-colors bg-[#0D0F15] border border-[#FF3B3B]/15 p-2 z-10 rounded-lg"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              {/* Large medal with glow */}
              <div className={`mb-8 ${selected.glowClass ?? ''}`}>
                <Medal ach={selected} sizePx={144} />
              </div>

              <h3 className="text-2xl font-black text-white mb-5">{selected.name}</h3>

              <div className="bg-[#0D0F15] p-5 border border-[#FF3B3B]/15 w-full relative text-left rounded-xl">
                <Info size={16} className="absolute top-5 left-4 text-[#FF3B3B]/60" />
                <p className="text-[#FF3B3B]/70 font-bold text-[10px] uppercase tracking-widest mb-2 ml-7">
                  Requisito desbloqueado
                </p>
                <p className="text-zinc-300 text-sm ml-7 leading-relaxed">{selected.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
