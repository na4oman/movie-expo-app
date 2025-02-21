// TMDB API Configuration
const TMDB_API_KEY = '6742bab8bafe183c63f0140fe5c63999';

import { BASE_URL, API_CONFIG, endpoints } from '../config';
import { MovieListResponse, Movie, MovieDetails, MovieCredits, MovieVideosResponse } from '../types/movie';
import { PersonDetails, PersonCredits } from '../types/person';

interface FetchMoviesParams {
  language?: string;
  page?: number;
}

export async function fetchNowPlaying({ language = 'en-US', page = 1 }: FetchMoviesParams = {}): Promise<MovieListResponse> {
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
