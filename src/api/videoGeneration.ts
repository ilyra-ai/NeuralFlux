import axios from 'axios';

// Video generation parameters interface
export interface VideoGenerationParams {
  prompt: string;
  referenceImage?: string; // base64 encoded image
  style?: string;
  duration?: number; // in seconds
  resolution?: '480p' | '720p' | '1080p';
  fps?: number;
}

// Generation status interface
export interface GenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  result?: string; // URL to the completed video
  error?: string;
}

// 定义视频样式类型
type VideoStyle = 'realistic' | 'anime' | 'cartoon' | 'abstract' | 'cinematic' | 'default';

// Real videos for different styles - mapping styles to actual video URLs
const REAL_VIDEOS: Record<VideoStyle, string> = {
  // 写实风格 - 自然风景
  realistic: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  
  // 动漫风格 - 动画
  anime: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  
  // 卡通风格 - 3D卡通
  cartoon: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  
  // 抽象风格 - 抽象视觉
  abstract: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  
  // 电影风格 - 电影级视频
  cinematic: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  
  // 默认视频 - 高质量通用视频
  default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
};

// Mock video generation response with better tracking of progress
const mockVideoGeneration = async (params: VideoGenerationParams): Promise<string> => {
  // Simulate backend processing time - shorter for demo purposes
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple validation
  if (!params.prompt || params.prompt.length < 5) {
    throw new Error('Prompt is too short, please provide a more detailed description');
  }
  
  // Return a mock video ID that includes style info for later retrieval
  const style = params.style || 'default';
  return `video_${Date.now()}_${style}`;
};

// Store for mock generation progress tracking
const progressStore: Record<string, number> = {};

// Mock fetch generation status with realistic progress updates
const mockGetGenerationStatus = async (id: string): Promise<GenerationStatus> => {
  // Extract style from ID
  const parts = id.split('_');
  const style = parts.length > 2 ? parts[2] : 'default';
  
  // Get current progress or initialize
  if (!progressStore[id]) {
    progressStore[id] = 0;
  }
  
  // Update progress more realistically
  if (progressStore[id] < 100) {
    // Increment by a random amount between 5-15%
    progressStore[id] += Math.floor(Math.random() * 10) + 5;
    
    // Cap at 100
    if (progressStore[id] > 100) {
      progressStore[id] = 100;
    }
  }
  
  const progress = progressStore[id];
  const isCompleted = progress === 100;
  
  // Return appropriate status and video URL based on style when completed
  return {
    id,
    status: isCompleted ? 'completed' : 'processing',
    progress,
    result: isCompleted ? getVideoForStyle(style) : undefined
  };
};

// Helper function to get video URL for a given style
function getVideoForStyle(style: string): string {
  return (style in REAL_VIDEOS) 
    ? REAL_VIDEOS[style as VideoStyle] 
    : REAL_VIDEOS.default;
}

// Export API functions
export const generateVideo = async (params: VideoGenerationParams): Promise<string> => {
  // In a real implementation, this would call the Step-Video-TI2V backend API
  // but for the demo, we use a mock implementation with real video results
  console.log('Using mock implementation with real video playback');
  return mockVideoGeneration(params);
};

export const getGenerationStatus = async (id: string): Promise<GenerationStatus> => {
  // In a real implementation, this would query the backend API
  // but for the demo, we use a mock implementation
  return mockGetGenerationStatus(id);
};

// Function for connecting to distributed network
export const connectToDistributedNetwork = async () => {
  // Mock response for testing
  return {
    status: 'connected',
    provider: 'Mock API with real videos',
    nodes: 5
  };
}; 