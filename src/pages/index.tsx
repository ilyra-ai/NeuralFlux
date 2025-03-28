import { useState, useEffect } from 'react';
import { useWallet } from '@/web3/WalletProvider';
import { getFluxBalance, FLUX_TOKEN_INFO } from '@/web3/FluxToken';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Image from 'next/image';
import { PublicKey } from '@solana/web3.js';
import WalletDropdown from '@/components/WalletDropdown';

export default function Home() {
  const { connected, publicKey, connectWallet, isPhantomInstalled } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch balance when wallet connection changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        setIsLoading(true);
        try {
          // Convert string publicKey to PublicKey object
          const pubKeyObj = new PublicKey(publicKey);
          const balanceInfo = await getFluxBalance(pubKeyObj);
          setBalance(balanceInfo.uiAmount);
        } catch (error) {
          console.error('Balance fetch error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [connected, publicKey]);

  // Render wallet connection section based on Phantom installation status
  const renderWalletConnection = () => {
    if (!isPhantomInstalled) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-8 text-center">
          <p className="mb-4">Phantom wallet extension is not installed. You need Phantom wallet to use platform features.</p>
          <a 
            href="https://phantom.app/download" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
          >
            Install Phantom Wallet
          </a>
        </div>
      );
    }
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8 text-center">
        <p className="mb-4">Please connect your wallet to use platform features</p>
        <button 
          onClick={connectWallet}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
        >
          Connect Wallet
        </button>
      </div>
    );
  };

  return (
    <Layout title="NeuralFlux - AI Video NFT Innovation Platform">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                <h1 className="text-4xl font-bold mb-4">
                  Web3-Based AI Video Generation & NFT Innovation Platform
                </h1>
                <p className="text-xl mb-6">
                  Create engaging video content using advanced AI technology, and mint it as NFTs to trade and share on the blockchain
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
                    Start Creating
                  </Link>
                  <Link href="/marketplace" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
                    Browse Marketplace
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  {/* Can be replaced with actual platform demo image later */}
                  <Image
                    src="/images/nft_thumbnail_1.jpg"
                    alt="AI Generated Video Example"
                    width={600}
                    height={400}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wallet and Platform Info Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">Connect Your Wallet</h2>
                <p className="text-gray-600">
                  Connect your wallet to use all platform features and manage your NFTs
                </p>
              </div>
              
              {/* Wallet Info Bar - Show when connected */}
              {connected && publicKey ? (
                <div className="flex flex-col items-center md:items-start">
                  <WalletDropdown />
                  {isLoading ? (
                    <p className="text-sm text-gray-500 mt-2">Loading balance...</p>
                  ) : (
                    balance !== null && (
                      <p className="text-sm text-gray-500 mt-2">
                        Balance: {balance} {FLUX_TOKEN_INFO.symbol}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            
            {!connected && (
              <div className="mt-4">
                {renderWalletConnection()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-3">AI Video Generation</h3>
              <p className="text-gray-600 mb-4">
                Create professional-quality video content using advanced AI algorithms with simple descriptions or reference images
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-3">NFT Minting</h3>
              <p className="text-gray-600 mb-4">
                Mint your AI-generated video works as NFTs with one click, enjoying creator benefits and royalties
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-3">Decentralized Marketplace</h3>
              <p className="text-gray-600 mb-4">
                Trade your NFT works on a transparent, secure blockchain marketplace, or discover amazing content from other creators
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 