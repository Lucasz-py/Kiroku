import { Trophy, Clock, Tv, Heart, Medal, Star, Flame, Crown, Check, Play, List, Zap, Gem, Award, Shield, Target } from 'lucide-react';
import type { Achievement, UserStats } from '../types/profile';

export const SHAPES = {
  circle:    undefined,
  diamond:   'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  hexagon:   'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  star6:     'polygon(50% 0%, 64% 27%, 93% 25%, 77% 50%, 93% 75%, 64% 73%, 50% 100%, 36% 73%, 7% 75%, 23% 50%, 7% 25%, 36% 27%)',
  octagon:   'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  starburst: 'polygon(50% 0%, 61% 22%, 85% 15%, 78% 39%, 100% 50%, 78% 61%, 85% 85%, 61% 78%, 50% 100%, 39% 78%, 15% 85%, 22% 61%, 0% 50%, 22% 39%, 15% 15%, 39% 22%)',
};

// Tier factories — shape, glowClass, animatedLight, difficulty per rank.
// color is set per-achievement. animatedLight is only used in higher tiers.

const tier1 = (glow: string) => ({
  glowClass:      `drop-shadow-[0_0_6px_${glow}]`,
  containerClass: '',
  shape:          SHAPES.circle,
  animatedLight:  undefined,
  difficulty:     1,
});

const tier2 = (glow: string) => ({
  glowClass:      `drop-shadow-[0_0_9px_${glow}]`,
  containerClass: '',
  shape:          SHAPES.circle,
  animatedLight:  undefined,
  difficulty:     2,
});

const tier3 = (glow: string) => ({
  glowClass:      `drop-shadow-[0_0_12px_${glow}]`,
  containerClass: '',
  shape:          SHAPES.diamond,
  animatedLight:  undefined,
  difficulty:     3,
});

const tier4 = (glow: string) => ({
  glowClass:      `drop-shadow-[0_0_16px_${glow}] drop-shadow-[0_0_28px_${glow.replace('1)', '0.4)')}]`,
  containerClass: '',
  shape:          SHAPES.hexagon,
  animatedLight:  undefined,
  difficulty:     4,
});

const tier5 = (glow: string) => ({
  glowClass:      `drop-shadow-[0_0_20px_${glow}] drop-shadow-[0_0_36px_${glow.replace('1)', '0.45)')}]`,
  containerClass: '',
  shape:          SHAPES.star6,
  animatedLight:  undefined,
  difficulty:     5,
});

const tier6 = (glow1: string, glow2: string) => ({
  glowClass:      `drop-shadow-[0_0_24px_${glow1}] drop-shadow-[0_0_48px_${glow2}]`,
  containerClass: '',
  shape:          SHAPES.octagon,
  animatedLight:  undefined,
  difficulty:     6,
});

const tier7 = () => ({
  glowClass:      'drop-shadow-[0_0_28px_rgba(255,215,0,0.9)] drop-shadow-[0_0_55px_rgba(255,80,200,0.6)] drop-shadow-[0_0_80px_rgba(80,160,255,0.4)]',
  containerClass: '',
  shape:          SHAPES.starburst,
  animatedLight:  undefined,
  difficulty:     7,
});

// Colors: clean 2-stop modern gradients — no dark-edge metallic pattern.
export const ACHIEVEMENTS: Achievement[] = [

  // TIER 1 — circle ────────────────────────────────────────────────────────────
  {
    id: 'first_blood', name: 'Primer Paso',
    desc: 'Marca tu primer anime como completado',
    icon: Star, color: 'from-orange-400 to-amber-500',
    ...tier1('rgba(250,160,50,0.65)'),
    req: (s: UserStats) => s.completed >= 1,
  },
  {
    id: 'primer_fav', name: 'El Flechazo',
    desc: 'Añade tu primer anime a favoritos',
    icon: Heart, color: 'from-pink-500 to-rose-500',
    ...tier1('rgba(240,80,120,0.65)'),
    req: (s: UserStats) => s.favorites >= 1,
  },

  // TIER 2 — circle ────────────────────────────────────────────────────────────
  {
    id: 'novato', name: 'Novato',
    desc: 'Marca 10 animes como completados',
    icon: Tv, color: 'from-teal-500 to-emerald-600',
    ...tier2('rgba(20,190,170,0.7)'),
    req: (s: UserStats) => s.completed >= 10,
  },
  {
    id: 'coleccionista', name: 'Coleccionista',
    desc: 'Añade 5 animes a tu lista de favoritos',
    icon: Heart, color: 'from-fuchsia-500 to-purple-600',
    ...tier2('rgba(215,80,250,0.7)'),
    req: (s: UserStats) => s.favorites >= 5,
  },
  {
    id: 'lista_espera', name: 'Lista en Construcción',
    desc: 'Acumula 10 animes pendientes por ver',
    icon: Clock, color: 'from-slate-400 to-zinc-500',
    ...tier2('rgba(150,165,180,0.7)'),
    req: (s: UserStats) => s.pending >= 10,
  },

  // TIER 3 — diamond ───────────────────────────────────────────────────────────
  {
    id: 'experto', name: 'Experto',
    desc: 'Marca 50 animes como completados',
    icon: Trophy, color: 'from-yellow-400 to-amber-500',
    ...tier3('rgba(250,200,0,0.85)'),
    req: (s: UserStats) => s.completed >= 50,
  },
  {
    id: 'time_24', name: 'Un Día Entero',
    desc: 'Acumula 24 horas de visualización',
    icon: Clock, color: 'from-blue-500 to-indigo-600',
    ...tier3('rgba(80,140,255,0.85)'),
    req: (s: UserStats) => s.hours >= 24,
  },
  {
    id: 'fan_dedicado', name: 'Fan Dedicado',
    desc: 'Añade 15 animes a tu lista de favoritos',
    icon: Heart, color: 'from-rose-500 to-pink-600',
    ...tier3('rgba(255,90,140,0.85)'),
    req: (s: UserStats) => s.favorites >= 15,
  },
  {
    id: 'medio_dia', name: 'Noche en Blanco',
    desc: 'Acumula 48 horas de visualización',
    icon: Shield, color: 'from-violet-500 to-purple-600',
    ...tier3('rgba(160,90,255,0.85)'),
    req: (s: UserStats) => s.hours >= 48,
  },

  // TIER 4 — hexagon ───────────────────────────────────────────────────────────
  {
    id: 'time_100', name: 'El Viaje del Héroe',
    desc: 'Acumula 100 horas de visualización',
    icon: Medal, color: 'from-violet-500 to-indigo-700',
    ...tier4('rgba(150,100,255,1)'),
    req: (s: UserStats) => s.hours >= 100,
  },
  {
    id: 'maratonista', name: 'Maratonista',
    desc: 'Visualiza 100 episodios en total',
    icon: Trophy, color: 'from-orange-500 to-red-600',
    ...tier4('rgba(255,130,50,1)'),
    req: (s: UserStats) => s.episodes >= 100,
  },
  {
    id: 'centurion', name: 'Centurión',
    desc: 'Marca 100 animes como completados',
    icon: Award, color: 'from-amber-400 to-orange-600',
    ...tier4('rgba(255,190,50,1)'),
    req: (s: UserStats) => s.completed >= 100,
  },
  {
    id: 'trescientos', name: 'Sin Descanso',
    desc: 'Visualiza 300 episodios en total',
    icon: Target, color: 'from-emerald-500 to-teal-700',
    ...tier4('rgba(50,220,140,1)'),
    req: (s: UserStats) => s.episodes >= 300,
  },

  // TIER 5 — 6-point star ──────────────────────────────────────────────────────
  {
    id: 'dios_anime', name: 'Dios del Anime',
    desc: 'Acumula 1,000 horas de visualización',
    icon: Crown, color: 'from-fuchsia-500 to-violet-700',
    ...tier5('rgba(220,80,255,1)'),
    req: (s: UserStats) => s.hours >= 1000,
  },
  {
    id: 'sin_vida', name: 'Leyenda Viva',
    desc: 'Visualiza 1,000 episodios en total',
    icon: Flame, color: 'from-red-500 to-rose-700',
    ...tier5('rgba(255,60,80,1)'),
    req: (s: UserStats) => s.episodes >= 1000,
  },
  {
    id: 'inmortal', name: 'El Inmortal',
    desc: 'Acumula 500 horas de visualización',
    icon: Zap, color: 'from-yellow-300 to-amber-600',
    ...tier5('rgba(255,230,50,1)'),
    req: (s: UserStats) => s.hours >= 500,
  },

  // TIER 6 — octagon ───────────────────────────────────────────────────────────
  {
    id: 'cazador_sombras', name: 'Cazador de Sombras',
    desc: 'Marca 250 animes como completados',
    icon: Gem, color: 'from-cyan-400 to-blue-600',
    ...tier6('rgba(40,220,255,1)', 'rgba(100,100,255,0.6)'),
    req: (s: UserStats) => s.completed >= 250,
  },
  {
    id: 'el_cronista', name: 'El Cronista Eterno',
    desc: 'Visualiza 5,000 episodios en total',
    icon: Tv, color: 'from-orange-400 to-rose-600',
    ...tier6('rgba(255,140,50,1)', 'rgba(255,60,100,0.6)'),
    req: (s: UserStats) => s.episodes >= 5000,
  },

  // TIER 7 — starburst ─────────────────────────────────────────────────────────
  {
    id: 'kiroku_legend', name: 'KIROKU LEGEND',
    desc: 'Acumula 2,000 horas de visualización — el pináculo absoluto',
    icon: Crown, color: 'from-amber-300 to-pink-500',
    ...tier7(),
    req: (s: UserStats) => s.hours >= 2000,
  },

].sort((a, b) => b.difficulty - a.difficulty);

export const PROFILE_TABS = [
  { id: 'Favoritos',  icon: Heart  },
  { id: 'Todos',      icon: List   },
  { id: 'Completado', icon: Check  },
  { id: 'Mirando',    icon: Play   },
  { id: 'Pendiente',  icon: Clock  },
];
