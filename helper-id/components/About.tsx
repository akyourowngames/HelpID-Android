import React from 'react';
import { Heart, Shield, Globe, Activity, Users, ArrowUpRight } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="pt-32 pb-20 animate-fade-in-up min-h-screen">
      
      {/* Hero - Typography focused */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24 md:mb-32">
        <h1 className="text-[12vw] leading-[0.85] font-medium tracking-tighter text-brand-black mb-12">
          <div className="overflow-hidden">
             <span className="block animate-reveal translate-y-full">Human</span>
          </div>
          <div className="overflow-hidden">
             <span className="block text-gray-300 animate-reveal translate-y-full [animation-delay:150ms]">Safety</span>
          </div>
          <div className="overflow-hidden">
             <span className="block animate-reveal translate-y-full [animation-delay:300ms]">First.</span>
          </div>
        </h1>
        <div className="flex flex-col md:flex-row gap-12 items-start border-t border-brand-black/10 pt-12">
           <p className="text-2xl md:text-3xl font-medium leading-tight md:w-1/2 text-brand-black">
             We are building the global standard for personal emergency identification. Because when seconds count, information saves lives.
           </p>
           <div className="md:w-1/2 text-gray-500 text-lg space-y-6 leading-relaxed">
              <p>
                Helper ID was born from a simple realization: our phones are our lifelines, but in a true emergency, they are often locked black boxes.
              </p>
              <p>
                We set out to create a seamless bridge between you and the people trying to help you—whether that's a paramedic, a police officer, or a kind stranger on the street.
              </p>
           </div>
        </div>
      </section>

      {/* Visual Break / Manifesto */}
      <section className="bg-brand-black text-white py-24 md:py-32 px-6 rounded-[2.5rem] md:rounded-[3.5rem] mx-4 mb-32 relative overflow-hidden shadow-2xl">
         {/* Background Elements */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center mb-8 text-brand-black shadow-lg shadow-brand-yellow/20">
                  <Heart className="w-10 h-10 fill-current" />
               </div>
               <h2 className="text-4xl md:text-6xl font-medium mb-8 tracking-tight">The problem <br/> we solve.</h2>
               <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-lg">
                  Every year, millions of emergency responses are delayed because first responders lack critical medical history or identification. Allergies are missed. Conditions are unknown. Loved ones aren't notified.
               </p>
               <p className="text-2xl font-medium text-white border-l-4 border-brand-yellow pl-6 py-2">
                  We are changing that statistic.
               </p>
            </div>
            
            <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:bg-white/15 transition-colors">
                        <span className="block text-4xl md:text-5xl font-bold text-brand-yellow mb-2 tracking-tighter">45%</span>
                        <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">Faster ID Time</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:bg-white/15 transition-colors mt-8 lg:mt-16">
                        <span className="block text-4xl md:text-5xl font-bold text-brand-yellow mb-2 tracking-tighter">10k+</span>
                        <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">Lives Protected</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:bg-white/15 transition-colors">
                        <span className="block text-4xl md:text-5xl font-bold text-brand-yellow mb-2 tracking-tighter">100%</span>
                        <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">Private & Local</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:bg-white/15 transition-colors mt-8 lg:mt-16">
                        <span className="block text-4xl md:text-5xl font-bold text-brand-yellow mb-2 tracking-tighter">24/7</span>
                        <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">Peace of Mind</span>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Values */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-32">
         <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-200 pb-8">
            <h3 className="text-4xl md:text-5xl font-medium tracking-tight">Our Core Values</h3>
            <p className="text-gray-500 mt-4 md:mt-0 max-w-md text-right">Principles that guide every decision we make.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-brand-black/20 hover:shadow-lg transition-all duration-300">
               <div className="w-14 h-14 bg-[#FDFBF7] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-yellow transition-colors duration-300">
                  <Shield className="w-7 h-7 text-brand-black" />
               </div>
               <h4 className="text-2xl font-bold mb-4">Privacy is not optional</h4>
               <p className="text-gray-500 leading-relaxed">
                  We believe health data belongs to the user. That's why Helper ID is offline-first. No cloud databases to hack. No tracking. Just you and your data.
               </p>
            </div>
            <div className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-brand-black/20 hover:shadow-lg transition-all duration-300">
               <div className="w-14 h-14 bg-[#FDFBF7] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-yellow transition-colors duration-300">
                  <Globe className="w-7 h-7 text-brand-black" />
               </div>
               <h4 className="text-2xl font-bold mb-4">Universal Design</h4>
               <p className="text-gray-500 leading-relaxed">
                  Emergencies happen to everyone, everywhere. We design for accessibility, ensuring our app works for the elderly, the disabled, and across language barriers.
               </p>
            </div>
            <div className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-brand-black/20 hover:shadow-lg transition-all duration-300">
               <div className="w-14 h-14 bg-[#FDFBF7] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-yellow transition-colors duration-300">
                  <Activity className="w-7 h-7 text-brand-black" />
               </div>
               <h4 className="text-2xl font-bold mb-4">Speed saves lives</h4>
               <p className="text-gray-500 leading-relaxed">
                  We obsess over milliseconds. From app launch to NFC read times, every interaction is optimized for high-stress, low-time environments.
               </p>
            </div>
         </div>
      </section>

       {/* Team/Join */}
      <section className="px-4 mb-24">
        <div className="bg-[#E0F2F1] rounded-[3rem] max-w-7xl mx-auto py-24 px-6 md:px-20 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_white_0%,_transparent_60%)] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-semibold mb-8 shadow-sm text-teal-800">
                    <Users className="w-4 h-4" />
                    <span>We are hiring</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-medium mb-8 tracking-tighter">Join the mission.</h2>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                    We are a small, dedicated team of designers, engineers, and paramedics working to make the world safer.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {[40, 41, 42, 43].map((id) => (
                        <div key={id} className="w-16 h-16 rounded-full bg-white border-4 border-white overflow-hidden shadow-md hover:-translate-y-2 transition-transform duration-300">
                        <img src={`https://picsum.photos/100/100?random=${id}`} alt="Team member" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="w-16 h-16 rounded-full bg-brand-black border-4 border-white overflow-hidden shadow-md flex items-center justify-center text-white font-medium text-xs hover:-translate-y-2 transition-transform duration-300">
                    You?
                    </div>
                </div>
                <button className="bg-brand-black text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                    View Open Positions <ArrowUpRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      </section>

    </div>
  );
};