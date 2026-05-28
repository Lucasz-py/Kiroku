import { cachedFetch } from '../utils/queryCache';
import type { JikanResponse, JikanFullResponse, AnimeCharactersResponse, Anime } from '../types/anime';

const BASE_URL = 'https://api.jikan.moe/v4';

// Retry on 429 with exponential backoff before propagating
async function jikanFetch(url: string): Promise<Response> {
  const delays = [900, 1800, 3600, 7200];
  for (let i = 0; i < delays.length; i++) {
    const res = await fetch(url);
    if (res.status !== 429) return res;
    await new Promise(r => setTimeout(r, delays[i]));
  }
  return fetch(url);
}

async function jikanGet<T>(url: string): Promise<T> {
  const res = await jikanFetch(url);
  if (!res.ok) throw new Error(`Jikan ${res.status}`);
  return res.json() as Promise<T>;
}

export const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (month <= 3) return { year, season: 'winter', label: 'Invierno' };
  if (month <= 6) return { year, season: 'spring', label: 'Primavera' };
  if (month <= 9) return { year, season: 'summer', label: 'Verano' };
  return            { year, season: 'fall',   label: 'Otoño' };
};

export const getUpcomingAnimes = (): Promise<JikanResponse> => {
  const { year, season } = getCurrentSeason();
  return cachedFetch(
    `season:${year}:${season}`,
    () => jikanGet(`${BASE_URL}/seasons/${year}/${season}`),
    10 * 60 * 1000,
    true,
  );
};

export const getTopAnimes = (limit = 25, filter = '', page = 1): Promise<JikanResponse> => {
  const url = `${BASE_URL}/top/anime?limit=${limit}&page=${page}${filter ? `&filter=${filter}` : ''}`;
  return cachedFetch(
    `top:${limit}:${filter}:${page}`,
    () => jikanGet(url),
    15 * 60 * 1000,
    true,
  );
};

export const getAnimeById = (id: string): Promise<JikanFullResponse> =>
  cachedFetch(`anime:${id}`, () => jikanGet(`${BASE_URL}/anime/${id}/full`), 30 * 60 * 1000);

export const getAnimeCharacters = (id: string): Promise<AnimeCharactersResponse> =>
  cachedFetch(`chars:${id}`, () => jikanGet(`${BASE_URL}/anime/${id}/characters`), 30 * 60 * 1000);

export const getAnimeStreaming = (id: string) =>
  cachedFetch(
    `streaming:${id}`,
    () => jikanFetch(`${BASE_URL}/anime/${id}/streaming`).then(r => r.json()),
    60 * 60 * 1000,
  );

export const searchAnime = (query: string, limit = 10): Promise<JikanResponse> =>
  cachedFetch(
    `search:${query}:${limit}`,
    () => jikanGet(`${BASE_URL}/anime?q=${query}&limit=${limit}`),
    3 * 60 * 1000,
  );

export const getRandomAnime = async (): Promise<{ data: Anime }> => {
  const randomPage = Math.floor(Math.random() * 15) + 1;
  const json = await cachedFetch<JikanResponse>(
    `top:25::${randomPage}`,
    () => jikanGet(`${BASE_URL}/top/anime?page=${randomPage}`),
    15 * 60 * 1000,
    true,
  );
  const filtered = json.data.filter(a => a.score && a.score > 7);
  return { data: filtered[Math.floor(Math.random() * filtered.length)] };
};

export const getRecommendedAnimes = async (): Promise<{ data: Anime[] }> => {
  const randomPage = Math.floor(Math.random() * 15) + 1;
  const json = await cachedFetch<JikanResponse>(
    `top:25::${randomPage}`,
    () => jikanGet(`${BASE_URL}/top/anime?page=${randomPage}`),
    15 * 60 * 1000,
    true,
  );
  const filtered = json.data.filter(a => a.score && a.score > 7);
  return { data: filtered.sort(() => 0.5 - Math.random()).slice(0, 6) };
};

export const getAnimeByStudio = (studioId: string) =>
  cachedFetch(
    `studio:${studioId}`,
    () => jikanGet(`${BASE_URL}/anime?producers=${studioId}&order_by=score&sort=desc&sfw=true`),
    15 * 60 * 1000,
  );

export interface AdvancedSearchFilters {
  q?: string;
  type?: string;
  status?: string;
  genres?: string;
  producers?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  page?: number;
}

export const advancedSearchAnime = (filters: AdvancedSearchFilters) => {
  const params = new URLSearchParams();
  params.append('sfw', 'true');
  if (!filters.q) { params.append('order_by', 'score'); params.append('sort', 'desc'); }
  if (filters.q)          params.append('q',          filters.q);
  if (filters.type)       params.append('type',       filters.type);
  if (filters.status)     params.append('status',     filters.status);
  if (filters.genres)     params.append('genres',     filters.genres);
  if (filters.producers)  params.append('producers',  filters.producers);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date)   params.append('end_date',   filters.end_date);
  if (filters.limit)      params.append('limit',      filters.limit.toString());
  if (filters.page)       params.append('page',       filters.page.toString());
  return cachedFetch(
    `adv:${params.toString()}`,
    () => jikanGet(`${BASE_URL}/anime?${params.toString()}`),
    5 * 60 * 1000,
  );
};

export const getSeasonAnimes = (year: number, season: string, page = 1, filter?: string): Promise<JikanResponse> => {
  let url = `${BASE_URL}/seasons/${year}/${season}?page=${page}&sfw=true`;
  if (filter) url += `&filter=${filter}`;
  return cachedFetch(
    `season:${year}:${season}:${page}:${filter ?? ''}`,
    () => jikanGet(url),
    10 * 60 * 1000,
    true,
  );
};

export const getSeasonLabel = (season: string): string => {
  const labels: Record<string, string> = { winter: 'Invierno', spring: 'Primavera', summer: 'Verano', fall: 'Otoño' };
  return labels[season] || season;
};
