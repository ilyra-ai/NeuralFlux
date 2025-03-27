import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getFluxBalance, FLUX_TOKEN_INFO } from '@/web3/FluxToken';
import { generateVideo, VideoGenerationParams } from '@/api/videoGeneration';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Image from 'next/image';

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Display the last 8 digits of wallet address
  const truncatedAddress = publicKey ? `...${publicKey.toString().slice(-8)}` : null;

  // Fetch balance when wallet connection changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        setIsLoading(true);
        try {
          const balanceInfo = await getFluxBalance(publicKey);
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

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Connect Your Wallet</h2>
            <div className="bg-gray-100 rounded-xl p-6 flex flex-col items-center">
              <div className="mb-4">
                <WalletMultiButton />
              </div>
              {connected ? (
                <div className="mt-4 text-center">
                  <p className="text-green-600 font-semibold">Wallet Connected: {truncatedAddress}</p>
                  {isLoading ? (
                    <p>Loading balance...</p>
                  ) : (
                    balance !== null && (
                      <p className="text-gray-700 mt-2">
                        {FLUX_TOKEN_INFO.symbol} Balance: {balance} {FLUX_TOKEN_INFO.symbol}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-600 mt-2">Connect your Solana wallet to use platform features</p>
              )}
            </div>
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