import { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletProvider } from '@/web3/WalletProvider';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("Client-side rendering enabled");
  }, []);

  // 只有在客户端才创建这些对象
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || clusterApiUrl(WalletAdapterNetwork.Devnet);

  if (!isClient) {
    return null;
  }

  console.log("Rendering with wallet provider");

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp; 