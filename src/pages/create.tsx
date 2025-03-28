import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { generateVideo, getGenerationStatus, VideoGenerationParams, GenerationStatus } from '@/api/videoGeneration';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function CreatePage() {
  const { connected, publicKey } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [fps, setFps] = useState(24);
  const [style, setStyle] = useState('realistic');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Display the last 8 digits of wallet address
  const truncatedAddress = publicKey ? `${publicKey.toString().slice(-8)}` : null;
  
  // Debug information
  useEffect(() => {
    console.log("Wallet connection status:", { connected, publicKey: publicKey?.toString() });
  }, [connected, publicKey]);
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle video generation
  const handleGenerate = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (prompt.length < 5) {
      setError('Prompt description is too short, please enter at least 5 characters');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const params: VideoGenerationParams = {
        prompt,
        referenceImage: referenceImage || undefined,
        style,
        duration,
        resolution,
        fps
      };
      
      // Call API to start video generation
      const id = await generateVideo(params);
      setGenerationId(id);
      
      // Start polling for status updates
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      
      statusIntervalRef.current = setInterval(async () => {
        try {
          const statusData = await getGenerationStatus(id);
          setStatus(statusData);
          
          // If completed or failed, stop polling
          if (statusData.status === 'completed' || statusData.status === 'failed') {
            if (statusIntervalRef.current) {
              clearInterval(statusIntervalRef.current);
              statusIntervalRef.current = null;
            }
            
            setIsGenerating(false);
            
            if (statusData.status === 'completed') {
              console.log('Video generation completed:', statusData.result);
            }
          }
        } catch (error) {
          console.error('Error fetching generation status:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('Error starting video generation:', error);
      setError(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsGenerating(false);
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);
  
  // Handle mint NFT
  const handleMintNFT = () => {
    // Navigate to mint page with the generated video information
    window.location.href = `/mint?videoUrl=${encodeURIComponent(status?.result || '')}&prompt=${encodeURIComponent(prompt)}`;
  };
  
  return (
    <Layout title="NeuralFlux - Create AI Video">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Create AI Video</h1>
        <p className="text-gray-600 mb-8">
          Generate high-quality videos from text descriptions or reference images using Step-Video-TI2V technology
        </p>
        
        {!connected ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8 text-center">
            <p className="mb-4">Please connect your wallet to use the video generation feature</p>
            <div className="flex justify-center">
              <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 rounded-lg h-10 py-2 px-4 text-white font-bold" />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              If the button doesn't respond, please make sure you have the Phantom wallet browser extension installed
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Input Parameters</h2>
              
              <div className="mb-4">
                <label className="block mb-2 font-medium">Prompt Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                  placeholder="Describe in detail the video you want to generate, e.g.: A golden retriever running on a sunny beach"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-medium">Reference Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded-lg"
                />
                {referenceImage && (
                  <div className="mt-2 relative h-32 border rounded overflow-hidden">
                    <img 
                      src={referenceImage} 
                      alt="Reference" 
                      className="h-full w-full object-contain"
                    />
                    <button
                      onClick={() => setReferenceImage(null)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-medium">Duration (seconds)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Resolution</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as '480p' | '720p' | '1080p')}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-2 font-medium">FPS</label>
                  <input
                    type="number"
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    min={15}
                    max={60}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="realistic">Realistic</option>
                    <option value="anime">Anime</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="abstract">Abstract</option>
                    <option value="cinematic">Cinematic</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || prompt.length < 5}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white ${
                  isGenerating || prompt.length < 5
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate Video'}
              </button>
              
              {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Generation Results</h2>
              
              {!status && !isGenerating && (
                <div className="text-center py-12 text-gray-500">
                  <p>Fill in the parameters on the left and click the "Generate Video" button to start</p>
                </div>
              )}
              
              {isGenerating && !status && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4">Initializing generation process...</p>
                </div>
              )}
              
              {status && (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{status.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${status.progress}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Status: {
                        status.status === 'pending' ? 'Queued' : 
                        status.status === 'processing' ? 'Processing' : 
                        status.status === 'completed' ? 'Completed' : 'Failed'
                      }
                    </p>
                  </div>
                  
                  {status.status === 'completed' && status.result && (
                    <div>
                      <div className="border rounded-lg overflow-hidden mb-4">
                        <video 
                          src={status.result} 
                          controls 
                          className="w-full h-auto"
                        ></video>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <button
                          disabled={true}
                          className="bg-gray-400 text-white font-bold py-2 px-6 rounded-lg relative cursor-not-allowed"
                        >
                          Mint as NFT
                          <span className="absolute -top-2 -right-2 bg-yellow-500 text-xs text-white px-2 py-1 rounded-full animate-pulse">Coming Soon</span>
                        </button>
                        <p className="text-xs text-gray-500 mt-2">NFT minting feature will be available soon!</p>
                      </div>
                    </div>
                  )}
                  
                  {status.status === 'failed' && (
                    <div className="text-center py-8 text-red-500">
                      <p>Generation Failed</p>
                      <p className="text-sm mt-2">{status.error || 'Unknown error'}</p>
                      <button
                        onClick={handleGenerate}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 