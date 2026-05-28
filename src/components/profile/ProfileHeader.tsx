import { useState, type ChangeEvent } from 'react';
import { Loader2, Camera, Edit2, X, LogOut, Share2, Check, ImagePlus } from 'lucide-react';
import type { UserProfile } from '../../types/profile';

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditingBio: boolean;
  newBio: string;
  uploadingAvatar: boolean;
  uploadingBanner: boolean;
  onBioChange: (value: string) => void;
  onEditBio: () => void;
  onBioSave: () => void;
  onBioCancel: () => void;
  onAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onBannerUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSignOut: () => void;
}

export const ProfileHeader = ({
  profile, isEditingBio, newBio, uploadingAvatar, uploadingBanner,
  onBioChange, onEditBio, onBioSave, onBioCancel, onAvatarUpload, onBannerUpload, onSignOut,
}: ProfileHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/u/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
  <div className="relative mb-12 rounded-2xl border border-[#FF3B3B]/20 overflow-hidden">

    {/* Banner como fondo de toda la sección */}
    {profile.banner_url && (
      <img
        src={profile.banner_url}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}

    {/* Overlay oscuro para mantener legibilidad del contenido */}
    <div className={`absolute inset-0 ${profile.banner_url ? 'bg-[#0D0F15]/70 backdrop-blur-[2px]' : 'bg-[#11131A]'}`} />

    {/* Botón cambiar banner — esquina superior derecha */}
    <label className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-2 bg-[#0D0F15]/70 backdrop-blur-sm border border-white/10 text-zinc-300 hover:text-white hover:bg-[#0D0F15]/90 cursor-pointer transition-all rounded-lg text-xs font-bold uppercase tracking-widest">
      {uploadingBanner ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
      {uploadingBanner ? 'Subiendo...' : 'Cambiar banner'}
      <input type="file" accept="image/*" className="hidden" onChange={onBannerUpload} disabled={uploadingBanner} />
    </label>

    {/* Botón cerrar sesión — esquina inferior derecha */}
    <button
      onClick={onSignOut}
      title="Cerrar sesión"
      className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0F15]/70 backdrop-blur-sm hover:bg-[#FF3B3B]/10 text-zinc-500 hover:text-[#FF3B3B] border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 transition-all rounded-lg text-[10px] font-bold uppercase tracking-widest"
    >
      <LogOut size={12} /> Salir
    </button>

    {/* Contenido */}
    <div className="relative z-10 px-8 py-12 md:py-16 flex items-center gap-10">

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-32 h-32 md:w-44 md:h-44 bg-[#11131A] flex items-center justify-center text-5xl md:text-6xl font-black text-white rounded-xl border-4 border-[#0D0F15]/60 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.7)]">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            profile.username?.charAt(0).toUpperCase()
          )}
        </div>
        <label className="absolute bottom-1 right-1 bg-[#FF3B3B] text-white p-2.5 cursor-pointer hover:bg-[#FF6B6B] transition-colors rounded-lg shadow-lg">
          {uploadingAvatar ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          <input type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} disabled={uploadingAvatar} />
        </label>
      </div>

      {/* Info */}
      <div className="flex-1 text-center md:text-left max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-1 tracking-tight">
          {profile.username}
        </h1>

        <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
          <p className="text-zinc-400 font-sans font-medium text-sm">
            {profile.email}
          </p>
          {profile.username && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 hover:text-[#FF3B3B] uppercase tracking-widest transition-colors"
            >
              {copied ? <Check size={11} /> : <Share2 size={11} />}
              {copied ? '¡Copiado!' : 'Compartir perfil'}
            </button>
          )}
        </div>

        <div className="bg-[#0D0F15]/60 backdrop-blur-sm p-5 rounded-lg border-l-2 border-[#FF3B3B]/30 hover:border-[#FF3B3B]/70 transition-colors">
          {isEditingBio ? (
            <div>
              <textarea
                autoFocus
                value={newBio}
                onChange={e => onBioChange(e.target.value)}
                placeholder="Escribe algo sobre ti..."
                className="w-full bg-[#1A1C24] text-white p-3 focus:outline-none focus:ring-1 focus:ring-[#FF3B3B] border border-[#FF3B3B]/20 focus:border-[#FF3B3B] rounded-lg min-h-[80px] mb-3 text-xs md:text-sm placeholder:text-zinc-600"
                maxLength={160}
              />
              <div className="flex justify-end gap-2">
                <button onClick={onBioCancel} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg">
                  <X size={18} />
                </button>
                <button onClick={onBioSave} className="px-4 py-2 bg-[#FF3B3B] text-white hover:bg-[#FF6B6B] font-bold text-xs uppercase tracking-wider transition-colors rounded-lg">
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative pr-10 cursor-pointer" onClick={onEditBio}>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                {profile.bio ? profile.bio : 'Sin información. Haz clic para agregar una descripción.'}
              </p>
              <button className="absolute top-0 right-0 p-2 text-zinc-600 hover:text-[#FF3B3B] opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};