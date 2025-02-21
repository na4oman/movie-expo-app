export const BASE_URL = 'https://api.themoviedb.org/3';

export const API_CONFIG = {
  headers: {
    'accept': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NzQyYmFiOGJhZmUxODNjNjNmMDE0MGZlNWM2Mzk5OSIsIm5iZiI6MTcwNjA4NzQ4Ni42NDMwMDAxLCJzdWIiOiI2NWIwZDQzZWI5YTBiZDAxNzI0NGQ0NjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.qsn1Z53Cq33gX-l6QAGK6uddzCpX39e3kze0SBxrAvM'
  }
} as const;

export const endpoints = {
  nowPlaying: '/movie/now_playing',
  upcoming: '/movie/upcoming',
  movieDetails: (id: number) => `/movie/${id}`,
  search: '/search/movie',
  person: {
    popular: '/person/popular',
    details: (id: number) => `/person/${id}`,
    credits: (id: number) => `/person/${id}/combined_credits`
  },
  tv: {
    airingToday: '/tv/airing_today',
    onTheAir: '/tv/on_the_air',
    popular: '/tv/popular',
    topRated: '/tv/top_rated',
    details: (id: number) => `/tv/${id}`,
    credits: (id: number) => `/tv/${id}/combined_credits`
  }
};
