import type { ChangeEvent } from 'react';
import { Loader2, Camera, Edit2, X, LogOut } from 'lucide-react';
import type { UserProfile } from '../../types/profile';

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditingBio: boolean;
  newBio: string;
  uploadingAvatar: boolean;
  onBioChange: (value: string) => void;
  onEditBio: () => void;
  onBioSave: () => void;
  onBioCancel: () => void;
  onAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSignOut: () => void;
}

export const ProfileHeader = ({
  profile, isEditingBio, newBio, uploadingAvatar,
  onBioChange, onEditBio, onBioSave, onBioCancel, onAvatarUpload, onSignOut,
}: ProfileHeaderProps) => (
  <div className="bg-[#11131A]/90 backdrop-blur-xl p-8 mb-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8 rounded-2xl border border-[#FF3B3B]/20">
    <div className="flex flex-col md:flex-row items-center md:items-start gap-10 w-full">
      <div className="relative shrink-0">
        <div className="w-40 h-40 md:w-52 md:h-52 bg-[#11131A] flex items-center justify-center text-6xl md:text-7xl font-black text-white rounded-xl border border-[#FF3B3B]/20 overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            profile.username?.charAt(0).toUpperCase()
          )}
        </div>
        <label className="absolute bottom-2 right-2 bg-[#FF3B3B] text-white p-3.5 cursor-pointer hover:bg-[#FF6B6B] transition-colors rounded-lg shadow-lg">
          {uploadingAvatar ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
          <input type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} disabled={uploadingAvatar} />
        </label>
      </div>

      <div className="flex-1 text-center md:text-left pt-2 md:pt-6 w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-1 tracking-tight">
          {profile.username}
        </h1>
        
        {/* --- CORREO ACTUALIZADO (Tipografía limpia) --- */}
        <p className="text-zinc-500 font-sans font-medium mb-6 text-sm">
          {profile.email}
        </p>

        <div className="bg-[#11131A]/80 p-5 rounded-lg border-l-2 border-[#FF3B3B]/30 hover:border-[#FF3B3B]/70 transition-colors">
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

    <button
      onClick={onSignOut}
      className="shrink-0 flex items-center gap-2 px-6 py-3.5 bg-[#11131A] hover:bg-[#FF3B3B]/10 text-zinc-500 hover:text-[#FF3B3B] border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/50 transition-all font-bold text-xs uppercase tracking-wider rounded-lg mt-4 md:mt-4"
    >
      Cerrar Sesión <LogOut size={16} />
    </button>
  </div>
);