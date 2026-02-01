import React from 'react';
import { ROBOT_NAME } from '../constants';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center pt-32 pb-12 px-4 overflow-hidden">
      
      {/* Intro Text */}
      <div className="text-center z-10 mb-8 md:mb-12 animate-fade-in-up">
        <h3 className="text-sm md:text-base text-gray-500 font-medium mb-2 tracking-wide uppercase">
          Personal Emergency Assistance
        </h3>
        <p className="text-xs text-gray-400 mb-6">Get the right help at the right time</p>
        <h1 className="text-6xl md:text-8xl lg:text-[9rem] leading-none font-medium tracking-tighter text-brand-black">
          Your voice when <br className="hidden md:block" /> you can't speak
        </h1>
      </div>

      {/* Hero Image/Video Container */}
      <div className="relative w-full max-w-[95%] md:max-w-7xl h-[60vh] md:h-[75vh] rounded-4xl md:rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-700">
        <img 
          src="https://picsum.photos/1600/900?grayscale" 
          alt="Emergency assistance" 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Scrolling Indicator */}
      <div className="hidden md:block absolute bottom-8 right-8 mix-blend-difference text-white">
         <div className="h-24 w-12 border border-white/20 rounded-full flex justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-bounce mt-2"></div>
         </div>
      </div>

    </section>
  );
};