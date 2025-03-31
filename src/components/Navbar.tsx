import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import WalletDropdown from './WalletDropdown';

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => router.pathname === path;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Create', path: '/create' },
    { name: 'Mint', path: '/mint' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'DAO', path: '/dao' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-700 shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center justify-between w-full">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-3xl font-extrabold text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">TL2V</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200 ease-in-out ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Wallet dropdown - desktop */}
            <div className="hidden md:flex md:items-center">
              <WalletDropdown />
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mounted && (
        <>
          {/* Mobile menu overlay */}
          <div 
            className={`md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out ${
              isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={toggleMenu}
          />

          {/* Mobile menu panel */}
          <div 
            className={`md:hidden fixed inset-y-0 right-0 z-50 w-64 bg-gradient-to-b from-purple-700 to-indigo-800 shadow-xl transform transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Close button */}
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile menu content */}
            <div className="pt-14 pb-3 px-2 space-y-1 overflow-y-auto max-h-screen">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-4 px-3 py-2">
                <WalletDropdown minimal={true} />
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar; 