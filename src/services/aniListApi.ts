// src/services/aniListApi.ts
import type { Anime } from '../types/anime';

const ANILIST_URL = 'https://graphql.anilist.co';

export interface AniListFilters {
  q?: string;
  formats?: string[]; 
  status?: string;
  season?: string;
  seasonYear?: number;
  genres?: string[];
  page?: number;
  perPage?: number;
}

interface AniListVariables {
  page: number;
  perPage: number;
  search?: string;
  status?: string;
  season?: string;
  seasonYear?: number;
  genres?: string[];
  formatIn?: string[]; 
}

interface AniListMedia {
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
  };
  episodes: number | null;
  averageScore: number | null;
  coverImage: {
    large: string | null;
  } | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  } | null;
  genres: string[] | null;
  status: string | null;
  format: string | null;
}

interface AniListResponse {
  data: {
    Page: {
      pageInfo: {
        hasNextPage: boolean;
      };
      media: AniListMedia[];
    };
  };
}

export const searchAniList = async (filters: AniListFilters) => {
  const query = `
    query (
      $page: Int, 
      $perPage: Int, 
      $search: String, 
      $status: MediaStatus, 
      $season: MediaSeason, 
      $seasonYear: Int,
      $genres: [String],
      $formatIn: [MediaFormat]
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        media(
          search: $search, 
          type: ANIME, 
          status: $status, 
          season: $season, 
          seasonYear: $seasonYear,
          genre_in: $genres,
          format_in: $formatIn,
          sort: [POPULARITY_DESC, SCORE_DESC],
          isAdult: false
        ) {
          idMal
          title {
            romaji
            english
          }
          episodes
          averageScore
          coverImage {
            large
          }
          startDate {
            year
            month
            day
          }
          genres
          status
          format
        }
      }
    }
  `;

  const variables: AniListVariables = {
    page: filters.page || 1,
    perPage: filters.perPage || 40,
  };

  if (filters.q) variables.search = filters.q;
  if (filters.status) {
    if (filters.status === 'airing') variables.status = 'RELEASING';
    if (filters.status === 'complete') variables.status = 'FINISHED';
    if (filters.status === 'upcoming') variables.status = 'NOT_YET_RELEASED';
  }
  if (filters.season) variables.season = filters.season.toUpperCase();
  if (filters.seasonYear) variables.seasonYear = filters.seasonYear;
  if (filters.genres && filters.genres.length > 0) variables.genres = filters.genres;
  if (filters.formats && filters.formats.length > 0) variables.formatIn = filters.formats;

  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) throw new Error('Error fetching from AniList');

  const json = (await response.json()) as AniListResponse;
  const pageData = json.data.Page;

  const mappedData: Anime[] = pageData.media
    .filter((media) => {
      // 1. Debe tener un ID válido de MyAnimeList/Jikan
      if (media.idMal === null) return false;

      // 2. Ocultar videos musicales promocionales ("Other" / "Music")
      if (media.format === 'MUSIC') return false;

      // 3. Si el anime ya finalizó, DEBE tener una calificación.
      // Esto elimina animes "fantasma" o especiales raros que no tienen score.
      if (media.status === 'FINISHED' && !media.averageScore) return false;

      return true;
    })
    .map((media): Anime => ({
      mal_id: media.idMal as number,
      title: media.title.romaji || media.title.english || 'Sin título',
      episodes: media.episodes || null,
      score: media.averageScore ? media.averageScore / 10 : null,
      images: {
        jpg: {
          image_url: media.coverImage?.large || '',
          large_image_url: media.coverImage?.large || '',
        },
      },
      aired: {
        from: media.startDate?.year 
          ? `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, '0')}-${String(media.startDate.day || 1).padStart(2, '0')}`
          : '',
      },
      genres: (media.genres || []).map((g, i) => ({
        mal_id: i, 
        name: g,
      })),
    }));

  return {
    data: mappedData,
    hasNextPage: pageData.pageInfo.hasNextPage,
  };
};