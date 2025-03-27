import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';

// NFT type definition
interface NFT {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  creator: string;
  owner: string;
  price: number;
  likes: number;
  views: number;
  createdAt: Date;
}

// Mock NFT data
const MOCK_NFTS: NFT[] = [
  {
    id: 'nft_1',
    title: 'City Sunset',
    description: 'Modern city skyline panoramic view at sunset',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/images/nft_thumbnail_1.jpg',
    creator: 'Creator1',
    owner: 'Owner1',
    price: 150,
    likes: 245,
    views: 1290,
    createdAt: new Date('2025-05-01')
  },
  {
    id: 'nft_2',
    title: 'Ocean Waves',
    description: 'Peaceful scene of waves hitting the rocky shore',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/images/nft_thumbnail_2.jpg',
    creator: 'Creator2',
    owner: 'Owner1',
    price: 120,
    likes: 189,
    views: 850,
    createdAt: new Date('2025-04-28')
  },
  {
    id: 'nft_3',
    title: 'Walking in the Rain',
    description: 'Slow-motion footage of people walking in city rain',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/images/nft_thumbnail_3.jpg',
    creator: 'Creator3',
    owner: 'Owner2',
    price: 180,
    likes: 312,
    views: 1540,
    createdAt: new Date('2025-04-25')
  },
  {
    id: 'nft_4',
    title: 'Space Exploration',
    description: 'Dynamic video of galaxies and outer space',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/images/nft_thumbnail_4.jpg',
    creator: 'Creator4',
    owner: 'Owner3',
    price: 250,
    likes: 423,
    views: 2150,
    createdAt: new Date('2025-04-20')
  },
  {
    id: 'nft_5',
    title: 'Mountain Stream',
    description: 'Peaceful scene of a clear stream flowing through the forest',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/images/nft_thumbnail_5.jpg',
    creator: 'Creator5',
    owner: 'Owner4',
    price: 210,
    likes: 124,
    views: 953,
    createdAt: new Date('2025-04-18')
  },
  {
    id: 'nft_6',
    title: 'Future Technology',
    description: 'Futuristic technology and city life scenes',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/images/nft_thumbnail_6.jpg',
    creator: 'Creator6',
    owner: 'Owner5',
    price: 290,
    likes: 178,
    views: 1487,
    createdAt: new Date('2025-04-12')
  }
];

// Generate fallback thumbnail colors
const getThumbnailBackgroundColor = (id: string) => {
  const colors = ['#FF7F50', '#4682B4', '#191970', '#32CD32', '#008080', '#800080'];
  const index = parseInt(id.split('_')[1]) - 1;
  return colors[index % colors.length];
};

export default function MarketplacePage() {
  const { connected, publicKey } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>(MOCK_NFTS);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'popularity'>('date');
  const [filterCreator, setFilterCreator] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sort NFTs based on criteria
  useEffect(() => {
    let sorted = [...MOCK_NFTS];
    
    if (sortBy === 'price') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'popularity') {
      sorted.sort((a, b) => b.likes - a.likes);
    }
    
    if (filterCreator) {
      sorted = sorted.filter(nft => nft.creator === filterCreator);
    }
    
    setNfts(sorted);
  }, [sortBy, filterCreator]);

  // Open NFT preview
  const openPreview = (nft: NFT) => {
    setSelectedNFT(nft);
    setIsPreviewOpen(true);
  };

  // Close NFT preview
  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  // Get creator list for filtering
  const creators = Array.from(new Set(MOCK_NFTS.map(nft => nft.creator)));

  // Mock buy NFT functionality
  const handleBuyNFT = (nft: NFT) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    
    alert(`You are buying "${nft.title}", price: ${nft.price} FLUX`);
    // In a real application, this would call a smart contract for purchase
  };

  return (
    <Layout title="NeuralFlux - NFT Marketplace">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">NFT Marketplace</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Explore AI Generated Video NFTs</h2>
              <p className="text-gray-600">
                Browse unique video NFT works created by creators using NeuralFlux AI
              </p>
            </div>
            
            {!connected && (
              <div>
                <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold" />
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'date' | 'popularity')}
                className="w-full md:w-auto p-2 border rounded-lg"
              >
                <option value="date">Latest Uploads</option>
                <option value="price">Price: Low to High</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium mb-2">Filter by Creator</label>
              <select
                value={filterCreator || ''}
                onChange={(e) => setFilterCreator(e.target.value || null)}
                className="w-full md:w-auto p-2 border rounded-lg"
              >
                <option value="">All Creators</option>
                {creators.map(creator => (
                  <option key={creator} value={creator}>{creator}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {nfts.map(nft => (
            <div key={nft.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div 
                className="h-48 relative cursor-pointer" 
                style={{ backgroundColor: getThumbnailBackgroundColor(nft.id) }}
                onClick={() => openPreview(nft)}
              >
                <Image
                  src={nft.thumbnailUrl}
                  alt={nft.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white px-2 py-1 text-sm">
                  Video NFT
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold mb-1">{nft.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nft.description}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Creator:</span> {nft.creator}
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2">♥ {nft.likes}</span>
                    <span>👁 {nft.views}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-purple-600">{nft.price}</span>
                    <span className="text-gray-600 ml-1">FLUX</span>
                  </div>
                  
                  <button
                    onClick={() => handleBuyNFT(nft)}
                    disabled={!connected}
                    className={`py-2 px-4 rounded-lg text-sm font-medium ${
                      connected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    {connected ? 'Buy' : 'Wallet Required'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* NFT preview modal */}
        {isPreviewOpen && selectedNFT && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold">{selectedNFT.title}</h3>
                <button 
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4">
                <div className="aspect-video bg-black mb-4">
                  <video
                    src={selectedNFT.videoUrl}
                    controls
                    className="w-full h-full"
                    autoPlay
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-2">Description</h4>
                    <p className="text-gray-700 mb-4">{selectedNFT.description}</p>
                    
                    <h4 className="font-bold mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creator</span>
                        <span>{selectedNFT.creator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Owner</span>
                        <span>{selectedNFT.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minted Date</span>
                        <span>{selectedNFT.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Likes</span>
                        <span>{selectedNFT.likes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views</span>
                        <span>{selectedNFT.views}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold mb-4">Purchase Information</h4>
                    <div className="mb-4">
                      <span className="block text-gray-600 mb-1">Current Price</span>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-purple-600">{selectedNFT.price}</span>
                        <span className="ml-2">FLUX</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleBuyNFT(selectedNFT)}
                      disabled={!connected}
                      className={`w-full py-3 px-4 rounded-lg font-bold ${
                        connected
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 cursor-not-allowed text-gray-500'
                      }`}
                    >
                      {connected ? 'Buy Now' : 'Connect Wallet First'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 