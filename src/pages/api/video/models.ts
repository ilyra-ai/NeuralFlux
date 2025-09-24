import type { NextApiRequest, NextApiResponse } from 'next';

type HuggingFaceModel = {
  id: string;
  modelId?: string;
  lastModified?: string;
  pipeline_tag?: string;
  tags?: string[];
  likes?: number;
  downloads?: number;
  cardData?: {
    widgetModels?: { repoId?: string }[];
  };
};

type ModelsResult = {
  id: string;
  name: string;
  lastModified: string;
  downloads: number;
  likes: number;
};

type ModelsResponse = {
  models: ModelsResult[];
};

const HF_MODELS_URL = 'https://huggingface.co/api/models';

const fetchModelList = async (url: string, token: string | undefined) => {
  const response = await fetch(url, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to query Hugging Face');
  }

  return (await response.json()) as HuggingFaceModel[];
};

const filterRecentModels = (models: HuggingFaceModel[]) => {
  const seen = new Set<string>();
  const sorted = models
    .filter((model) => {
      if (!model.id) {
        return false;
      }
      const sourceId = model.modelId || model.id;
      if (seen.has(sourceId)) {
        return false;
      }
      const timestamp = model.lastModified;
      if (!timestamp) {
        return false;
      }
      const year = new Date(timestamp).getFullYear();
      if (Number.isNaN(year) || year < 2025) {
        return false;
      }
      seen.add(sourceId);
      return true;
    })
    .sort((a, b) => {
      const downloadsA = a.downloads ?? 0;
      const downloadsB = b.downloads ?? 0;
      if (downloadsA === downloadsB) {
        const likesA = a.likes ?? 0;
        const likesB = b.likes ?? 0;
        return likesB - likesA;
      }
      return downloadsB - downloadsA;
    });

  return sorted.slice(0, 10);
};

const buildModelsResponse = (models: HuggingFaceModel[]): ModelsResult[] => {
  return models.map((model) => ({
    id: model.id,
    name: model.modelId || model.id,
    lastModified: model.lastModified || new Date().toISOString(),
    downloads: model.downloads ?? 0,
    likes: model.likes ?? 0,
  }));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ModelsResponse | { error: string }>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.HUGGINGFACE_API_TOKEN || process.env.HF_API_TOKEN;

  try {
    const searchParams = new URLSearchParams({
      pipeline_tag: 'text-to-video',
      sort: 'downloads',
      direction: '-1',
      limit: '200',
    });

    let primary = await fetchModelList(`${HF_MODELS_URL}?${searchParams.toString()}`, token);
    primary = filterRecentModels(primary);

    if (primary.length < 10) {
      const fallbackParams = new URLSearchParams({
        search: 'long video',
        pipeline_tag: 'text-to-video',
        sort: 'downloads',
        direction: '-1',
        limit: '200',
      });
      const fallback = await fetchModelList(`${HF_MODELS_URL}?${fallbackParams.toString()}`, token);
      const merged = new Map<string, HuggingFaceModel>();
      for (const item of [...primary, ...fallback]) {
        merged.set(item.id, item);
      }
      primary = filterRecentModels(Array.from(merged.values()));
    }

    if (!primary.length) {
      res.status(404).json({ error: 'No Hugging Face video models from 2025 were found' });
      return;
    }

    const payload = buildModelsResponse(primary);
    res.status(200).json({ models: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error while loading models';
    res.status(502).json({ error: message });
  }
}
