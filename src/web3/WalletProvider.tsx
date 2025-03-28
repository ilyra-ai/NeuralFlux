import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PublicKey } from "@solana/web3.js";

// Define phantom wallet type without extending Window
type PhantomWallet = {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: () => void) => void;
  removeListener: (event: string, callback: () => void) => void;
};

// Helper function to get phantom wallet
const getPhantomWallet = (): PhantomWallet | undefined => {
  if (typeof window !== "undefined") {
    return (window as any).solana;
  }
  return undefined;
};

type WalletContextType = {
  wallet: PhantomWallet | undefined;
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType>({
  wallet: undefined,
  publicKey: null,
  connected: false,
  connecting: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
});

export const useWallet = () => useContext(WalletContext);

type WalletProviderProps = {
  children: ReactNode;
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<PhantomWallet | undefined>(undefined);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    const phantom = getPhantomWallet();
    setWallet(phantom);

    // Handle account changes
    const onAccountChange = () => {
      if (wallet && wallet.isPhantom) {
        const key = (wallet as any).publicKey?.toString();
        setPublicKey(key || null);
        setConnected(!!key);
      }
    };

    if (phantom) {
      phantom.on("accountChanged", onAccountChange);
      phantom.on("connect", onAccountChange);
      phantom.on("disconnect", () => {
        setPublicKey(null);
        setConnected(false);
      });
    }

    return () => {
      if (phantom) {
        phantom.removeListener("accountChanged", onAccountChange);
        phantom.removeListener("connect", onAccountChange);
        phantom.removeListener("disconnect", () => {
          setPublicKey(null);
          setConnected(false);
        });
      }
    };
  }, [wallet]);

  const connectWallet = async (): Promise<void> => {
    if (!wallet) return;
    try {
      setConnecting(true);
      const response = await wallet.connect();
      setPublicKey(response.publicKey.toString());
      setConnected(true);
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async (): Promise<void> => {
    if (!wallet) return;
    try {
      await wallet.disconnect();
      setPublicKey(null);
      setConnected(false);
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        publicKey,
        connected,
        connecting,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 