// TMDB API Configuration
const TMDB_API_KEY = '6742bab8bafe183c63f0140fe5c63999';

import { BASE_URL, API_CONFIG, endpoints } from '../config';
import { MovieListResponse, Movie, MovieDetails, MovieCredits, MovieVideosResponse } from '../types/movie';
import { PersonDetails, PersonCredits } from '../types/person';

interface FetchMoviesParams {
  language?: string;
  page?: number;
}

export async function fetchAiringToday({ language = 'en-US', page = 1 }: FetchMoviesParams = {}): Promise<MovieListResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoints.nowPlaying}?language=${language}&page=${page}`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
}

export async function fetchUpcoming({ language = 'en-US', page = 1 }: FetchMoviesParams = {}): Promise<MovieListResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoints.upcoming}?language=${language}&page=${page}`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
}

export async function fetchMovieDetails(movieId: number, language: string = 'en-US'): Promise<MovieDetails> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoints.movieDetails(movieId)}?language=${language}`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}

export async function fetchMovieCredits(movieId: number): Promise<MovieCredits> {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NzQyYmFiOGJhZmUxODNjNjNmMDE0MGZlNWM2Mzk5OSIsIm5iZiI6MTcwNjA4NzQ4Ni42NDMwMDAxLCJzdWIiOiI2NWIwZDQzZWI5YTBiZDAxNzI0NGQ0NjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.qsn1Z53Cq33gX-l6QAGK6uddzCpX39e3kze0SBxrAvM'
    }
  };

  const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`, options);
  if (!response.ok) {
    throw new Error('Failed to fetch movie credits');
  }
  return response.json();
}

export async function fetchMovieVideos(id: number): Promise<MovieVideosResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/${id}/videos?language=en-US`,
    {
      headers: API_CONFIG.headers
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movie videos');
  }

  return response.json();
}

export async function searchMovies(
  searchQuery?: string, 
  page: number = 1, 
  type: 'search' | 'upcoming' = 'search'
): Promise<{ 
  movies: Movie[], 
  currentPage: number, 
  hasMorePages: boolean 
}> {
  try {
    let response;
    if (type === 'search' && searchQuery) {
      response = await fetch(
        `${BASE_URL}${endpoints.search}?query=${encodeURIComponent(searchQuery)}&page=${page}`,
        {
          method: 'GET',
          headers: API_CONFIG.headers,
        }
      );
    } else {
      response = await fetch(
        `${BASE_URL}${endpoints.upcoming}?page=${page}`,
        {
          method: 'GET',
          headers: API_CONFIG.headers,
        }
      );
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      movies: data.results,
      currentPage: data.page,
      hasMorePages: data.page < data.total_pages
    };
  } catch (error) {
    console.error('Error searching/fetching movies:', error);
    throw error;
  }
}

export async function fetchPersonDetails(personId: number): Promise<PersonDetails> {
  try {
    const response = await fetch(
      `${BASE_URL}/person/${personId}?language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching person details:', error);
    throw error;
  }
}

export async function fetchPersonCredits(personId: number): Promise<PersonCredits> {
  try {
    const response = await fetch(
      `${BASE_URL}/person/${personId}/combined_credits?language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching person credits:', error);
    throw error;
  }
}

export const fetchUpcomingMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`
      }
    };

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}`, 
      options
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming movies');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TVShowListResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export interface TVShowDetails extends TVShow {
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  type: string;
  genres: { id: number; name: string }[];
}

export interface TVShowCredits {
  cast: TVShowCast[];
  crew: TVShowCrew[];
}

export interface TVShowCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TVShowCrew {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export async function fetchAiringTodayTVShows(page: number = 1): Promise<TVShowListResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoints.tv.airingToday}?page=${page}&language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching airing today TV shows:', error);
    throw error;
  }
}

export async function fetchPopularTVShows(page: number = 1): Promise<TVShowListResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoints.tv.popular}?page=${page}&language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    throw error;
  }
}

export async function fetchTopRatedTVShows(page: number = 1): Promise<TVShowListResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoints.tv.topRated}?page=${page}&language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching top rated TV shows:', error);
    throw error;
  }
}

export async function fetchTVShowDetails(tvShowId: number): Promise<TVShowDetails> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoints.tv.details(tvShowId)}?language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
}

export async function fetchTVShowCredits(tvShowId: number): Promise<{
  cast: TVShowCast[];
  crew: TVShowCrew[];
}> {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${tvShowId}/credits?api_key=${TMDB_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`TV Show Credits Fetch Error: 
        Status: ${response.status}
        URL: ${response.url}
        Error Body: ${errorBody}`);
      
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const data = await response.json();

    // Validate and filter credits
    const validCast = (data.cast || [])
      .filter((member: TVShowCast) => member.name && member.id)
      .slice(0, 50);  // Limit to first 50 cast members

    const validCrew = (data.crew || [])
      .filter((member: TVShowCrew) => member.name && member.id)
      .slice(0, 50);  // Limit to first 50 crew members

    return {
      cast: validCast,
      crew: validCrew
    };
  } catch (error) {
    console.error('Detailed TV Show Credits Fetch Error:', error);
    
    // Return empty lists instead of throwing to prevent screen crash
    return {
      cast: [],
      crew: []
    };
  }
}

export function getImageUrl(posterPath: string | null, size: 'w342' | 'original' = 'w342'): string {
  return posterPath 
    ? `https://image.tmdb.org/t/p/${size}${posterPath}` 
    : 'https://via.placeholder.com/342x513?text=No+Image';
}

// New interfaces for seasons and episodes
export interface TVShowSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface TVShowEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number;
  rating: number;
  still_path: string | null;
  guest_stars: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
}

// Fetch TV Show Seasons
export async function fetchTVShowSeasons(tvShowId: number): Promise<TVShowSeason[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${tvShowId}/seasons?api_key=${TMDB_API_KEY}&language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.seasons;
  } catch (error) {
    console.error('Error fetching TV show seasons:', error);
    throw error;
  }
}

// Fetch Episodes for a specific season
export async function fetchTVShowSeasonEpisodes(
  tvShowId: number, 
  seasonNumber: number
): Promise<TVShowEpisode[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${tvShowId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.episodes;
  } catch (error) {
    console.error('Error fetching TV show season episodes:', error);
    throw error;
  }
}

// Fetch Episode Details
export async function fetchTVShowEpisodeDetails(
  tvShowId: number, 
  seasonNumber: number, 
  episodeNumber: number
): Promise<TVShowEpisode> {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${tvShowId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      guest_stars: data.guest_stars || [],
      rating: data.vote_average || 0
    };
  } catch (error) {
    console.error('Error fetching TV show episode details:', error);
    throw error;
  }
}
