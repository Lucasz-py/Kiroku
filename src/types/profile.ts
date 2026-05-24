import type { ElementType } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
}

export interface SavedAnime {
  id: string;
  anime_id: number;
  title: string;
  image_url: string;
  status: string;
  episodes_total: number | null;
  score: number | null;
  user_score?: number | null;
  is_favorite: boolean;
  year: number | null;
  genres: string[];
  studios?: string[];
  duration: string | null;
  progress?: number | null;
  created_at?: string;
}

export interface ActivityEntry {
  type: 'added' | 'completed' | 'watching' | 'favorite';
  anime_id: number;
  title: string;
  image_url: string;
  status: string;
  created_at: string;
}

export interface UserStats {
  episodes: number;
  minutes: number;
  hours: number;
  days: string;
  completed: number;
  pending: number;
  watching: number;
  favorites: number;
  topGenres: { label: string; count: number }[];
  topStudios: { label: string; count: number }[];
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: ElementType;
  color: string;
  glowClass?: string;
  containerClass?: string;
  animatedLight?: string | undefined;
  shape?: string | undefined;
  difficulty: number;
  req: (s: UserStats) => boolean;
}
