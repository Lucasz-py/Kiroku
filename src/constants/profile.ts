import { Trophy, Clock, Tv, Heart, Medal, Star, Flame, Crown, Check, Play, List } from 'lucide-react';
// IMPORTANTE: Asegúrate de importar UserStats aquí
import type { Achievement, UserStats } from '../types/profile'; 

export const SHAPES = {
  circle: undefined,
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  octagon: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  starburst: 'polygon(50% 0%, 61% 22%, 85% 15%, 78% 39%, 100% 50%, 78% 61%, 85% 85%, 61% 78%, 50% 100%, 39% 78%, 15% 85%, 22% 61%, 0% 50%, 22% 39%, 15% 15%, 39% 22%)',
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'dios_anime', name: 'Dios del Anime', desc: 'Acumula 1,000 horas de visualización', icon: Crown,
    color: 'from-fuchsia-500 to-purple-700', glowClass: 'drop-shadow-[0_0_25px_rgba(217,70,239,1)] scale-110',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-fuchsia-500/30 hover:border-fuchsia-500/80 shadow-[0_0_15px_rgba(217,70,239,0.15)]',
    animatedLight: 'bg-[conic-gradient(from_0deg,transparent_0%,transparent_50%,#f0abfc_100%)] animate-[spin_1s_linear_infinite]',
    shape: SHAPES.starburst, difficulty: 5, req: (s: UserStats) => s.hours >= 1000,
  },
  {
    id: 'sin_vida', name: 'Leyenda Viva', desc: 'Visualiza 1,000 episodios en total', icon: Flame,
    color: 'from-red-500 to-rose-700', glowClass: 'drop-shadow-[0_0_25px_rgba(225,29,72,1)] scale-110',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-rose-500/30 hover:border-rose-500/80 shadow-[0_0_15px_rgba(225,29,72,0.15)]',
    animatedLight: 'bg-[conic-gradient(from_0deg,transparent_0%,transparent_50%,#fda4af_100%)] animate-[spin_1s_linear_infinite]',
    shape: SHAPES.starburst, difficulty: 5, req: (s: UserStats) => s.episodes >= 1000,
  },
  {
    id: 'time_100', name: 'El Viaje del Héroe', desc: 'Acumula 100 horas de visualización', icon: Medal,
    color: 'from-purple-400 to-purple-700', glowClass: 'drop-shadow-[0_0_12px_rgba(147,51,234,0.8)]',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-purple-500/30 hover:border-purple-500/80 shadow-[0_0_15px_rgba(147,51,234,0.15)]',
    animatedLight: 'bg-[conic-gradient(from_0deg,transparent_0%,transparent_80%,#d8b4fe_100%)] animate-[spin_3s_linear_infinite]',
    shape: SHAPES.octagon, difficulty: 4, req: (s: UserStats) => s.hours >= 100,
  },
  {
    id: 'maratonista', name: 'Maratonista', desc: 'Visualiza 100 episodios en total', icon: Trophy,
    color: 'from-orange-400 to-red-500', glowClass: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-red-500/30 hover:border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    animatedLight: 'bg-[conic-gradient(from_0deg,transparent_0%,transparent_80%,#fca5a5_100%)] animate-[spin_3s_linear_infinite]',
    shape: SHAPES.octagon, difficulty: 4, req: (s: UserStats) => s.episodes >= 100,
  },
  {
    id: 'experto', name: 'Experto', desc: 'Marca 50 animes como completados', icon: Trophy,
    color: 'from-yellow-400 to-yellow-600', glowClass: 'drop-shadow-[0_0_10px_#eab308]',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-yellow-500/30 hover:border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
    shape: SHAPES.hexagon, difficulty: 3, req: (s: UserStats) => s.completed >= 50,
  },
  {
    id: 'time_24', name: 'Un Día Entero', desc: 'Acumula 24 horas de visualización', icon: Clock,
    color: 'from-blue-500 to-indigo-600', glowClass: 'drop-shadow-[0_0_10px_#3b82f6]',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-blue-500/30 hover:border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    shape: SHAPES.hexagon, difficulty: 3, req: (s: UserStats) => s.hours >= 24,
  },
  {
    id: 'novato', name: 'Novato', desc: 'Marca 10 animes como completados', icon: Tv,
    color: 'from-teal-400 to-teal-600', glowClass: 'drop-shadow-[0_0_6px_#2dd4bf]',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-teal-500/30 hover:border-teal-500/80 shadow-[0_0_15px_rgba(20,184,166,0.15)]',
    shape: SHAPES.circle, difficulty: 2, req: (s: UserStats) => s.completed >= 10,
  },
  {
    id: 'coleccionista', name: 'Coleccionista', desc: 'Añade 5 animes a tu lista de favoritos', icon: Heart,
    color: 'from-fuchsia-400 to-fuchsia-600', glowClass: 'drop-shadow-[0_0_6px_#e879f9]',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-fuchsia-400/30 hover:border-fuchsia-400/80 shadow-[0_0_15px_rgba(232,121,249,0.15)]',
    shape: SHAPES.circle, difficulty: 2, req: (s: UserStats) => s.favorites >= 5,
  },
  {
    id: 'first_blood', name: 'Primer Paso', desc: 'Marca tu primer anime como completado', icon: Star,
    color: 'from-cyan-400 to-blue-500', glowClass: 'drop-shadow-[0_0_6px_#22d3ee]',
    containerClass: 'bg-[#11131A]/80 hover:bg-[#1A1C24] border border-cyan-400/30 hover:border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.15)]',
    shape: SHAPES.circle, difficulty: 1, req: (s: UserStats) => s.completed >= 1,
  },
].sort((a, b) => b.difficulty - a.difficulty);

export const PROFILE_TABS = [
  { id: 'Favoritos', icon: Heart },
  { id: 'Todos', icon: List },
  { id: 'Completado', icon: Check },
  { id: 'Mirando', icon: Play },
  { id: 'Pendiente', icon: Clock },
];