import type { JikanResponse, JikanFullResponse, AnimeCharactersResponse, Anime } from '../types/anime';

const BASE_URL = 'https://api.jikan.moe/v4';

export const searchAnime = async (query: string, limit: number = 10): Promise<JikanResponse> => {
  const response = await fetch(`${BASE_URL}/anime?q=${query}&limit=${limit}`);
  if (!response.ok) throw new Error('Error en la búsqueda');
  return response.json();
};

export const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (month <= 3)  return { year, season: 'winter', label: 'Invierno' };
  if (month <= 6)  return { year, season: 'spring', label: 'Primavera' };
  if (month <= 9)  return { year, season: 'summer', label: 'Verano' };
  return             { year, season: 'fall',   label: 'Otoño' };
};

export const getUpcomingAnimes = async (): Promise<JikanResponse> => {
  const { year, season } = getCurrentSeason();
  const response = await fetch(`${BASE_URL}/seasons/${year}/${season}`);
  if (!response.ok) throw new Error('Error al obtener temporada');
  return response.json();
};

export const getAnimeById = async (id: string): Promise<JikanFullResponse> => {
  const response = await fetch(`${BASE_URL}/anime/${id}/full`);
  if (!response.ok) throw new Error('Error al obtener los detalles del anime');
  return response.json();
};

export const getAnimeCharacters = async (id: string): Promise<AnimeCharactersResponse> => {
  const response = await fetch(`${BASE_URL}/anime/${id}/characters`);
  if (!response.ok) throw new Error('Error al obtener los personajes');
  return response.json();
};

// --- FUNCIÓN ACTUALIZADA CON SOPORTE PARA FILTROS ---
// --- FUNCIÓN ACTUALIZADA CON SOPORTE PARA FILTROS Y PAGINACIÓN ---
export const getTopAnimes = async (limit: number = 25, filter: string = "", page: number = 1): Promise<JikanResponse> => {
  // Jikan usa query params: ?limit=25&page=1&filter=bypopularity
  let url = `${BASE_URL}/top/anime?limit=${limit}&page=${page}`;
  if (filter) {
    url += `&filter=${filter}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener el top global');
  return response.json();
};

// --- NUEVAS FUNCIONES MEJORADAS (Score > 7) ---

// Función para obtener un solo anime "al azar" garantizando calidad (Score > 7)
export const getRandomAnime = async (): Promise<{ data: Anime }> => {
  // Elegimos una página aleatoria (del 1 al 15) de los mejores animes
  const randomPage = Math.floor(Math.random() * 15) + 1;
  const response = await fetch(`${BASE_URL}/top/anime?page=${randomPage}`);
  
  if (!response.ok) throw new Error('Error al obtener anime aleatorio');
  
  const json = await response.json();
  
  // Filtramos estrictamente los que tengan score mayor a 7
  const filteredAnimes = json.data.filter((anime: Anime) => anime.score && anime.score > 7);
  
  // Elegimos uno completamente al azar de esa lista filtrada
  const randomItem = filteredAnimes[Math.floor(Math.random() * filteredAnimes.length)];
  
  return { data: randomItem };
};

// Función para obtener recomendaciones dinámicas garantizando calidad (Score > 7)
export const getRecommendedAnimes = async (): Promise<{ data: Anime[] }> => {
  // Elegimos una página aleatoria distinta para que las recomendaciones varíen
  const randomPage = Math.floor(Math.random() * 15) + 1;
  const response = await fetch(`${BASE_URL}/top/anime?page=${randomPage}`);
  
  if (!response.ok) throw new Error('Error al obtener recomendaciones');
  
  const json = await response.json();
  
  // Filtramos estrictamente los que tengan score mayor a 7
  const filteredAnimes = json.data.filter((anime: Anime) => anime.score && anime.score > 7);
  
  // Mezclamos el array de forma aleatoria y tomamos los primeros 6
  const shuffled = filteredAnimes.sort(() => 0.5 - Math.random());
  
  return { data: shuffled.slice(0, 6) };
};

export const getAnimeByStudio = async (studioId: string) => {
  const response = await fetch(`https://api.jikan.moe/v4/anime?producers=${studioId}&order_by=score&sort=desc&sfw=true`);
  if (!response.ok) throw new Error('Error al cargar animes del estudio');
  return response.json();
};


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

export const advancedSearchAnime = async (filters: AdvancedSearchFilters) => {
  const params = new URLSearchParams();
  params.append('sfw', 'true');
  
  // --- SOLUCIÓN DEL BUG ---
  // Solo forzamos el orden por mejor puntuación si NO estamos buscando un texto específico.
  // Si el usuario escribe algo, dejamos que Jikan ordene por "Relevancia" (Match exacto del título).
  if (!filters.q) {
    params.append('order_by', 'score'); 
    params.append('sort', 'desc');
  }
  
  if (filters.q) params.append('q', filters.q);
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.genres) params.append('genres', filters.genres);
  if (filters.producers) params.append('producers', filters.producers);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.page) params.append('page', filters.page.toString());

  const response = await fetch(`https://api.jikan.moe/v4/anime?${params.toString()}`);
  if (!response.ok) throw new Error('Error en búsqueda avanzada');
  return response.json();
};

export const getAnimeStreaming = (id: string) =>
  fetch(`${BASE_URL}/anime/${id}/streaming`).then(res => res.json());

export const getSeasonAnimes = async (year: number, season: string, page: number = 1, filter?: string): Promise<JikanResponse> => {
  let url = `${BASE_URL}/seasons/${year}/${season}?page=${page}&sfw=true`;
  if (filter) url += `&filter=${filter}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener la temporada');
  return response.json();
};

export const getSeasonLabel = (season: string): string => {
  const labels: Record<string, string> = { winter: 'Invierno', spring: 'Primavera', summer: 'Verano', fall: 'Otoño' };
  return labels[season] || season;
};