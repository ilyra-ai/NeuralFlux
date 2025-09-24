import type { NextApiRequest, NextApiResponse } from 'next';

interface GenerateRequestBody {
  prompt?: string;
  modelId?: string;
  duration?: number;
  resolution?: string;
  fps?: number;
}

interface GenerateResponseBody {
  videoUrl: string;
  modelId: string;
  duration?: number;
}

const HF_INFERENCE_URL = 'https://api-inference.huggingface.co/models';

const clampDuration = (value: number) => {
  if (Number.isNaN(value)) {
    return 60;
  }
  return Math.max(1, Math.min(300, Math.round(value)));
};

const clampFps = (value: number | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 24;
  }
  return Math.max(1, Math.min(60, Math.round(value)));
};

const resolutionToDimensions = (resolution: string | undefined) => {
  if (resolution === '480p') {
    return { width: 854, height: 480 };
  }
  if (resolution === '1080p') {
    return { width: 1920, height: 1080 };
  }
  return { width: 1280, height: 720 };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractVideoFromJson = (
  payload: unknown
): { video: string; mimeType?: string } | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.video === 'string') {
    const mimeType = typeof record.mime_type === 'string' ? record.mime_type : undefined;
    return { video: record.video, mimeType };
  }

  if (typeof record.generated_video === 'string') {
    return { video: record.generated_video, mimeType: typeof record.mime_type === 'string' ? record.mime_type : undefined };
  }

  if (Array.isArray(record.videos)) {
    for (const item of record.videos) {
      const found = extractVideoFromJson(item);
      if (found) {
        return found;
      }
    }
  }

  if (Array.isArray(record.data)) {
    for (const item of record.data) {
      const found = extractVideoFromJson(item);
      if (found) {
        return found;
      }
    }
  }

  for (const value of Object.values(record)) {
    const found = extractVideoFromJson(value);
    if (found) {
      return found;
    }
  }

  return null;
};

const normaliseVideoData = (video: string, mimeType?: string) => {
  const trimmed = video.trim();
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const candidate = trimmed.replace(/\s+/g, '');
  const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (base64Pattern.test(candidate)) {
    const prefix = mimeType && mimeType.startsWith('video/') ? mimeType : 'video/mp4';
    return `data:${prefix};base64,${candidate}`;
  }
  return trimmed;
};

const requestModelInference = async (url: string, token: string, body: string) => {
  let attempt = 0;
  const maxAttempts = 60;
  while (attempt < maxAttempts) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json,video/mp4',
      },
      body,
    });

    if (response.status === 503 || response.status === 202) {
      const retryPayload = (await response.json().catch(() => null)) as
        | { estimated_time?: number }
        | null;
      const waitSeconds = retryPayload && typeof retryPayload.estimated_time === 'number' && retryPayload.estimated_time > 0
        ? retryPayload.estimated_time
        : 5;
      await delay(waitSeconds * 1000);
      attempt += 1;
      continue;
    }

    return response;
  }

  throw new Error('Timed out while waiting for Hugging Face model to generate a video');
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponseBody | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt, modelId, duration, resolution, fps } = req.body as GenerateRequestBody;

  if (!prompt || !modelId) {
    res.status(400).json({ error: 'Prompt and modelId are required' });
    return;
  }

  const token = process.env.HUGGINGFACE_API_TOKEN || process.env.HF_API_TOKEN;

  if (!token) {
    res.status(500).json({ error: 'Hugging Face API token is not configured' });
    return;
  }

  const safeDuration = typeof duration === 'number' ? clampDuration(duration) : 60;
  const safeFps = clampFps(fps);
  const totalFrames = Math.max(1, Math.min(18000, Math.round(safeDuration * safeFps)));
  const dims = resolutionToDimensions(resolution);

  const payload: Record<string, unknown> = {
    inputs: {
      prompt,
      fps: safeFps,
      num_frames: totalFrames,
      max_frames: totalFrames,
      duration_seconds: safeDuration,
      max_duration_seconds: safeDuration,
      width: dims.width,
      height: dims.height,
    },
    parameters: {
      max_video_duration: safeDuration,
      num_frames: totalFrames,
      fps: safeFps,
      width: dims.width,
      height: dims.height,
    },
    options: {
      wait_for_model: true,
      use_cache: false,
    },
  };

  try {
    const response = await requestModelInference(
      `${HF_INFERENCE_URL}/${encodeURIComponent(modelId)}`,
      token,
      JSON.stringify(payload)
    );

    if (!response.ok) {
      const errorPayload = await response.text();
      res.status(response.status).json({ error: errorPayload || 'Video generation failed' });
      return;
    }

    const contentType = response.headers.get('content-type') || '';

    let videoUrl: string | null = null;

    if (contentType.includes('application/json')) {
      const jsonPayload = await response.json().catch(() => null);
      if (!jsonPayload) {
        res.status(502).json({ error: 'Received empty response from video model' });
        return;
      }
      const extracted = extractVideoFromJson(jsonPayload);
      if (!extracted) {
        res.status(502).json({ error: 'Video payload missing in model response' });
        return;
      }
      videoUrl = normaliseVideoData(extracted.video, extracted.mimeType);
    } else {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const type = contentType && contentType.startsWith('video/') ? contentType : 'video/mp4';
      videoUrl = `data:${type};base64,${buffer.toString('base64')}`;
    }

    if (!videoUrl) {
      res.status(502).json({ error: 'Failed to decode video from Hugging Face response' });
      return;
    }

    const finalDuration = typeof duration === 'number' ? clampDuration(duration) : safeDuration;

    res.status(200).json({
      videoUrl,
      modelId,
      duration: finalDuration,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error during video generation';
    res.status(502).json({ error: message });
  }
}
