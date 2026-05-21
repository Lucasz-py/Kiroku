import { X, Loader2, Mail, Lock, User, AtSign } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InputField = ({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  icon: React.ElementType;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
}) => (
  <div>
    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative">
      <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full bg-[#0D0F15] border border-[#FF3B3B]/15 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF3B3B]/50 focus:ring-1 focus:ring-[#FF3B3B]/20 transition-all placeholder:text-zinc-700"
      />
    </div>
  </div>
);

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);

  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        let loginEmail = identifier;

        if (!identifier.includes('@')) {
          const { data, error: searchError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', identifier)
            .maybeSingle();

          if (searchError || !data || !data.email) {
            throw new Error('Usuario no encontrado.');
          }

          loginEmail = data.email;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (signInError) throw signInError;

        onClose();

      } else {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle();

        if (existingUser) {
          throw new Error('Este nombre de usuario ya está en uso. Por favor, elige otro.');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });

        if (signUpError) throw signUpError;

        setMessage('¡Cuenta creada! Revisa tu correo electrónico para confirmar tu cuenta.');
      }
    } catch (err: unknown) {
      let errorMessage = 'Ocurrió un error inesperado.';
      if (err instanceof Error) errorMessage = err.message;

      if (errorMessage.includes('Invalid login credentials')) {
        setError('Contraseña incorrecta.');
      } else if (errorMessage.includes('User already registered')) {
        setError('Este correo ya está registrado.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setMessage(null);
    setIdentifier('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md m-4 animate-in fade-in zoom-in duration-200">
        {/* Glow ambiental superior */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-6 bg-[#FF3B3B] blur-2xl opacity-20 rounded-full pointer-events-none" />

        <div className="relative bg-[#11131A] border border-[#FF3B3B]/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Línea de acento superior */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/50 to-transparent" />

          <div className="p-8">
            {/* Header con logo y close */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 flex items-center justify-center shadow-[0_0_15px_rgba(255,59,59,0.15)]">
                  <span className="text-[#FF3B3B] font-black text-lg leading-none">K</span>
                </div>
                <div>
                  <div className="text-white font-black text-lg leading-tight tracking-tight">KIROKU</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Tu colección de anime</div>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="text-zinc-600 hover:text-white transition-colors bg-[#0D0F15] hover:bg-[#1A1C24] border border-[#FF3B3B]/10 hover:border-[#FF3B3B]/30 p-2 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="bg-[#0D0F15] border border-[#FF3B3B]/10 rounded-xl p-1 flex mb-7">
              <button
                type="button"
                onClick={() => !isLogin && toggleMode()}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                  isLogin
                    ? 'bg-[#FF3B3B]/10 text-white border border-[#FF3B3B]/25 shadow-[0_0_10px_rgba(255,59,59,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => isLogin && toggleMode()}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                  !isLogin
                    ? 'bg-[#FF3B3B]/10 text-white border border-[#FF3B3B]/25 shadow-[0_0_10px_rgba(255,59,59,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Mensajes de error/éxito */}
            {error && (
              <div className="mb-5 p-3 bg-[#FF3B3B]/8 border border-[#FF3B3B]/30 rounded-xl text-[#FF7777] text-sm text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-5 p-3 bg-emerald-500/8 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isLogin ? (
                <InputField
                  icon={AtSign}
                  label="Usuario o Correo Electrónico"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder=""
                  required
                />
              ) : (
                <>
                  <InputField
                    icon={User}
                    label="Nombre de Usuario"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@user"
                    required
                  />
                  <InputField
                    icon={Mail}
                    label="Correo Electrónico"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Contraseña</label>
                  {isLogin && (
                    <button type="button" className="text-[11px] text-[#FF7777]/70 hover:text-[#FF7777] transition-colors font-bold uppercase tracking-wider">
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-[#0D0F15] border border-[#FF3B3B]/15 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF3B3B]/50 focus:ring-1 focus:ring-[#FF3B3B]/20 transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#FF3B3B] text-white font-black py-3.5 rounded-xl hover:bg-[#e02d2d] transition-all shadow-[0_0_20px_rgba(255,59,59,0.25)] hover:shadow-[0_0_30px_rgba(255,59,59,0.4)] mt-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {isLogin ? 'Entrar' : 'Crear Cuenta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
