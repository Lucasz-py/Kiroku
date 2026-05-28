import { useEffect, useState, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useParams, Link } from 'react-router-dom';
import { Profile } from './Profile';
import { useUserData } from '../contexts/UserDataContext';
import { supabase } from '../lib/supabase';
import {
  Loader2, Tv, CheckCircle, Heart, Hourglass,
  CalendarDays, Timer, Play, Clock, Activity, Star, ArrowLeft,
} from 'lucide-react';
import type { UserProfile, SavedAnime, UserStats } from '../types/profile';
import { parseDurationToMinutes } from '../utils/animeUtils';
import { ACHIEVEMENTS } from '../constants/profile';
import { AchievementGallery } from '../components/profile/AchievementGallery';
import { ActivityFeed } from '../components/profile/ActivityFeed';
import { AnimeGrid } from '../components/profile/AnimeGrid';

const RankingBar = ({ title, data }: { title: string; data: { label: string; count: number }[] }) => {
  const max = data[0]?.count || 1;
  const barColors = [
    'linear-gradient(90deg,#FF3B3B,#FF6B6B)',
    'linear-gradient(90deg,#FF6B6B,#FF9B9B)',
    'linear-gradient(90deg,#FF9B9B,#FFBBBB)',
  ];
  return (
    <div className="bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
        <Star size={14} className="text-[#FF3B3B]/60" /> {title}
      </p>
      {data.length > 0 ? (
        <div className="flex flex-col gap-4">
          {data.map((item, i) => (
            <div key={item.label} className="flex items-center gap-3">
              <span
                className="text-xs font-black w-5 shrink-0 tabular-nums"
                style={{ color: i === 0 ? '#FF3B3B' : i === 1 ? '#FF7777' : '#FF9B9B' }}
              >#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="font-bold text-zinc-300 truncate mr-2"
                    style={{ fontSize: i === 0 ? '1rem' : i === 1 ? '0.875rem' : '0.78rem' }}
                  >{item.label}</span>
                  <span className="text-xs font-black text-zinc-500 shrink-0 tabular-nums">{item.count}</span>
                </div>
                <div className="h-[3px] bg-[#0D0F15] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(item.count / max) * 100}%`, background: barColors[i] }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-600 text-center py-3 italic">Sin datos suficientes.</p>
      )}
    </div>
  );
};

const NotFound = ({ username }: { username?: string }) => (
  <div className="min-h-screen bg-[#080A0F] flex flex-col items-center justify-center gap-6 px-4">
    <div className="w-20 h-20 rounded-2xl bg-[#11131A] border border-[#FF3B3B]/20 flex items-center justify-center text-4xl font-black text-zinc-700">
      ?
    </div>
    <div className="text-center">
      <h1 className="text-2xl font-black text-white mb-2">Perfil no encontrado</h1>
      <p className="text-zinc-500 text-sm">@{username} no existe o no tiene perfil público.</p>
    </div>
    <Link
      to="/search"
      className="flex items-center gap-2 px-6 py-3 bg-[#FF3B3B] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#FF6B6B] transition-colors"
    >
      <ArrowLeft size={14} /> Volver al inicio
    </Link>
  </div>
);

export const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { session } = useUserData();
  const [ownUsername, setOwnUsername] = useState<string | null>(null);
  const [ownerChecked, setOwnerChecked] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [animes, setAnimes] = useState<SavedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Step 1: check if the viewer is the profile owner
  useEffect(() => {
    const checkOwner = async () => {
      if (!session) { setOwnerChecked(true); return; }
      const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
      setOwnUsername(data?.username ?? null);
      setOwnerChecked(true);
    };
    checkOwner();
  }, [session]);

  // Step 2: fetch public data only when confirmed NOT the owner
  useEffect(() => {
    if (!ownerChecked) return;
    if (ownUsername === username) { setLoading(false); return; }
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('username', username).single();

        if (!profileData) { setNotFound(true); setLoading(false); return; }
        setProfile(profileData as UserProfile);

        const { data: animesData } = await supabase
          .from('saved_animes').select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (animesData) setAnimes(animesData as SavedAnime[]);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [ownerChecked, ownUsername, username]);

  const stats: UserStats = useMemo(() => {
    let episodes = 0, minutes = 0, completed = 0, favorites = 0, pending = 0, watching = 0;
    const genreCounts: Record<string, number> = {};
    const studioCounts: Record<string, number> = {};

    animes.forEach(anime => {
      if (anime.is_favorite) favorites++;
      if (anime.status === 'Pendiente') pending++;
      let epsWatched = 0;
      if (anime.status === 'Completado') {
        completed++;
        epsWatched = anime.episodes_total || anime.progress || 1;
        anime.genres?.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
        anime.studios?.forEach(s => { studioCounts[s] = (studioCounts[s] || 0) + 1; });
      } else if (anime.status === 'Mirando') {
        watching++;
        epsWatched = anime.progress || 0;
      }
      if (epsWatched > 0) {
        episodes += epsWatched;
        minutes += epsWatched * parseDurationToMinutes(anime.duration);
      }
    });

    return {
      episodes, minutes,
      hours: Math.floor(minutes / 60),
      days: (minutes / 1440).toFixed(1),
      completed, pending, watching, favorites,
      topGenres: Object.entries(genreCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count).slice(0, 3),
      topStudios: Object.entries(studioCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count).slice(0, 3),
    };
  }, [animes]);

  const unlockedAchievements = ACHIEVEMENTS.filter(ach => ach.req(stats));

  const heroStats = [
    { label: 'Completados',   value: stats.completed, icon: CheckCircle },
    { label: 'Horas totales', value: stats.hours,     icon: Hourglass   },
    { label: 'Episodios',     value: stats.episodes,  icon: Tv           },
    { label: 'Favoritos',     value: stats.favorites, icon: Heart        },
  ];

  const pageRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(() => {
    if (loading || !pageRef.current) return;
    gsap.fromTo(
      '.profile-section',
      { y: 28, opacity: 0, filter: 'blur(6px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.07, duration: 0.55, ease: 'power2.out', clearProps: 'all' }
    );
    counterRefs.current.forEach((el, i) => {
      if (!el) return;
      const target = heroStats[i].value;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.35,
        ease: 'power2.out',
        delay: 0.18 + i * 0.08,
        onUpdate() { if (el) el.textContent = Math.round(obj.val).toLocaleString(); },
      });
    });
  }, { scope: pageRef, dependencies: [loading] });

  if (!ownerChecked || loading) return (
    <div className="flex justify-center items-center h-screen bg-[#080A0F]">
      <Loader2 className="animate-spin text-[#FF3B3B]" size={28} />
    </div>
  );
  if (ownUsername === username) return <Profile />;
  if (notFound || !profile) return <NotFound username={username} />;

  return (
    <div ref={pageRef} className="min-h-screen bg-[#080A0F] font-sans">
      <div className="container mx-auto px-4 md:px-8 pt-32 md:pt-36 pb-24 max-w-[1400px]">

        {/* Back link */}
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#FF3B3B] text-xs font-bold uppercase tracking-widest transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Volver
        </Link>

        {/* Profile header (read-only) */}
        <div className="profile-section relative mb-8 rounded-2xl border border-[#FF3B3B]/20 overflow-hidden">
          {profile.banner_url && (
            <img src={profile.banner_url} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className={`absolute inset-0 ${profile.banner_url ? 'bg-[#0D0F15]/70 backdrop-blur-[2px]' : 'bg-[#11131A]/90'}`} />

          <div className="relative z-10 p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0 w-36 h-36 md:w-48 md:h-48 bg-[#11131A] flex items-center justify-center text-6xl font-black text-white rounded-xl border-4 border-[#0D0F15]/60 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.7)]">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                : profile.username?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 text-center md:text-left pt-2 md:pt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF3B3B]/60 mb-1 flex items-center justify-center md:justify-start gap-1.5">
                <Activity size={11} /> Perfil público
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                {profile.username}
              </h1>
              {profile.bio && (
                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl bg-[#0D0F15]/60 backdrop-blur-sm p-4 rounded-lg border-l-2 border-[#FF3B3B]/30">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Quick totals */}
            <div className="shrink-0 flex flex-col gap-2 text-right">
              <div className="bg-[#0D0F15]/80 border border-[#FF3B3B]/10 rounded-xl px-5 py-3 text-center">
                <span className="block text-2xl font-black text-white tabular-nums">{animes.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">en lista</span>
              </div>
              <div className="bg-[#0D0F15]/80 border border-[#FF3B3B]/10 rounded-xl px-5 py-3 text-center">
                <span className="block text-2xl font-black text-white tabular-nums">{unlockedAchievements.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">logros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero stat bar */}
        <div className="profile-section grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {heroStats.map((stat, i) => (
            <div
              key={stat.label}
              className="relative bg-[#11131A] border border-[#FF3B3B]/10 rounded-xl px-5 py-4 overflow-hidden flex items-center gap-4"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/20 to-transparent" />
              <stat.icon size={22} className="text-[#FF3B3B]/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-1 truncate">{stat.label}</p>
                <span
                  ref={el => { counterRefs.current[i] = el; }}
                  className="block text-3xl xl:text-4xl font-black text-white tracking-tight leading-none tabular-nums"
                >
                  0
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Secondary metrics */}
            <div className="profile-section bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
                <Activity size={14} className="text-[#FF3B3B]/50" /> Métricas detalladas
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { label: 'Minutos',    value: stats.minutes.toLocaleString(), icon: Timer        },
                  { label: 'Días',       value: stats.days,                     icon: CalendarDays },
                  { label: 'Mirando',    value: stats.watching,                 icon: Play         },
                  { label: 'Pendientes', value: stats.pending,                  icon: Clock        },
                ] as const).map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-[#0D0F15] border border-[#FF3B3B]/[0.07] rounded-xl p-4">
                    <Icon size={16} className="text-[#FF3B3B]/50 mb-3" />
                    <span className="block text-2xl font-black text-white tracking-tight leading-none mb-2 tabular-nums">{value}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-section"><RankingBar title="Géneros Favoritos" data={stats.topGenres} /></div>
            <div className="profile-section"><RankingBar title="Estudios Favoritos" data={stats.topStudios} /></div>
            <div className="profile-section"><ActivityFeed animes={animes} /></div>
            <div className="profile-section"><AchievementGallery unlockedAchievements={unlockedAchievements} /></div>
          </div>

          {/* Anime grid (read-only) */}
          <div className="profile-section lg:col-span-8">
            <AnimeGrid animes={animes} />
          </div>
        </div>
      </div>
    </div>
  );
};
