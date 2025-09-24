import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/web3/WalletProvider';
import { generateVideo, getGenerationStatus, VideoGenerationParams, GenerationStatus } from '@/api/videoGeneration';
import Layout from '@/components/Layout';
import WalletDropdown from '@/components/WalletDropdown';

export default function CreatePage() {
  const { connected, connectWallet, publicKey, isPhantomInstalled } = useWallet();
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
  
  useEffect(() => {
    console.log("Wallet connection status:", { connected, publicKey });
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
  
  // Handle video search/fetch
  const handleGenerate = async () => {
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
      
      // Call API to fetch a matching video
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
              console.log('Video fetch completed:', statusData.result);
            }
          }
        } catch (error) {
          console.error('Error fetching status:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting video fetch:', error);
      setError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Render wallet connection section
  return (
    <Layout title="NeuralFlux - Create AI Video">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-bold">Generate AI Video</h1>
              <p className="text-gray-600">
                Generate matching videos based on your description and preferred style
              </p>
            </div>
            
            {/* Wallet Info Bar - Show when connected */}
            {connected && publicKey ? (
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

        {!connected && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8 text-center">
            <p className="mb-4">You can generate videos without connecting a wallet. Connect Phantom if you want to access Web3 features.</p>
            {isPhantomInstalled ? (
              <button
                onClick={connectWallet}
                className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <a
                  href="https://phantom.app/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 rounded-lg py-2 px-4 text-white font-bold inline-block"
                >
                  Install Phantom Wallet
                </a>
                <p className="text-xs text-gray-500">Installing Phantom is optional and only required for blockchain interactions.</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Generation Parameters</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to generate..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm resize-none font-medium text-base leading-relaxed"
                rows={4}
                style={{ WebkitAppearance: 'none' }}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Please be specific about the subject, setting and action in the video
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reference Image (Optional)</label>
              <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center">
                {referenceImage ? (
                  <div className="mb-2">
                    <img
                      src={referenceImage}
                      alt="Reference"
                      className="h-32 mx-auto object-contain"
                    />
                    <button
                      onClick={() => setReferenceImage(null)}
                      className="text-red-600 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <p className="mb-2">Drag and drop an image or click to browse</p>
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm font-medium text-base"
                  style={{ WebkitAppearance: 'none', appearance: 'menulist', height: '42px' }}
                >
                  <option value="realistic">Realistic</option>
                  <option value="anime">Anime</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="3d">3D Animation</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || prompt.length < 5}
              className={`w-full py-3 font-bold rounded-lg ${
                isGenerating || prompt.length < 5
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Video'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Preview</h2>

            {status?.status === 'completed' && status?.result ? (
              <div>
                <div className="mb-4">
                  <video
                    src={status.result}
                    controls
                    className="w-full rounded-lg"
                    autoPlay
                    loop
                    crossOrigin="anonymous"
                    playsInline
                  />
                </div>

                <div className="flex justify-center items-center mt-4">
                  <button
                    disabled={true}
                    className="bg-gray-400 text-white py-2 px-4 rounded-lg font-bold relative cursor-not-allowed"
                  >
                    Mint as NFT
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-xs text-white px-2 py-1 rounded-full">Coming Soon</span>
                  </button>
                </div>
              </div>
            ) : status?.status === 'failed' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-500 text-lg mb-3">⚠️ Generation Failed</div>
                <p className="text-gray-700 mb-4">{status.error || 'Unable to generate a matching video. Please try again.'}</p>
                <button
                  onClick={handleGenerate}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                {isGenerating ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-medium">Generating matching video...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {status?.progress && status.progress > 90
                        ? "If no match found in 10 seconds, will use default style video..."
                        : "Generating relevant video from Step-Video-TI2V open source library..."}
                    </p>
                    <div className="mt-4 bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: status?.progress ? `${status.progress}%` : '0%' }}></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {status?.progress ? `${Math.round(status.progress)}%` : '0%'} completed
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">No video results yet</p>
                      <p className="text-sm text-gray-400">Enter a description and click "Generate Video" button</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
