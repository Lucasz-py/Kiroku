import { Link } from 'react-router-dom';

interface MetadataBoxProps {
  label: string;
  value: string | number;
  isLink?: boolean;
  link?: string;
}

export const MetadataBox = ({ label, value, isLink, link }: MetadataBoxProps) => (
  <div className="bg-[#1A1C24] p-4 rounded-xl border border-[#FF3B3B]/15 flex flex-col items-center justify-center text-center transition-all hover:bg-[#1A1C24]/80 hover:border-[#FF3B3B]/40 group">
    <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1.5 group-hover:text-[#FF3B3B]/70 transition-colors">
      {label}
    </span>
    {isLink && link
      ? <Link to={link} className="text-lg font-black text-white hover:text-[#FF3B3B] transition-colors truncate w-full px-2">{value}</Link>
      : <span className="text-lg font-black text-white">{value}</span>
    }
  </div>
);
