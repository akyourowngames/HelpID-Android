import React, { useState, useEffect } from 'react';
import { APP_NAME, ROBOT_NAME } from '../constants';
import { ArrowRight, Twitter, Youtube, Instagram, Disc } from 'lucide-react';

const FOOTER_MESSAGES = [
  "Get the right help at the right time.",
  "Your voice when you can't speak.",
  "Safety. Clarity. Speed.",
  "Privacy-first emergency assistance."
];

export const Footer: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % FOOTER_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-brand-bg relative z-10" role="contentinfo">
      
      {/* Yellow Action Bar */}
      <div className="bg-brand-yellow w-full py-24 md:py-32 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="max-w-2xl relative z-10 flex flex-col items-center">
            
            {/* Animated Text Container */}
            <div className="h-24 md:h-28 w-full relative mb-8 flex items-center justify-center overflow-hidden" aria-live="polite">
                {FOOTER_MESSAGES.map((msg, i) => {
                    const isCurrent = i === msgIndex;
                    const isPrev = i === (msgIndex - 1 + FOOTER_MESSAGES.length) % FOOTER_MESSAGES.length;
                    
                    let transformClass = '-translate-y-full opacity-0';
                    let transitionClass = '';

                    if (isCurrent) {
                        transformClass = 'translate-y-0 opacity-100';
                        transitionClass = 'transition-all duration-700 ease-out';
                    } else if (isPrev) {
                        transformClass = 'translate-y-full opacity-0';
                        transitionClass = 'transition-all duration-700 ease-in';
                    }

                    return (
                        <p 
                            key={i} 
                            className={`absolute w-full text-brand-black font-medium text-lg md:text-2xl leading-tight px-4 ${transformClass} ${transitionClass}`}
                        >
                            {msg}
                        </p>
                    );
                })}
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-3 text-xs md:text-sm font-medium opacity-80 mb-12">
                <span className="border border-black/10 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 transition-colors hover:bg-white/20 hover:border-black/20 cursor-default">
                    Always Ready
                </span>
                <span className="border border-black/10 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 transition-colors hover:bg-white/20 hover:border-black/20 cursor-default">
                    Offline First
                </span>
                <span className="border border-black/10 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 transition-colors hover:bg-white/20 hover:border-black/20 cursor-default">
                    Secure
                </span>
            </div>

            {/* Spinning Icon */}
            <div className="relative group cursor-pointer" aria-hidden="true">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100 duration-500"></div>
                <Disc className="w-16 h-16 md:w-20 md:h-20 text-brand-black animate-spin-slow relative z-10" strokeWidth={1} />
            </div>

        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-white pt-20 pb-32 md:pb-24 px-6 md:px-12 rounded-t-[2.5rem] -mt-8 relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
            
            <div className="md:w-1/3">
                <h4 className="font-bold text-lg mb-8">{APP_NAME}, Personal Emergency Assistant</h4>
                
                <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                     <label htmlFor="newsletter-email" className="text-gray-500 text-sm">Stay updated with safety tips</label>
                     <div className="flex items-center gap-4 bg-gray-50 p-2 pl-4 rounded-full w-full md:w-auto max-w-sm border border-gray-200 focus-within:ring-1 focus-within:ring-brand-black/20 transition-all">
                        <input 
                            id="newsletter-email"
                            type="email" 
                            placeholder="Sign up to our newsletter" 
                            className="bg-transparent outline-none flex-grow text-sm text-brand-black placeholder-gray-400"
                        />
                        <button type="submit" className="bg-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-shadow border border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black">
                            Subscribe
                        </button>
                     </div>
                </form>
            </div>

            <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                <div>
                    <h5 className="font-bold mb-6 text-brand-black">Features</h5>
                    <ul className="space-y-4 text-gray-500">
                        <li><a href="#" className="hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">How it works</a></li>
                        <li><a href="#" className="hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">Emergency Mode</a></li>
                        <li><a href="#" className="hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">NFC & QR</a></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-bold mb-6 text-brand-black">About</h5>
                    <ul className="space-y-4 text-gray-500">
                        <li><a href="#" className="hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">Mission</a></li>
                        <li><a href="#" className="hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">Safety</a></li>
                        <li><a href="#" className="hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-bold mb-6 text-brand-black">Social</h5>
                    <ul className="space-y-4 text-gray-500">
                        <li>
                            <a href="#" className="flex items-center gap-2 hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">
                                <Instagram className="w-4 h-4" aria-hidden="true"/> Instagram
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center gap-2 hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">
                                <Twitter className="w-4 h-4" aria-hidden="true"/> X (Twitter)
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center gap-2 hover:text-brand-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">
                                <Youtube className="w-4 h-4" aria-hidden="true"/> YouTube
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between text-xs text-gray-400 gap-4">
            <div>
                © 2026 {APP_NAME} Inc
            </div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">Terms of Service</a>
                <a href="#" className="hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm">Privacy and Cookies</a>
            </div>
        </div>
      </div>
    </footer>
  );
};