import React from 'react';
import { Heart, Zap, Gift, Users, ShieldCheck, Globe, Award } from 'lucide-react';

export const Mission: React.FC = () => {
  return (
    <div className="pt-32 pb-20 animate-fade-in-up min-h-screen">
      
      <section className="px-6 md:px-12 max-w-5xl mx-auto text-center mb-24">
        <h1 className="text-6xl md:text-8xl font-medium tracking-tighter text-brand-black mb-8 animate-reveal">
          Our Mission
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto animate-reveal [animation-delay:200ms]">
          To provide help at the right time, fostering a global community of kindness and humanity through technology.
        </p>
      </section>

      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-brand-black/20 hover:shadow-lg transition-all duration-300">
               <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-yellow transition-colors duration-300">
                  <Zap className="w-7 h-7 text-brand-black" />
               </div>
               <h4 className="text-2xl font-bold mb-4">The Golden Hour</h4>
               <p className="text-gray-500 leading-relaxed">
                  In emergency medicine, the "golden hour" refers to the period of time following a traumatic injury during which there is the highest likelihood that prompt medical and surgical treatment will prevent death. Our mission is to make the most of this critical time.
               </p>
            </div>
            <div className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-brand-black/20 hover:shadow-lg transition-all duration-300">
               <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-yellow transition-colors duration-300">
                  <Heart className="w-7 h-7 text-red-500" />
               </div>
               <h4 className="text-2xl font-bold mb-4">A Community of Kindness</h4>
               <p className="text-gray-500 leading-relaxed">
                  We believe that technology can be a powerful force for good. Helper ID is a platform that encourages and rewards acts of kindness. We are building a community where helping others is a core value, and where every user is a potential hero.
               </p>
            </div>
            <div className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-brand-black/20 hover:shadow-lg transition-all duration-300">
               <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-yellow transition-colors duration-300">
                  <Gift className="w-7 h-7 text-green-500" />
               </div>
               <h4 className="text-2xl font-bold mb-4">Rewarding Humanity</h4>
               <p className="text-gray-500 leading-relaxed">
                  We are exploring innovative ways to reward users for their positive contributions to the community. This could include digital collectibles, exclusive features, or partnerships with other organizations that share our values.
               </p>
            </div>
        </div>
      </section>

      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-32">
        <div className="bg-brand-black text-white rounded-[2.5rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
                <h2 className="text-5xl md:text-7xl font-medium tracking-tighter mb-8">
                    More than an App.<br/> A Movement.
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                    We envision a world where everyone can feel safe, knowing that help is always within reach. A world where technology connects us, protects us, and empowers us to be there for each other. Join us in making this vision a reality.
                </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-6">
                <div className="bg-white/10 p-6 rounded-2xl flex items-center gap-4">
                    <ShieldCheck className="w-8 h-8 text-brand-yellow" />
                    <span className="font-medium">Safety</span>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl flex items-center gap-4">
                    <Globe className="w-8 h-8 text-brand-yellow" />
                    <span className="font-medium">Community</span>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl flex items-center gap-4">
                    <Award className="w-8 h-8 text-brand-yellow" />
                    <span className="font-medium">Kindness</span>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl flex items-center gap-4">
                    <Users className="w-8 h-8 text-brand-yellow" />
                    <span className="font-medium">Humanity</span>
                </div>
            </div>
        </div>
      </section>
      
      <section className="px-6 md:px-12 max-w-5xl mx-auto text-center">
        <h2 className="text-5xl font-medium text-brand-black mb-8">Join the Movement</h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          We are more than just an app; we are a movement to create a safer, more connected world. Join us on our mission to empower individuals, strengthen communities, and save lives.
        </p>
        <button className="bg-brand-black text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto group">
            Get Helper ID 
            <Users className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

    </div>
  );
};
