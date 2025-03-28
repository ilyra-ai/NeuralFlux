import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@/web3/WalletProvider';
import Link from 'next/link';
import WalletDropdown from '@/components/WalletDropdown';
import Layout from '@/components/Layout';

// Mock NFT minting function
const mockMintNFT = async (
  videoUrl: string,
  metadata: {
    title: string;
    description: string;
    royalty: number;
  }
): Promise<{ txId: string; tokenId: string }> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    txId: `tx_${Date.now()}`,
    tokenId: `token_${Math.floor(Math.random() * 1000000)}`
  };
};

export default function MintPage() {
  const router = useRouter();
  const { connected, connectWallet, isPhantomInstalled } = useWallet();
  const { videoUrl, prompt } = router.query;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('1');
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use prompt from URL query as default description
  useEffect(() => {
    if (prompt && typeof prompt === 'string') {
      setDescription(prompt);
    }
  }, [prompt]);
  
  // Handle NFT minting
  const handleMint = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!name || !description) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsMinting(true);
      setError(null);
      
      // Mock minting process for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      alert('NFT minted successfully!');
      router.push('/marketplace');
    } catch (error) {
      console.error('Error minting NFT:', error);
      setError(`Minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMinting(false);
    }
  };
  
  // Render wallet connection section
  const renderWalletConnection = () => {
    if (!isPhantomInstalled) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-8 text-center">
          <p className="mb-4">Phantom wallet extension is not installed. You need Phantom wallet to mint NFTs.</p>
          <a 
            href="https://phantom.app/download" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
          >
            Install Phantom Wallet
          </a>
          <p className="mt-2 text-xs text-gray-500">
            Phantom is a crypto wallet reimagined for DeFi & NFTs
          </p>
        </div>
      );
    }
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8 text-center">
        <p className="mb-4">Please connect your wallet to mint NFTs</p>
        <button 
          onClick={connectWallet}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
        >
          Connect Wallet
        </button>
        <p className="mt-2 text-xs text-gray-500">
          Connect your Phantom wallet to mint and share your AI-generated videos
        </p>
      </div>
    );
  };

  return (
    <Layout title="NeuralFlux - Mint Video NFT">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="mb-4 md:mb-0">
              <Link href="/create" className="text-blue-600 hover:underline mb-2 inline-block">
                &larr; Back to Create Page
              </Link>
              <h1 className="text-xl font-bold">Mint Video NFT</h1>
              <p className="text-gray-600">
                Turn your AI-generated video into an NFT on the Solana blockchain
              </p>
            </div>
            
            {/* Wallet Info Bar - Show when connected */}
            {connected ? (
              <WalletDropdown />
            ) : (
              <button 
                onClick={connectWallet}
                className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        
        {!connected ? (
          renderWalletConnection()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">NFT Details</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter NFT name"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your NFT"
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price (SOL)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleMint}
                disabled={isMinting || !name || !description}
                className={`w-full py-3 font-bold rounded-lg ${
                  isMinting || !name || !description
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMinting ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Preview</h2>
              
              {videoUrl ? (
                <div>
                  <div className="mb-4">
                    <video 
                      src={typeof videoUrl === 'string' ? videoUrl : ''} 
                      controls 
                      className="w-full rounded-lg"
                      autoPlay
                      loop
                    />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold">{name || 'Untitled NFT'}</h3>
                    <p className="text-gray-600 text-sm mt-1">{description || 'No description provided.'}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-gray-500 text-sm">Price</span>
                      <span className="font-bold">{price} SOL</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">No video selected</p>
                    <p className="text-sm text-gray-400">Generate a video first or specify a video URL</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 