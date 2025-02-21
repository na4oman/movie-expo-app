export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string | null;
  known_for_department: string;
  gender: number;
  popularity: number;
}

export interface PersonCredits {
  cast: PersonCast[];
  crew: PersonCrew[];
}

export interface PersonCast {
  id: number;
  title: string;
  character: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  type?: 'cast';
}

export interface PersonCrew {
  id: number;
  title: string;
  job: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  type?: 'crew';
}

export type PersonCastWithType = PersonCast & { type: 'cast' };
export type PersonCrewWithType = PersonCrew & { type: 'crew' };

export type PersonCreditWithType = PersonCastWithType | PersonCrewWithType;

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  gender: number;
  known_for: Array<{
    id: number;
    title?: string;
    name?: string;
    media_type: 'movie' | 'tv';
  }>;
}

export interface PersonListResponse {
  page: number;
  results: Person[];
  total_pages: number;
  total_results: number;
}

export function getPersonImageUrl(profilePath: string | null, size: 'w185' | 'w342' | 'w500' = 'w342'): string {
  if (!profilePath) {
    return 'https://via.placeholder.com/342x513?text=No+Image';
  }
  return `https://image.tmdb.org/t/p/${size}${profilePath}`;
}
