import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';

// 为Phantom钱包声明类型
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: () => void) => void;
      removeListener: (event: string, callback: () => void) => void;
    };
  }
}

// Wallet context interface
interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Default context values
const defaultContext: WalletContextType = {
  connected: false,
  publicKey: null,
  address: null,
  connect: async () => {},
  disconnect: () => {},
};

// Create context
const WalletContext = createContext<WalletContextType>(defaultContext);

// Custom hook for using wallet context
export const useWallet = () => useContext(WalletContext);

// Props interface for provider
interface WalletProviderProps {
  children: ReactNode;
}

// Wallet provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // Connect to Phantom wallet
  const connect = async (): Promise<void> => {
    try {
      console.log("开始连接钱包...");
      // Check if Phantom is available
      if (typeof window === 'undefined') {
        console.log("Window对象不存在");
        return;
      }

      const provider = window.solana;
      
      if (!provider) {
        console.log("未检测到Phantom钱包");
        window.open('https://phantom.app/', '_blank');
        alert('Phantom wallet not installed. Please install Phantom wallet from phantom.app');
        return;
      }
      
      console.log("找到Phantom钱包，正在连接...");
      // Connect to wallet
      const resp = await provider.connect();
      console.log("钱包连接成功:", resp);
      const walletPublicKey = new PublicKey(resp.publicKey.toString());
      
      setPublicKey(walletPublicKey);
      setAddress(walletPublicKey.toString());
      setConnected(true);
      
      // Save connection state to local storage
      localStorage.setItem('walletConnected', 'true');
      console.log("钱包状态已保存");
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(`连接钱包失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  };

  // Disconnect from wallet
  const disconnect = (): void => {
    try {
      console.log("断开钱包连接...");
      if (typeof window === 'undefined' || !window.solana) {
        return;
      }
      
      window.solana.disconnect();
      
      setPublicKey(null);
      setAddress(null);
      setConnected(false);
      
      // Clear connection state from local storage
      localStorage.removeItem('walletConnected');
      console.log("钱包已断开连接");
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  // Check if wallet was previously connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (typeof window === 'undefined' || !window.solana) {
          return;
        }
        
        const wasConnected = localStorage.getItem('walletConnected') === 'true';
        
        if (wasConnected) {
          console.log("尝试重新连接之前的钱包");
          await connect();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        localStorage.removeItem('walletConnected');
      }
    };

    checkWalletConnection();
    
    // Setup event listeners for wallet connection changes
    const handleConnectChange = () => {
      console.log("钱包连接状态改变");
      // Update state based on new connection
      if (window.solana) {
        if (!window.solana.isPhantom) {
          setConnected(false);
          setPublicKey(null);
          setAddress(null);
        }
      }
    };

    if (typeof window !== 'undefined' && window.solana) {
      window.solana.on('connect', handleConnectChange);
      window.solana.on('disconnect', handleConnectChange);
      
      return () => {
        window.solana?.removeListener('connect', handleConnectChange);
        window.solana?.removeListener('disconnect', handleConnectChange);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        address,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 