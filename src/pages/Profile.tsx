import { useEffect, useState, useMemo, useRef, type ChangeEvent } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Tv, CheckCircle, Heart, Hourglass,
  CalendarDays, Timer, Star, Play, Clock, Activity,
} from 'lucide-react';
import type { UserProfile, SavedAnime, UserStats } from '../types/profile';
import { ACHIEVEMENTS } from '../constants/profile';
import { parseDurationToMinutes } from '../utils/animeUtils';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { AchievementGallery } from '../components/profile/AchievementGallery';
import { AnimeGrid } from '../components/profile/AnimeGrid';

// ─── LOCAL COMPONENT: horizontal ranking bars ────────────────────────────────
const RankingCard = ({ title, data }: { title: string; data: { label: string; count: number }[] }) => {
  const max = data[0]?.count || 1;
  const barColors = [
    'linear-gradient(90deg,#FF3B3B,#FF6B6B)',
    'linear-gradient(90deg,#FF6B6B,#FF9B9B)',
    'linear-gradient(90deg,#FF9B9B,#FFBBBB)',
  ];
  return (
    <div className="profile-section bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6">
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
              >
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-zinc-300 truncate mr-2">{item.label}</span>
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

// ─── PAGE ────────────────────────────────────────────────────────────────────
export const Profile = () => {

  // ── STATE ──────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [animes, setAnimes] = useState<SavedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // ── DATA FETCH (preserved) ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) { navigate('/search'); return; }

        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', currentSession.user.id).single();

        if (profileData) {
          setProfile(profileData as UserProfile);
          setNewBio(profileData.bio || '');
        } else {
          setProfile({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            username: currentSession.user.email?.split('@')[0] || 'usuario',
            avatar_url: null,
            bio: null,
          });
        }

        const { data: animesData } = await supabase
          .from('saved_animes').select('*')
          .eq('user_id', currentSession.user.id)
          .order('created_at', { ascending: false });

        if (animesData) setAnimes(animesData as SavedAnime[]);
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  // ── HANDLERS (preserved) ───────────────────────────────────────────────────
  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/'); };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from('saved_animes').delete().eq('id', id);
    if (!error) setAnimes(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateBio = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase.from('profiles').update({ bio: newBio }).eq('id', profile.id);
      if (error) throw error;
      setProfile({ ...profile, bio: newBio });
      setIsEditingBio(false);
    } catch (error) { console.error(error); }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0 || !profile) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (error) {
      console.error(error);
      alert('Hubo un error al subir la imagen.');
    } finally { setUploadingAvatar(false); }
  };

  // ── STATS useMemo (preserved exactly) ─────────────────────────────────────
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

  // Hero stat tiles: defined before useGSAP so the closure captures current values
  const heroStats = [
    { label: 'Completados',  value: stats.completed, icon: CheckCircle },
    { label: 'Horas totales', value: stats.hours,     icon: Hourglass   },
    { label: 'Episodios',    value: stats.episodes,  icon: Tv           },
    { label: 'Favoritos',    value: stats.favorites, icon: Heart        },
  ];

  // ── GSAP: stagger entrance + numeric counters ──────────────────────────────
  useGSAP(() => {
    if (loading || !pageRef.current) return;

    gsap.fromTo(
      '.profile-section',
      { y: 28, opacity: 0, filter: 'blur(6px)' },
      {
        y: 0, opacity: 1, filter: 'blur(0px)',
        stagger: 0.07, duration: 0.55, ease: 'power2.out',
        clearProps: 'all',
      }
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

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#080A0F] gap-4">
      <Loader2 className="animate-spin text-[#FF3B3B]" size={30} />
      <span className="text-[9px] text-zinc-700 uppercase tracking-widest font-bold">Cargando perfil</span>
    </div>
  );
  if (!profile) return null;

  // Reusable spring transition string for hover effects
  const spring = 'transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease, border-color 150ms ease';

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div ref={pageRef} className="relative min-h-screen bg-[#080A0F] font-sans">
      <div className="relative z-10 container mx-auto px-4 md:px-8 pt-32 md:pt-36 pb-24 max-w-[1400px]">

        {/* ── PROFILE HEADER ─────────────────────────────────────────────── */}
        <div className="profile-section mb-10">
          <ProfileHeader
            profile={profile}
            isEditingBio={isEditingBio}
            newBio={newBio}
            uploadingAvatar={uploadingAvatar}
            onBioChange={setNewBio}
            onEditBio={() => setIsEditingBio(true)}
            onBioSave={handleUpdateBio}
            onBioCancel={() => { setIsEditingBio(false); setNewBio(profile.bio || ''); }}
            onAvatarUpload={handleAvatarUpload}
            onSignOut={handleSignOut}
          />
        </div>

        {/* ── HERO STATS BAR ─────────────────────────────────────────────── */}
        <div className="profile-section grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {heroStats.map((stat, i) => (
            <div
              key={stat.label}
              className="relative bg-[#11131A] border border-[#FF3B3B]/10 rounded-xl px-5 py-4 overflow-hidden cursor-default select-none flex items-center gap-4"
              style={{ transition: spring }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = '0 16px 36px rgba(255,59,59,0.07)';
                el.style.borderColor = 'rgba(255,59,59,0.24)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = '';
                el.style.boxShadow = '';
                el.style.borderColor = '';
              }}
            >
              {/* Top hairline accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/20 to-transparent" />

              <stat.icon size={22} className="text-[#FF3B3B]/40 shrink-0" />

              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-1 truncate">
                  {stat.label}
                </p>
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

        {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT SIDEBAR ── */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Secondary metrics */}
            <div className="profile-section bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
                <Activity size={14} className="text-[#FF3B3B]/50" /> Métricas detalladas
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { label: 'Minutos',    value: stats.minutes.toLocaleString(), icon: Timer       },
                  { label: 'Días',       value: stats.days,                     icon: CalendarDays },
                  { label: 'Mirando',    value: stats.watching,                 icon: Play         },
                  { label: 'Pendientes', value: stats.pending,                  icon: Clock        },
                ] as const).map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="bg-[#0D0F15] border border-[#FF3B3B]/[0.07] rounded-xl p-4 cursor-default"
                    style={{ transition: spring }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = 'scale(1.04)';
                      el.style.borderColor = 'rgba(255,59,59,0.2)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = '';
                      el.style.borderColor = '';
                    }}
                  >
                    <Icon size={16} className="text-[#FF3B3B]/50 mb-3" />
                    <span className="block text-2xl font-black text-white tracking-tight leading-none mb-2 tabular-nums">
                      {value}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top géneros */}
            <RankingCard title="Géneros Favoritos" data={stats.topGenres} />

            {/* Top estudios */}
            <RankingCard title="Estudios Favoritos" data={stats.topStudios} />

            {/* Logros */}
            <div className="profile-section">
              <AchievementGallery unlockedAchievements={unlockedAchievements} />
            </div>

          </div>

          {/* ANIME GRID ── */}
          <div className="profile-section lg:col-span-8">
            <AnimeGrid animes={animes} onRemove={handleRemove} />
          </div>

        </div>
      </div>
    </div>
  );
};
