import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { ProductPage } from './components/ProductPage';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { StickyCTA } from './components/StickyCTA';
import { EmergencyProfilePage } from './components/EmergencyProfilePage';

const MarketingSite: React.FC = () => {
  const [view, setView] = useState<'home' | 'product' | 'about'>('home');

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-black selection:bg-brand-yellow selection:text-brand-black flex flex-col">
      <Navbar onNavigate={setView} activePage={view} />

      <main className="flex-grow">
        {view === 'home' && <Home />}
        {view === 'product' && <ProductPage />}
        {view === 'about' && <About />}
      </main>

      <Footer />
      {view !== 'product' && (
        <StickyCTA
          onClick={() => {
            setView('product');
            window.scrollTo(0, 0);
          }}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/e/:publicKey" element={<EmergencyProfilePage />} />
      <Route path="/" element={<MarketingSite />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;