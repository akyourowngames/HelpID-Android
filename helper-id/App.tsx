import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { ProductPage } from './components/ProductPage';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { StickyCTA } from './components/StickyCTA';
import { EmergencyProfilePage } from './components/EmergencyProfilePage';
import { TermsOfService } from './components/TermsOfService';

import { PrivacyAndCookies } from './components/PrivacyAndCookies';

import { Mission } from './components/Mission';

const MarketingSite: React.FC = () => {
  const location = useLocation();
  const showStickyCTA = location.pathname !== '/product';

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-black selection:bg-brand-yellow selection:text-brand-black flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-and-cookies" element={<PrivacyAndCookies />} />
          <Route path="/mission" element={<Mission />} />
        </Routes>
      </main>
      <Footer />
      {showStickyCTA && (
        <StickyCTA
          onClick={() => {
            // This is a bit of a hack, we should ideally use react-router-dom's navigation
            // but for now, this will work.
            window.location.href = '/product';
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
      <Route path="/*" element={<MarketingSite />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;