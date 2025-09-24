import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import Layout from '@/components/Layout';
import WalletDropdown from '@/components/WalletDropdown';
import { useWallet } from '@/web3/WalletProvider';
import {
  fetchVideoModels,
  generateVideo,
  VideoGenerationParams,
  VideoGenerationResult,
  VideoModelOption,
} from '@/api/videoGeneration';

export default function CreatePage() {
  const { connected, connectWallet, publicKey, isPhantomInstalled } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [fps, setFps] = useState(24);
  const [style, setStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);
  const [models, setModels] = useState<VideoModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      setModelsLoading(true);
      setModelError(null);
      try {
        const list = await fetchVideoModels();
        if (cancelled) {
          return;
        }
        setModels(list);
        setSelectedModel((current) => (current ? current : list[0]?.id ?? ''));
      } catch (err) {
        if (cancelled) {
          return;
        }
        setModelError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        if (!cancelled) {
          setModelsLoading(false);
        }
      }
    };

    loadModels();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError('Please enter a description for the video');
      return;
    }
    if (!selectedModel) {
      setError('Select a Hugging Face model to continue');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setVideoResult(null);
      const formattedPrompt = style ? `${trimmedPrompt}\nPreferred style: ${style}` : trimmedPrompt;
      const params: VideoGenerationParams = {
        prompt: formattedPrompt,
        modelId: selectedModel,
        duration,
        resolution,
        fps,
      };
      const result = await generateVideo(params);
      setVideoResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMintNFT = () => {
    if (!videoResult?.videoUrl) {
      return;
    }
    window.location.href = `/mint?videoUrl=${encodeURIComponent(videoResult.videoUrl)}&prompt=${encodeURIComponent(prompt)}`;
  };

  const renderModelList = () => {
    if (modelsLoading) {
      return <div className="text-sm text-gray-500">Loading Hugging Face models...</div>;
    }

    if (modelError) {
      return <div className="text-sm text-red-500">{modelError}</div>;
    }

    if (!models.length) {
      return <div className="text-sm text-red-500">No eligible models from 2025 were found on Hugging Face</div>;
    }

    const size = Math.min(models.length, 6) || 1;

    return (
      <select
        value={selectedModel}
        onChange={(event) => setSelectedModel(event.target.value)}
        size={size}
        className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm font-medium text-sm"
      >
        {models.map((model) => {
          const date = new Date(model.lastModified);
          const formattedDate = Number.isNaN(date.getTime()) ? model.lastModified : date.toLocaleDateString();
          return (
            <option key={model.id} value={model.id}>
              {`${model.name} • ${formattedDate} • ${model.downloads.toLocaleString()} downloads`}
            </option>
          );
        })}
      </select>
    );
  };

  return (
    <Layout title="NeuralFlux - Create AI Video">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-bold">Generate AI Video</h1>
              <p className="text-gray-600">Generate videos aligned with your description and selected Hugging Face model</p>
            </div>
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
                rows={5}
                style={{ WebkitAppearance: 'none' }}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Add as much detail as you need. The video length can extend up to five minutes.</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reference Image (Optional)</label>
              <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center">
                {referenceImage ? (
                  <div className="mb-2">
                    <img src={referenceImage} alt="Reference" className="h-32 mx-auto object-contain" />
                    <button onClick={() => setReferenceImage(null)} className="text-red-600 text-sm mt-2">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <p className="mb-2">Drag and drop an image or click to browse</p>
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg">
                      Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={duration}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (Number.isNaN(nextValue)) {
                      setDuration(1);
                      return;
                    }
                    setDuration(Math.max(1, Math.min(300, Math.round(nextValue))));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Resolution</label>
                <select
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value as '480p' | '720p' | '1080p')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  style={{ WebkitAppearance: 'none', appearance: 'menulist', height: '42px' }}
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Frame Rate (FPS)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={fps}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (Number.isNaN(nextValue)) {
                      setFps(1);
                      return;
                    }
                    setFps(Math.max(1, Math.min(60, Math.round(nextValue))));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Video Style</label>
              <select
                value={style}
                onChange={(event) => setStyle(event.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm font-medium text-base"
                style={{ WebkitAppearance: 'none', appearance: 'menulist', height: '42px' }}
              >
                <option value="realistic">Realistic</option>
                <option value="anime">Anime</option>
                <option value="cinematic">Cinematic</option>
                <option value="3d">3D Animation</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">{error}</div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !selectedModel}
              className={`w-full py-3 font-bold rounded-lg ${
                isGenerating || !prompt.trim() || !selectedModel
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Video'}
            </button>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Select a Hugging Face model</label>
              {renderModelList()}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Preview</h2>

            {videoResult?.videoUrl ? (
              <div>
                <div className="mb-4">
                  <video
                    src={videoResult.videoUrl}
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
                    onClick={handleMintNFT}
                    className="bg-gray-400 text-white py-2 px-4 rounded-lg font-bold relative cursor-not-allowed"
                    disabled
                  >
                    Mint as NFT
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-xs text-white px-2 py-1 rounded-full">Coming Soon</span>
                  </button>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-medium">Generating video with Hugging Face model...</p>
                <p className="text-sm text-gray-500 mt-2">This can take a few minutes for long clips. Please keep the tab open.</p>
              </div>
            ) : (
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">No video results yet</p>
                  <p className="text-sm text-gray-400">Enter a description, pick a model, and click "Generate Video"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
