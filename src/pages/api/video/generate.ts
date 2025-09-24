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

  const payload: Record<string, unknown> = {
    inputs: prompt,
    options: {
      wait_for_model: true,
      use_cache: false,
    },
  };

  const parameters: Record<string, unknown> = {};

  if (typeof duration === 'number') {
    parameters.max_video_duration = clampDuration(duration);
  }

  if (resolution) {
    parameters.resolution = resolution;
  }

  if (typeof fps === 'number' && !Number.isNaN(fps)) {
    parameters.fps = Math.max(1, Math.min(60, Math.round(fps)));
  }

  if (Object.keys(parameters).length) {
    payload.parameters = parameters;
  }

  try {
    const response = await fetch(`${HF_INFERENCE_URL}/${encodeURIComponent(modelId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'video/mp4',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText || 'Video generation failed' });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const videoUrl = `data:video/mp4;base64,${buffer.toString('base64')}`;

    const finalDuration = typeof duration === 'number' ? clampDuration(duration) : undefined;

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
