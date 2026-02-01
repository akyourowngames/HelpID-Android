import React from 'react';
import { Hero } from './Hero';
import { FeatureGrid } from './FeatureGrid';
import { TextSection } from './TextSection';
import { FAQ } from './FAQ';

export const Home: React.FC = () => {
  return (
    <>
        <Hero />
        <TextSection />
        
        {/* Full width image banner */}
        <section className="w-full h-[60vh] md:h-[80vh] my-12 relative overflow-hidden">
             <img 
                src="https://picsum.photos/1920/1080?random=20" 
                alt="Helping hand" 
                className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <h2 className="text-white text-4xl md:text-7xl font-medium tracking-tight text-center px-4">
                    Speak when you can't
                </h2>
             </div>
        </section>

        <FeatureGrid />

        {/* Design Focus Section */}
        <section className="py-24 px-4 bg-gray-50 my-12" aria-labelledby="importance-heading">
            <h2 id="importance-heading" className="text-[10vw] leading-none font-medium text-center mb-12 tracking-tight">
                Why Helper ID is important
            </h2>
            <div 
                className="flex gap-4 overflow-x-auto no-scrollbar pb-8 px-4 md:px-12 snap-x focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-xl"
                tabIndex={0}
                role="region"
                aria-label="Important features gallery"
            >
                <div className="min-w-[85vw] md:min-w-[30vw] h-[60vh] md:h-[70vh] bg-white rounded-3xl overflow-hidden relative snap-center shadow-sm">
                    <img src={`https://picsum.photos/600/900?random=31`} className="w-full h-2/3 object-cover" alt="Medical response illustration" />
                    <div className="p-8">
                        <h4 className="text-xl font-bold mb-2">Reduces delay in response</h4>
                        <p className="text-gray-600">Immediate access to your medical data means faster, more accurate treatment by first responders.</p>
                    </div>
                </div>
                <div className="min-w-[85vw] md:min-w-[30vw] h-[60vh] md:h-[70vh] bg-white rounded-3xl overflow-hidden relative snap-center shadow-sm">
                    <img src={`https://picsum.photos/600/900?random=32`} className="w-full h-2/3 object-cover" alt="Strangers helping illustration" />
                    <div className="p-8">
                        <h4 className="text-xl font-bold mb-2">Helps strangers help you</h4>
                        <p className="text-gray-600">Give good samaritans the confidence and information they need to act correctly in an emergency.</p>
                    </div>
                </div>
                <div className="min-w-[85vw] md:min-w-[30vw] h-[60vh] md:h-[70vh] bg-white rounded-3xl overflow-hidden relative snap-center shadow-sm">
                    <img src={`https://picsum.photos/600/900?random=33`} className="w-full h-2/3 object-cover" alt="Family connection illustration" />
                    <div className="p-8">
                        <h4 className="text-xl font-bold mb-2">Connects families faster</h4>
                        <p className="text-gray-600">Instantly notify your emergency contacts so your loved ones can be by your side when you need them.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Voting / Interactive Section */}
        <section className="py-32 text-center bg-[#E0F2F1]">
             <div className="max-w-2xl mx-auto px-4">
                <div className="w-24 h-24 bg-brand-black rounded-[2rem] mx-auto mb-8 animate-pulse flex items-center justify-center" aria-hidden="true">
                    <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <h2 className="text-4xl md:text-5xl font-medium mb-12">Emergencies create panic.<br/>Be prepared with Helper ID.</h2>
                <button className="bg-brand-black text-white px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2">
                    Get Protected
                </button>
             </div>
        </section>

        <FAQ />
    </>
  );
};