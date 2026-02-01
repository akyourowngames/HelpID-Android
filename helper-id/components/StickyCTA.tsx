import React from 'react';

interface StickyCTAProps {
    onClick?: () => void;
}

export const StickyCTA: React.FC<StickyCTAProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 w-[90%] md:w-auto pointer-events-none">
      <button 
        onClick={onClick}
        className="pointer-events-auto w-full bg-brand-yellow p-1 pr-2 rounded-full flex items-center justify-between gap-4 pl-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer group border border-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2"
        aria-label="Get Helper ID, download app"
      >
        <span className="font-medium text-brand-black text-sm md:text-base whitespace-nowrap">
          Get Helper ID
        </span>
        <div className="bg-white/30 px-4 py-2 rounded-full flex items-center gap-2 group-hover:bg-white/50 transition-colors">
          <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Download App</span>
          <div className="w-2 h-2 rounded-full bg-black animate-pulse" aria-hidden="true"></div>
        </div>
      </button>
    </div>
  );
};