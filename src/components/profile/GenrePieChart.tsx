import { Star } from 'lucide-react';

// Paleta con separación de matiz clara: rojo → naranja → dorado → rosa → violeta
// Cada color está ~60-90° alejado del anterior para máxima distinción en el chart
const COLORS = [
  '#FF3B3B', // rojo     (0°)   — brand
  '#FF8800', // naranja  (25°)  — cálido
  '#FBBF24', // dorado   (45°)  — cálido/brillante
  '#F472B6', // rosa     (325°) — viraje opuesto
  '#A855F7', // violeta  (285°) — frío/complementario
];

const RANK_COLORS = ['#FF3B3B', '#FF8800', '#FBBF24', '#F472B6', '#A855F7'];

const GAP = 0.04;

function slicePath(
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const s = startAngle + GAP / 2;
  const e = endAngle   - GAP / 2;
  if (e - s < 0.01) return '';
  const large = e - s > Math.PI ? 1 : 0;
  const cos = (a: number) => Math.cos(a - Math.PI / 2);
  const sin = (a: number) => Math.sin(a - Math.PI / 2);
  return [
    `M ${outerR * cos(s)} ${outerR * sin(s)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${outerR * cos(e)} ${outerR * sin(e)}`,
    `L ${innerR * cos(e)} ${innerR * sin(e)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${innerR * cos(s)} ${innerR * sin(s)}`,
    'Z',
  ].join(' ');
}

interface Props {
  genres: { label: string; count: number }[];
}

export const GenrePieChart = ({ genres }: Props) => {
  const top   = genres.slice(0, 5);
  const total = top.reduce((s, g) => s + g.count, 0);

  if (total === 0) {
    return (
      <div className="profile-section bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
          <Star size={14} className="text-[#FF3B3B]/60" /> Géneros Favoritos
        </p>
        <p className="text-sm text-zinc-600 text-center py-3 italic">Sin datos suficientes.</p>
      </div>
    );
  }

  let cumAngle = 0;
  const slices = top.map((g, i) => {
    const span  = (g.count / total) * 2 * Math.PI;
    const start = cumAngle;
    cumAngle   += span;
    return {
      ...g,
      color: COLORS[i],
      pct:   Math.round((g.count / total) * 100),
      path:  slicePath(47, 16, start, cumAngle),
    };
  });

  const maxCount = top[0]?.count ?? 1;

  return (
    <div className="profile-section bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6">

      {/* Header */}
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
        <Star size={14} className="text-[#FF3B3B]/60" /> Géneros Favoritos
      </p>

      <div className="flex items-center gap-5">

        {/* ── Donut chart ── */}
        <div className="shrink-0 w-[144px] h-[144px]">
          <svg viewBox="-50 -50 100 100" className="w-full h-full overflow-visible">
            <defs>
              {/* Gradiente radial de fondo para darle profundidad al hueco */}
              <radialGradient id="donut-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#0D0F15" stopOpacity="0" />
                <stop offset="100%" stopColor="#0D0F15" stopOpacity="0" />
              </radialGradient>

              {/* Glow por sector */}
              {slices.map((_, i) => (
                <filter key={i} id={`glow-g-${i}`} x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {slices.map((s, i) => (
              <path
                key={i}
                d={s.path}
                fill={s.color}
                filter={`url(#glow-g-${i})`}
                opacity={0.90}
              />
            ))}
          </svg>
        </div>

        {/* ── Leyenda ── */}
        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
          {slices.map((s, i) => (
            <div key={s.label} className="group">

              {/* Fila: rank + nombre + porcentaje */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-black w-5 shrink-0 tabular-nums text-right"
                  style={{ color: RANK_COLORS[i] }}
                >
                  #{i + 1}
                </span>
                <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors truncate flex-1">
                  {s.label}
                </span>
                <span
                  className="text-xs font-black tabular-nums shrink-0"
                  style={{ color: s.color }}
                >
                  {s.pct}%
                </span>
              </div>

              {/* Barra proporcional */}
              <div className="h-[2px] bg-[#0D0F15] rounded-full overflow-hidden ml-7">
                <div
                  className="h-full rounded-full"
                  style={{
                    width:      `${(s.count / maxCount) * 100}%`,
                    background: s.color,
                    opacity:    0.6,
                  }}
                />
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
