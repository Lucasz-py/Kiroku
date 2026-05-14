import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, Tv, CheckCircle, Clock, Play, Heart, Hourglass, CalendarDays, Timer } from 'lucide-react';
import type { UserProfile, SavedAnime, UserStats } from '../types/profile';
import { ACHIEVEMENTS } from '../constants/profile';
import { parseDurationToMinutes } from '../utils/animeUtils';
import { StatBox, PodiumCard } from '../ui/ProfileElements';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { AchievementGallery } from '../components/profile/AchievementGallery';
import { AnimeGrid } from '../components/profile/AnimeGrid';

export const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [animes, setAnimes] = useState<SavedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!currentSession) {
          navigate('/search');
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

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
          .from('saved_animes')
          .select('*')
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
    } catch (error) {
      console.error('Error actualizando bio:', error);
    }
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
      console.error('Error subiendo avatar:', error);
      alert('Hubo un error al subir la imagen.');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
      topGenres: Object.entries(genreCounts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 3),
      topStudios: Object.entries(studioCounts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 3),
    };
  }, [animes]);

  const unlockedAchievements = ACHIEVEMENTS.filter(ach => ach.req(stats));

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#11131A]">
      <Loader2 className="animate-spin text-[#FF3B3B]" size={50} />
    </div>
  );
  if (!profile) return null;

  return (
    <div className="relative min-h-screen bg-black font-sans overflow-hidden">
      <div className="relative z-10 container mx-auto p-4 md:p-8 pt-32 md:pt-36 max-w-[1400px]">

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-6">

            <div className="bg-[#11131A]/90 backdrop-blur-md p-6 rounded-xl border border-[#FF3B3B]/20">
              <h2 className="text-lg font-bold text-[#FF3B3B] mb-5 flex items-center gap-2">
                <Tv size={20} /> Estadísticas Personales
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <StatBox title="Completados" value={stats.completed} color="text-[#FF3B3B]" icon={CheckCircle} />
                <StatBox title="Pendientes" value={stats.pending} color="text-[#FF8A8A]" icon={Clock} />
                <StatBox title="Mirando" value={stats.watching} color="text-[#FF6B6B]" icon={Play} />
                <StatBox title="Favoritos" value={stats.favorites} color="text-[#FF3B3B]" icon={Heart} />
                <StatBox title="Episodios Vistos" value={`${stats.episodes}`} color="text-[#FF5555]" icon={Tv} />
                <StatBox title="Total en Horas" value={`${stats.hours} hs`} color="text-[#FF3B3B]" icon={Hourglass} />
                <StatBox title="Total en Días" value={`${stats.days}`} color="text-[#FF9B9B]" icon={CalendarDays} />
                <StatBox title="Total en Minutos" value={`${stats.minutes} min`} color="text-[#FF7777]" icon={Timer} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <PodiumCard title="Géneros Favoritos" data={stats.topGenres} />
              <PodiumCard title="Estudios Favoritos" data={stats.topStudios} />
            </div>

            <AchievementGallery unlockedAchievements={unlockedAchievements} />
          </div>

          <AnimeGrid animes={animes} onRemove={handleRemove} />
        </div>

      </div>
    </div>
  );
};