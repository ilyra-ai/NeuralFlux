import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@/web3/WalletContext';
import Link from 'next/link';

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
  const { connected, connectWallet, publicKey } = useWallet();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [royalty, setRoyalty] = useState(10); // Default 10%
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<{ txId: string; tokenId: string } | null>(null);
  
  // Get video URL from query parameters
  useEffect(() => {
    if (router.query.video) {
      setVideoUrl(router.query.video as string);
    }
  }, [router.query]);
  
  const handleMint = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!videoUrl) {
      setError('No video available to mint');
      return;
    }
    
    if (!title) {
      setError('Please enter an NFT title');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await mockMintNFT(videoUrl, {
        title,
        description,
        royalty
      });
      
      setMintResult(result);
    } catch (error) {
      console.error('Minting error:', error);
      setError(error instanceof Error ? error.message : 'Error occurred during minting');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/create" className="text-primary hover:underline mb-4 inline-block">
            &larr; Back to Create Page
          </Link>
          <h1 className="text-3xl font-bold">Mint Video NFT</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Mint your AI-generated video as an NFT and set royalties
          </p>
        </header>
        
        {!connected ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8 text-center">
            <p className="mb-4">Please connect your wallet to mint NFTs</p>
            <button onClick={connectWallet} className="btn-primary">
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full rounded-lg mb-4"
                  autoPlay
                  loop
                />
              ) : (
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500">No video available to mint</p>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <h3 className="font-bold mb-2">Minting Instructions</h3>
                <ul className="list-disc pl-5 text-sm">
                  <li>Minting an NFT will consume a certain amount of $FLUX tokens</li>
                  <li>You can set a royalty percentage for secondary sales (up to 20%)</li>
                  <li>Minted NFTs will be displayed in your profile and in the marketplace</li>
                  <li>Minting occurs on the Solana blockchain, and transactions are irreversible</li>
                </ul>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-bold mb-4">NFT Metadata</h2>
              
              {mintResult ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold mb-2">Minting Successful!</h3>
                  <p className="mb-4">Your NFT has been successfully minted</p>
                  
                  <div className="bg-white dark:bg-dark-light p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-sm">{mintResult.txId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Token ID:</span>
                      <span className="font-mono text-sm">{mintResult.tokenId}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/profile" className="btn-secondary text-center">
                      View My NFTs
                    </Link>
                    <Link href="/marketplace" className="btn-primary text-center">
                      Go to Marketplace
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block mb-2 font-medium">NFT Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      placeholder="Name your NFT"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block mb-2 font-medium">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      rows={4}
                      placeholder="Describe your NFT content and creative background"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block mb-2 font-medium">Secondary Sale Royalty (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={royalty}
                      onChange={(e) => setRoyalty(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>0%</span>
                      <span className="font-bold">{royalty}%</span>
                      <span>20%</span>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}
                  
                  <button
                    onClick={handleMint}
                    disabled={isLoading || !videoUrl || !title}
                    className={`w-full py-3 font-bold rounded-lg ${
                      isLoading || !videoUrl || !title
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Minting...
                      </span>
                    ) : (
                      'Mint NFT'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 