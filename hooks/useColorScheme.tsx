import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export default function useColorScheme() {
  const [colorSchemePreference, setColorSchemePreference] = useState<'light' | 'dark'>('light');

  // Load color scheme from storage on mount
  useEffect(() => {
    const loadColorScheme = async () => {
      try {
        const savedScheme = await AsyncStorage.getItem('colorScheme');
        if (savedScheme === 'dark' || savedScheme === 'light') {
          console.log('Loaded color scheme:', savedScheme);
          setColorSchemePreference(savedScheme);
        }
      } catch (error) {
        console.error('Error loading color scheme', error);
      }
    };

    loadColorScheme();
  }, []);

  // Toggle color scheme
  const toggleColorScheme = async () => {
    const newScheme = colorSchemePreference === 'light' ? 'dark' : 'light';
    
    try {
      await AsyncStorage.setItem('colorScheme', newScheme);
      setColorSchemePreference(newScheme);
    } catch (error) {
      console.error('Error saving color scheme', error);
    }
  };

  return colorSchemePreference; 
}
