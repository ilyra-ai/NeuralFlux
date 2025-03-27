import { AppProps } from 'next/app';
import { useState, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@/styles/globals.css';
// 默认样式
import '@solana/wallet-adapter-react-ui/styles.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("Client-side rendering enabled");
  }, []);

  // 只有在客户端才创建这些对象
  const endpoint = useMemo(() => {
    console.log("Creating endpoint");
    return clusterApiUrl(WalletAdapterNetwork.Devnet);
  }, []);

  // 使用Phantom钱包适配器
  const wallets = useMemo(() => {
    console.log("Creating wallet adapters");
    return [new PhantomWalletAdapter()];
  }, []);

  if (!isClient) {
    return null;
  }

  console.log("Rendering with wallet providers");

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp; 