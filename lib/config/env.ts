// Environment configuration
// This file handles environment variables securely

// For Expo, environment variables need to be prefixed with EXPO_PUBLIC_ to be available in the client
// However, for API keys, we'll use a different approach for security

const getEnvVar = (name: string, defaultValue?: string): string => {
  // In development, you can use process.env
  // In production builds, these should be injected at build time
  const value = process.env[name] || defaultValue;
  
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  
  return value;
};

// TMDB API Configuration
export const TMDB_API_KEY = getEnvVar('TMDB_API_KEY');

// Other configuration
export const API_BASE_URL = 'https://api.themoviedb.org/3';

// Export all environment variables
export const ENV = {
  TMDB_API_KEY,
  API_BASE_URL,
} as const;