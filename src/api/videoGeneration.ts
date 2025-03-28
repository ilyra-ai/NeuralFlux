import axios from 'axios';

// Video generation parameters interface
export interface VideoGenerationParams {
  prompt: string;
  referenceImage?: string; // base64 encoded image
  style: string;
  duration: number; // in seconds
  resolution: '480p' | '720p' | '1080p';
  fps: number;
}

// Generation status interface
export interface GenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  result?: string; // URL to the completed video
  error?: string;
}

// Mock video database - mapping styles to predefined video URLs
const STYLE_VIDEO_URLS: Record<string, string[]> = {
  'realistic': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  ],
  'anime': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  ],
  'cinematic': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  ],
  '3d': [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    'https://storage.coverr.co/videos/zFBCJnA5qe01oZ4zXATHqVzA9JYEDGgwE?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjIzQ0I1QURCMjc3QTk2RTc4MTBBIiwiaWF0IjoxNjI2ODQ1NjI0fQ.fK_GHdXsQndWifJJcJw4ky-6VFIlZQow0V4uI_OnJvg',
    'https://storage.coverr.co/videos/g5qfOaD00k1gJnw4VN9HDDfLu1voDvf01?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjIzQ0I1QURCMjc3QTk2RTc4MTBBIiwiaWF0IjoxNjI2ODQ1NjI0fQ.fK_GHdXsQndWifJJcJw4ky-6VFIlZQow0V4uI_OnJvg',
    'https://storage.coverr.co/videos/Y3CuDQTQhU01OjbJIn00DdfTqB7W29Cg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjIzQ0I1QURCMjc3QTk2RTc4MTBBIiwiaWF0IjoxNjI2ODQ1NjI0fQ.fK_GHdXsQndWifJJcJw4ky-6VFIlZQow0V4uI_OnJvg',
  ],
};

// Default videos for each style to use when search times out
const DEFAULT_STYLE_VIDEOS: Record<string, string> = {
  'realistic': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'anime': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'cinematic': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  '3d': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
};

// Generate a deterministic index based on the prompt and style to select a video
const getVideoIndex = (prompt: string, style: string): number => {
  // Simple hash function to convert the prompt to a number
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Ensure positive value
  hash = Math.abs(hash);
  
  // Get available videos for the specified style
  const videos = STYLE_VIDEO_URLS[style] || STYLE_VIDEO_URLS['realistic'];
  
  // Return index between 0 and videos.length-1
  return hash % videos.length;
};

// Store generation statuses in session storage
const getStoredStatuses = (): Record<string, GenerationStatus> => {
  if (typeof window === 'undefined') return {};
  
  const stored = sessionStorage.getItem('videoGenerationStatuses');
  return stored ? JSON.parse(stored) : {};
};

const setStoredStatus = (id: string, status: GenerationStatus): void => {
  if (typeof window === 'undefined') return;
  
  const statuses = getStoredStatuses();
  statuses[id] = status;
  sessionStorage.setItem('videoGenerationStatuses', JSON.stringify(statuses));
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Simulate searching for video directly
const searchForVideo = async (prompt: string, style: string, timeoutMs = 10000): Promise<string> => {
  console.log(`Searching for video with prompt: "${prompt}" and style: ${style}`);
  
  return new Promise((resolve) => {
    // Set a timeout to resolve with default style video if search takes too long
    const timeoutId = setTimeout(() => {
      console.log(`Search timed out after ${timeoutMs}ms, using default ${style} video`);
      resolve(DEFAULT_STYLE_VIDEOS[style] || DEFAULT_STYLE_VIDEOS['realistic']);
    }, timeoutMs);
    
    // Simulate video search with random completion time (1-12 seconds)
    const searchTime = Math.random() * 12000; // Random time between 0-12 seconds
    
    setTimeout(() => {
      // If this executes before the timeout, we "found" a matching video
      if (searchTime < timeoutMs) {
        clearTimeout(timeoutId);
        
        // Get a video based on prompt and style
        const videoIndex = getVideoIndex(prompt, style);
        const videos = STYLE_VIDEO_URLS[style] || STYLE_VIDEO_URLS['realistic'];
        const videoUrl = videos[videoIndex];
        
        console.log(`Found matching video in ${searchTime / 1000}s: ${videoUrl}`);
        resolve(videoUrl);
      }
      // If this executes after the timeout, the timeout handler already resolved with default video
    }, searchTime);
  });
};

// Simulate video generation/fetching process
export const generateVideo = async (params: VideoGenerationParams): Promise<string> => {
  console.log('Video generation parameters:', params);
  
  // Create a unique ID for this generation
  const id = generateId();
  
  // Store initial status
  const initialStatus: GenerationStatus = {
    id,
    status: 'pending',
    progress: 0,
  };
  setStoredStatus(id, initialStatus);
  
  // Start "processing" in the background
  setTimeout(() => {
    simulateProcessing(id, params);
  }, 500);
  
  return id;
};

// Simulate the video processing workflow
const simulateProcessing = (id: string, params: VideoGenerationParams): void => {
  // Update to processing state
  const processingStatus: GenerationStatus = {
    id,
    status: 'processing',
    progress: 10,
  };
  setStoredStatus(id, processingStatus);
  
  // Start the video search process
  (async () => {
    try {
      // Simulate progress updates while searching
      let progress = 10;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress >= 95) {
          clearInterval(progressInterval);
          progress = 95;
        }
        
        const updatedStatus: GenerationStatus = {
          id,
          status: 'processing',
          progress,
        };
        setStoredStatus(id, updatedStatus);
      }, 500);
      
      // Search for video with 10-second timeout
      const videoUrl = await searchForVideo(params.prompt, params.style);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Mark as completed
      const completedStatus: GenerationStatus = {
        id,
        status: 'completed',
        progress: 100,
        result: videoUrl,
      };
      setStoredStatus(id, completedStatus);
    } catch (error) {
      console.error('Error during video search:', error);
      
      // Mark as failed
      const failedStatus: GenerationStatus = {
        id,
        status: 'failed',
        progress: 100,
        error: 'Failed to find a matching video. Please try again.',
      };
      setStoredStatus(id, failedStatus);
    }
  })();
};

// Get the status of a generation by ID
export const getGenerationStatus = async (id: string): Promise<GenerationStatus> => {
  const statuses = getStoredStatuses();
  const status = statuses[id];
  
  if (!status) {
    throw new Error(`Generation with ID ${id} not found`);
  }
  
  return status;
};

// Reset all statuses (for testing)
export const resetGenerationStatuses = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('videoGenerationStatuses');
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