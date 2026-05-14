import { Link } from 'react-router-dom';
import { AnimeScrollCanvas } from '../../ui/AnimeScrollCanvas';

const cyberClipCard = { clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' };

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
          className="group relative inline-flex items-center gap-6 px-4 py-3 bg-[#11131A] border border-[#FF3B3B]/40 hover:bg-[#FF3B3B] transition-colors duration-300 shadow-[0_0_15px_rgba(255,59,59,0.15)]"
          style={cyberClipCard}
        >
          <div
            className="flex items-center justify-center w-10 h-10 bg-[#0D0F15] transition-colors duration-500 group-hover:bg-[#11131A] shadow-inner"
            style={cyberClipCard}
          >
            <svg
              className="w-5 h-5 text-[#FF3B3B] transform transition-transform duration-500 group-hover:translate-x-1 group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <span className="text-white font-bold tracking-[0.2em] text-xs md:text-sm uppercase transition-colors duration-300 pr-4">
            Iniciar Búsqueda
          </span>
        </Link>
      </div>
    </div>
  </AnimeScrollCanvas>
);
