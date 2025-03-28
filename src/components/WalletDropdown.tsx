import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@/web3/WalletProvider';

interface WalletDropdownProps {
  minimal?: boolean;
  className?: string;
}

const WalletDropdown: React.FC<WalletDropdownProps> = ({ 
  minimal = false, 
  className = "" 
}) => {
  const { publicKey, disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format wallet address to show only first 4 and last 4 characters
  const formattedAddress = publicKey 
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        className={`flex items-center ${minimal ? 'text-sm' : 'text-base font-medium'} bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 rounded-lg py-2 px-4 text-purple-700 dark:text-purple-300`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2">🦊</span>
        {formattedAddress}
        <svg 
          className={`ml-2 w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 py-2">
          <button
            onClick={() => {
              disconnectWallet();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletDropdown; 