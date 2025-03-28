import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface PhantomWallet {
  isPhantom?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: () => void) => void;
  isConnected: boolean;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomWallet;
    };
  }
}

export interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isPhantomInstalled: boolean;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  isPhantomInstalled: false,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState<boolean>(false);
  const [wallet, setWallet] = useState<PhantomWallet | undefined>(undefined);

  // Check if Phantom is installed
  useEffect(() => {
    const checkPhantomInstallation = () => {
      const phantomWallet = window.phantom?.solana;
      if (phantomWallet?.isPhantom) {
        setIsPhantomInstalled(true);
        setWallet(phantomWallet);
        if (phantomWallet.isConnected) {
          setConnected(true);
          // If already connected, get the public key
          phantomWallet.connect({ onlyIfTrusted: true })
            .then(({ publicKey }) => {
              setPublicKey(publicKey.toString());
            })
            .catch(console.error);
        }
      } else {
        setIsPhantomInstalled(false);
        console.log("Phantom wallet is not installed");
      }
    };

    if (typeof window !== 'undefined') {
      checkPhantomInstallation();
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!wallet) {
        console.error("Phantom wallet not found");
        return;
      }

      const response = await wallet.connect();
      const publicKey = response.publicKey.toString();
      
      console.log("Connected to wallet:", publicKey);
      
      setPublicKey(publicKey);
      setConnected(true);
      
      // Save connection in sessionStorage
      sessionStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      if (!wallet) {
        console.error("Phantom wallet not found");
        return;
      }

      await wallet.disconnect();
      setPublicKey(null);
      setConnected(false);
      
      // Remove from sessionStorage
      sessionStorage.removeItem('walletConnected');
      
      console.log("Disconnected from wallet");
    } catch (error) {
      console.error("Error disconnecting from Phantom wallet:", error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        connectWallet,
        disconnectWallet,
        isPhantomInstalled,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 