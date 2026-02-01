import React from 'react';
import { Maximize2, PlayCircle } from 'lucide-react';
import { ROBOT_NAME } from '../constants';

const GridCard: React.FC<{
  title?: string;
  desc?: string;
  img: string;
  badge?: string;
  dark?: boolean;
  className?: string;
  aspect?: string;
}> = ({ title, desc, img, badge, dark, className, aspect = "aspect-square" }) => (
  <div className={`relative group rounded-3xl overflow-hidden ${className} ${aspect} bg-gray-100`} role="group" aria-label={title || "Feature card"}>
    <img 
      src={img} 
      alt={title || "Feature illustration"} 
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
    
    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" aria-hidden="true" />

    {badge && (
      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium border border-white/20">
        {badge}
      </div>
    )}
    
    <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
        <Maximize2 className="w-5 h-5 drop-shadow-md" />
    </div>

    {(title || desc) && (
      <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full bg-gradient-to-t from-black/60 via-black/20 to-transparent">
        {title && <h3 className="text-white text-2xl md:text-3xl font-medium mb-2 leading-tight">{title}</h3>}
        {desc && <p className="text-white/90 text-sm md:text-base leading-relaxed">{desc}</p>}
      </div>
    )}
  </div>
);

export const FeatureGrid: React.FC = () => {
  return (
    <section className="px-4 py-20 max-w-[95%] md:max-w-[90%] mx-auto" aria-label="Features">
        
        {/* Intro Text Block */}
        <div className="mb-24 md:w-3/4 lg:w-2/3">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-8">
                Get the right help at the right time when you are unable to speak or act.
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
                Helper ID provides instant access to critical information when it matters most.
            </p>
        </div>

        {/* Story Block */}
        <div className="w-full bg-white rounded-3xl p-2 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center">
             <div className="p-8 md:p-12 md:w-1/2">
                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                    Emergencies create panic and confusion. Phones are usually locked. Helper ID ensures correct medical decisions and connects families faster.
                </p>
             </div>
             <div className="relative md:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden m-2">
                <img src="https://picsum.photos/800/600?random=15" className="w-full h-full object-cover" alt="Emergency context" />
                <button 
                    className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 rounded-2xl"
                    aria-label="See how it works"
                >
                    <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 border border-white/30 group-hover:scale-105 transition-transform">
                        <PlayCircle className="text-white w-6 h-6" aria-hidden="true" />
                        <span className="text-white font-medium">See how it works</span>
                    </div>
                </button>
             </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            <div role="listitem" className="md:col-span-2 lg:col-span-2">
                <GridCard 
                    img="https://picsum.photos/600/800?random=11"
                    title="Instant Identity"
                    className="w-full h-full aspect-[4/3] md:aspect-auto"
                    badge="Identity"
                    desc="Strangers can know who you are immediately."
                />
            </div>
            <div role="listitem" className="bg-[#f2f0eb] rounded-3xl p-8 flex flex-col justify-center">
                <span className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-4">Critical Info</span>
                <p className="text-lg text-gray-800">
                    Access blood group, allergies, and medical conditions instantly to ensure correct medical decisions.
                </p>
            </div>

            <div role="listitem">
                <GridCard 
                    img="https://picsum.photos/600/800?random=12"
                    className="aspect-[3/4]"
                    title="Emergency Contacts"
                    badge="Connect Faster"
                />
            </div>
            <div role="listitem">
                <GridCard 
                    img="https://picsum.photos/600/800?random=13"
                    className="aspect-[3/4]"
                    title="Direct 112 Calling"
                    badge="Emergency"
                />
            </div>
            <div role="listitem">
                <GridCard 
                    img="https://picsum.photos/600/800?random=14"
                    className="aspect-[3/4]"
                    title="Works Offline"
                    badge="Reliable"
                />
            </div>
        </div>

        {/* Learning Section (Repurposed for Privacy) */}
        <div className="mt-40 mb-20 text-center relative">
            <h2 className="text-[12vw] leading-none font-medium tracking-tighter text-brand-black opacity-10" aria-hidden="true">
                PRIVACY
            </h2>
            <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-4xl md:text-6xl font-medium">Privacy-First Approach</h3>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100">
                <h4 className="text-lg font-bold mb-4">You are in control</h4>
                <p className="text-gray-600 leading-relaxed">
                    Helper ID is built with a privacy‑first, offline‑ready, and user‑controlled approach. Your data stays on your device and is only shared when you need it to be.
                </p>
             </div>
             <GridCard 
                img="https://picsum.photos/800/600?random=16"
                title="Accessible when locked"
                badge="NFC & QR"
                className="aspect-video"
             />
        </div>

    </section>
  );
};