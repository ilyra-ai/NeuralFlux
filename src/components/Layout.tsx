import React, { ReactNode } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'NeuralFlux AI Video NFT Platform' }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Web3 Innovation Ecosystem for AI Video Generation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gray-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/neuralflux-logo.svg" 
              alt="NeuralFlux Logo" 
              width={50} 
              height={50} 
              className="mr-2"
            />
          </Link>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/create" className="hover:text-blue-400 transition-colors">
              Create
            </Link>
            <Link href="/marketplace" className="hover:text-blue-400 transition-colors">
              Marketplace
            </Link>
            <Link href="/dao" className="hover:text-blue-400 transition-colors">
              DAO Governance
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-900 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <div className="mb-2">
            <Image 
              src="/neuralflux-logo.svg" 
              alt="NeuralFlux Logo" 
              width={40} 
              height={40} 
              className="mx-auto"
            />
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} NeuralFlux - Web3 Innovation Ecosystem for AI Video Generation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 