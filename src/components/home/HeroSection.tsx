import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AnimeScrollCanvas } from '../../ui/AnimeScrollCanvas';

export const HeroSection = () => (
  <AnimeScrollCanvas
    totalFrames={89}
    baseUrl="/sequence/"
    framePrefix="frame_"
    fileExtension=".webp"
    padLength={4}
    scrollDistance="400vh"
  >
    <div className="w-full h-full flex flex-col justify-center items-start pl-6 md:pl-16 lg:pl-[8vw] relative z-10">
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6 opacity-90">
          <span className="w-10 h-[2px] bg-[#FF3B3B] shadow-[0_0_10px_rgba(255,59,59,0.8)]" />
        </div>
        <h1 className="flex flex-col gap-2 mb-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <span className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-[#FF3B3B] tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(255,59,59,0.5)]">
            Welcome To
          </span>
          <span className="text-6xl md:text-8xl lg:text-[8.5rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tighter leading-[0.85] uppercase mt-1">
            KIROKU
          </span>
        </h1>
        <Link
          to="/search"
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF3B3B] text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-[#FF5555] transition-colors shadow-[0_0_28px_rgba(255,59,59,0.4)] hover:shadow-[0_0_36px_rgba(255,59,59,0.55)]"
        >
          <Search size={17} />
          Iniciar Búsqueda
        </Link>
      </div>
    </div>
  </AnimeScrollCanvas>
);
