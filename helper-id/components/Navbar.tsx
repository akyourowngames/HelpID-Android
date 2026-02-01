import React, { useState, useEffect } from 'react';
import { Menu, X, Disc } from 'lucide-react';
import { APP_NAME } from '../constants';

interface NavbarProps {
    onNavigate?: (page: 'home' | 'product' | 'about') => void;
    activePage?: 'home' | 'product' | 'about';
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage = 'home' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: 'home' | 'product' | 'about') => {
      if (onNavigate) {
          onNavigate(page);
          setMobileMenuOpen(false);
          window.scrollTo(0, 0);
      }
  };

  return (
    <>
      <nav 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[90%] md:w-auto`}
        aria-label="Main navigation"
      >
        <div className={`
          flex items-center justify-between 
          bg-white/80 backdrop-blur-md 
          rounded-full px-6 py-3 
          shadow-sm border border-gray-100
          transition-all duration-300
          ${isScrolled ? 'md:px-6 md:py-3' : 'md:px-8 md:py-4'}
          md:min-w-[300px]
        `}>
          {/* Logo Section */}
          <button 
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-lg p-1"
          >
             <Disc className="w-6 h-6 text-brand-black animate-spin-slow" aria-hidden="true" />
             <span className="font-bold tracking-wider text-sm md:text-base">{APP_NAME}</span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 ml-12">
             <button 
                onClick={() => handleNav('home')}
                className={`text-sm font-medium transition-colors hover:text-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm ${activePage === 'home' ? 'text-brand-black' : 'text-gray-500'}`}
             >
                Home
             </button>
             <button 
                onClick={() => handleNav('product')}
                className={`text-sm font-medium transition-colors hover:text-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm ${activePage === 'product' ? 'text-brand-black' : 'text-gray-500'}`}
             >
                Product
             </button>
             <button 
                onClick={() => handleNav('about')}
                className={`text-sm font-medium transition-colors hover:text-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-sm ${activePage === 'about' ? 'text-brand-black' : 'text-gray-500'}`}
             >
                About
             </button>
          </div>

          {/* Hamburger / Menu Trigger */}
          <button 
            className="md:hidden ml-8 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile/Full Screen Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-bg/95 backdrop-blur-xl pt-32 px-6 animate-fade-in-up">
          <div className="flex flex-col gap-6 text-center">
            <button 
                className="text-3xl font-light hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-lg" 
                onClick={() => handleNav('home')}
            >
                Home
            </button>
            <button 
                className="text-3xl font-light hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-lg" 
                onClick={() => handleNav('product')}
            >
                Product
            </button>
            <button 
                className="text-3xl font-light hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black rounded-lg" 
                onClick={() => handleNav('about')}
            >
                About
            </button>
            <div className="mt-8">
                <button 
                    onClick={() => handleNav('product')}
                    className="bg-brand-black text-white px-8 py-4 rounded-full text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-black"
                >
                    Get App
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};