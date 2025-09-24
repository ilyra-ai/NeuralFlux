export interface VideoGenerationParams {
  prompt: string;
  modelId: string;
  duration: number;
  resolution: '480p' | '720p' | '1080p';
  fps: number;
}

export interface VideoGenerationResult {
  videoUrl: string;
  modelId: string;
  duration?: number;
}

export interface VideoModelOption {
  id: string;
  name: string;
  lastModified: string;
  downloads: number;
  likes: number;
}

interface ModelsResponse {
  models: VideoModelOption[];
}

export const fetchVideoModels = async (): Promise<VideoModelOption[]> => {
  const response = await fetch('/api/video/models');
  const data = (await response.json().catch(() => null)) as ModelsResponse | ({ error: string } & Partial<ModelsResponse>) | null;

  if (!response.ok) {
    const message = data && typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'Failed to load models';
    throw new Error(message);
  }

  if (!data || !('models' in data) || !Array.isArray(data.models)) {
    throw new Error('Unable to parse models response');
  }

  return data.models;
};

export const generateVideo = async (params: VideoGenerationParams): Promise<VideoGenerationResult> => {
  const response = await fetch('/api/video/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = (await response.json().catch(() => null)) as VideoGenerationResult | ({ error: string } & Partial<VideoGenerationResult>) | null;

  if (!response.ok) {
    const message = data && typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'Failed to generate video';
    throw new Error(message);
  }

  if (!data || typeof data !== 'object' || !('videoUrl' in data) || typeof data.videoUrl !== 'string') {
    throw new Error('Invalid response from video generation service');
  }

  return data as VideoGenerationResult;
};
