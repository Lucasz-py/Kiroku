import { Link } from 'react-router-dom';
import { Search, Trophy, CalendarDays, BookOpen, ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Busca tu primer anime',
    desc: 'Explora el catálogo, filtra por género, estudio o año, y encuentra algo que te llame la atención.',
    cta: 'Ir al buscador',
    to: '/search',
    accent: 'from-[#FF3B3B]/20 to-transparent',
    border: 'border-[#FF3B3B]/30',
    btnClass: 'bg-[#FF3B3B] hover:bg-[#FF5555] text-white',
  },
  {
    num: '02',
    icon: Trophy,
    title: 'Descubre los más populares',
    desc: 'Mira el ranking de los animes mejor valorados y más populares de todos los tiempos.',
    cta: 'Ver el ranking',
    to: '/ranking/top',
    accent: 'from-amber-500/10 to-transparent',
    border: 'border-amber-500/20',
    btnClass: 'bg-[#11131A] hover:bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  {
    num: '03',
    icon: CalendarDays,
    title: 'Mira la temporada actual',
    desc: 'Entérate de qué animes se están emitiendo ahora mismo y no te pierdas los estrenos.',
    cta: 'Ver temporada',
    to: '/seasonal',
    accent: 'from-violet-500/10 to-transparent',
    border: 'border-violet-500/20',
    btnClass: 'bg-[#11131A] hover:bg-violet-500/10 text-violet-400 border border-violet-500/20',
  },
];

const HowItWorksCard = () => (
  <div className="bg-[#11131A] border border-[#FF3B3B]/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/20 to-transparent" />
    <div className="flex items-center gap-3 mb-6">
      <BookOpen size={16} className="text-[#FF3B3B]/60" />
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Cómo funciona Kiroku</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
      {[
        { step: '1', text: 'Busca un anime y abre su página de detalles' },
        { step: '2', text: 'Guárdalo como Mirando, Pendiente o Completado' },
        { step: '3', text: 'Tu perfil se actualiza con estadísticas y logros' },
      ].map(({ step, text }) => (
        <div key={step} className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-[#FF3B3B]/30 bg-[#FF3B3B]/5 flex items-center justify-center text-[#FF3B3B] font-black text-sm">
            {step}
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ProfileOnboarding = ({ username }: { username: string }) => (
  <div className="flex flex-col gap-6">

    {/* Bienvenida */}
    <div className="bg-[#11131A] border border-[#FF3B3B]/20 rounded-2xl p-8 md:p-10 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF3B3B]/30 to-transparent" />
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#FF3B3B]/[0.04] blur-3xl pointer-events-none" />
      <p className="text-xs font-bold uppercase tracking-widest text-[#FF3B3B]/60 mb-3">Bienvenido</p>
      <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
        Hola, <span className="text-[#FF3B3B]">{username}</span>
      </h2>
      <p className="text-zinc-400 text-base max-w-lg leading-relaxed">
        Tu lista está vacía. Empieza agregando animes para llevar el control de lo que ves y desbloquear estadísticas y logros.
      </p>
    </div>

    {/* Pasos */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {steps.map(({ num, icon: Icon, title, desc, cta, to, accent, border, btnClass }) => (
        <div
          key={num}
          className={`bg-[#11131A] border ${border} rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${accent} pointer-events-none`} />
          <div className="relative flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0D0F15] border border-[#FF3B3B]/10 flex items-center justify-center">
              <Icon size={18} className="text-zinc-400" />
            </div>
            <span className="text-4xl font-black text-white/[0.04] select-none leading-none">{num}</span>
          </div>
          <div className="relative flex-1">
            <h3 className="text-white font-black text-base mb-2">{title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
          </div>
          <Link
            to={to}
            className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${btnClass}`}
          >
            {cta} <ArrowRight size={13} />
          </Link>
        </div>
      ))}
    </div>

    {/* Cómo funciona */}
    <HowItWorksCard />
  </div>
);
