import React, { useState, useEffect } from 'react';
import { Navbar, SideNav, Footer } from './components/Layout';
import Home from './pages/Home';
import Reserve from './pages/Reserve';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    
    // Custom event for internal navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const renderPage = () => {
    if (currentPath === '/reserve' || currentHash === '#ai') {
      return <Reserve />;
    }
    return <Home />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#010409]">
      <Navbar />
      <SideNav />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}
