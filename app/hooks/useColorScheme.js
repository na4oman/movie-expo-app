import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const COLOR_SCHEME_KEY = 'color_scheme'
const SCHEME_CYCLE = ['light', 'dark', 'system']

export default function useColorScheme() {
  const [colorSchemePreference, setColorSchemePreference] = useState('light')
  const [resolvedColorScheme, setResolvedColorScheme] = useState('light')

  // Load color scheme from storage on mount
  useEffect(() => {
    const loadColorScheme = async () => {
      try {
        const savedScheme = await AsyncStorage.getItem(COLOR_SCHEME_KEY)
        console.log('Loaded color scheme:', savedScheme)

        if (savedScheme) {
          const parsedScheme = savedScheme

          // Explicitly set both preference and resolved scheme
          setColorSchemePreference(parsedScheme)
          
          switch (parsedScheme) {
            case 'light':
              setResolvedColorScheme('light')
              break
            case 'dark':
              setResolvedColorScheme('dark')
              break
            case 'system':
            default:
              setResolvedColorScheme('light')
              break
          }
        }
      } catch (error) {
        console.error('Error loading color scheme', error)
      }
    }

    loadColorScheme()
  }, [])

  // Toggle color scheme
  const toggleColorScheme = useCallback(async () => {
    // Find current index in the cycle
    const currentIndex = SCHEME_CYCLE.indexOf(colorSchemePreference)
    
    // Calculate next index, wrapping around if needed
    const nextIndex = (currentIndex + 1) % SCHEME_CYCLE.length
    const newScheme = SCHEME_CYCLE[nextIndex]

    console.log('Toggle details:', {
      currentScheme: colorSchemePreference,
      nextScheme: newScheme
    })

    let newResolvedScheme
    switch (newScheme) {
      case 'light':
        newResolvedScheme = 'light'
        break
      case 'dark':
        newResolvedScheme = 'dark'
        break
      case 'system':
      default:
        newResolvedScheme = 'light'
        break
    }

    try {
      // Save to storage
      await AsyncStorage.setItem(COLOR_SCHEME_KEY, newScheme)

      // Update states
      setColorSchemePreference(newScheme)
      setResolvedColorScheme(newResolvedScheme)
    } catch (error) {
      console.error('Error saving color scheme', error)
    }
  }, [colorSchemePreference])

  return {
    colorSchemePreference,
    resolvedColorScheme,
    toggleColorScheme
  }
}
