import { BASE_URL, API_CONFIG, endpoints } from '../config';
import { Person, PersonListResponse } from '../types/person';

const TMDB_API_KEY = '6742bab8bafe183c63f0140fe5c63999';

interface FetchPopularCelebritiesParams {
  language?: string;
  page?: number;
}

export async function fetchPopularCelebrities({ language = 'en-US', page = 1 }: FetchPopularCelebritiesParams = {}): Promise<Person[]> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoints.person.popular}?language=${language}&page=${page}`,
      {
        method: 'GET',
        headers: API_CONFIG.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: PersonListResponse = await response.json();
    
    // Filter out people with no profile path to reduce noise
    return data.results.filter(person => person.profile_path);
  } catch (error) {
    console.error('Error fetching popular celebrities:', error);
    throw error;
  }
};

export interface PersonMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  character: string;
  vote_average: number;
}

export interface PersonTVShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  character: string;
  vote_average: number;
}

export async function fetchPersonMovies(personId: number): Promise<PersonMovie[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Filter and map movie credits, sort by release date
    return (data.cast || [])
      .filter((movie: PersonMovie) => movie.poster_path)
      .sort((a: PersonMovie, b: PersonMovie) => 
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      )
      .slice(0, 50);  // Limit to 50 movies
  } catch (error) {
    console.error('Error fetching person movies:', error);
    return [];
  }
}

export async function fetchPersonTVShows(personId: number): Promise<PersonTVShow[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/person/${personId}/tv_credits?api_key=${TMDB_API_KEY}&language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Filter and map TV show credits, sort by first air date
    return (data.cast || [])
      .filter((show: PersonTVShow) => show.poster_path)
      .sort((a: PersonTVShow, b: PersonTVShow) => 
        new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime()
      )
      .slice(0, 50);  // Limit to 50 TV shows
  } catch (error) {
    console.error('Error fetching person TV shows:', error);
    return [];
  }
}

export interface PersonDetails {
  id: number;
  name: string;
  birthday: string | null;
  profile_path: string | null;
  biography: string;
}

export async function fetchPersonDetails(personId: number): Promise<PersonDetails> {
  try {
    const response = await fetch(
      `${BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=en-US`,
      {
        method: 'GET',
        headers: API_CONFIG.headers
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      birthday: data.birthday || null,
      profile_path: data.profile_path,
      biography: data.biography || ''
    };
  } catch (error) {
    console.error('Error fetching person details:', error);
    throw error;
  }
}

export interface MultiSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
}

export interface MultiSearchResponse {
  page: number;
  results: MultiSearchResult[];
  total_pages: number;
  total_results: number;
}

export async function fetchMultiSearch(
  query: string, 
  page: number = 1
): Promise<MultiSearchResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...API_CONFIG.headers
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Filter and transform results
    const filteredResults = (data.results || [])
      .filter((item: MultiSearchResult) => 
        item.media_type !== 'person' || 
        (item.profile_path && item.name)
      )
      .map((item: MultiSearchResult) => ({
        ...item,
        title: item.title || item.name,
        poster_path: item.poster_path || item.profile_path,
      }))
      .slice(0, 20);  // Limit to 20 results

    return {
      page: data.page,
      results: filteredResults,
      total_pages: data.total_pages,
      total_results: data.total_results
    };
  } catch (error) {
    console.error('Error performing multi-search:', error);
    throw error;
  }
}
