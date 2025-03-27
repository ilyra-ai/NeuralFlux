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

// Mock video generation response
const mockVideoGeneration = async (params: VideoGenerationParams): Promise<string> => {
  // Simulate backend processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simple validation
  if (!params.prompt || params.prompt.length < 5) {
    throw new Error('Prompt is too short, please provide a more detailed description');
  }
  
  // Return a mock video ID for MVP
  return `video_${Date.now()}`;
};

// Mock fetch generation status
const mockGetGenerationStatus = async (id: string): Promise<GenerationStatus> => {
  // Simulate progress updates
  const progress = Math.min(100, parseInt(id.split('_')[1]) % 100);
  
  return {
    id,
    status: progress === 100 ? 'completed' : 'processing',
    progress,
    result: progress === 100 ? 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : undefined
  };
};

// Export API functions
export const generateVideo = async (params: VideoGenerationParams): Promise<string> => {
  // In a real implementation, this would call the Step-Video-TI2V backend API
  // but for the MVP, we use a mock implementation
  return mockVideoGeneration(params);
};

export const getGenerationStatus = async (id: string): Promise<GenerationStatus> => {
  // In a real implementation, this would query the backend API
  // but for the MVP, we use a mock implementation
  return mockGetGenerationStatus(id);
};

// Function prepared for actual API integration, currently returns mock data
export const connectToDistributedNetwork = async () => {
  return {
    status: 'connected',
    nodes: 15,
    availableGPUs: 8
  };
}; 