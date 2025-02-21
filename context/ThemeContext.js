import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  secondaryText: '#666666',
  primary: '#007AFF',
  secondary: '#5856D6',
  error: '#FF3B30',
  success: '#34C759',
  border: '#C7C7CC',
};

const darkTheme = {
  background: '#000000',
  text: '#FFFFFF',
  secondaryText: '#AAAAAA',
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  error: '#FF453A',
  success: '#30D158',
  border: '#38383A',
};

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState('light')

  // Load color scheme from storage on mount
  useEffect(() => {
    const loadColorScheme = async () => {
      try {
        const savedScheme = await AsyncStorage.getItem('colorScheme')
        if (savedScheme === 'dark' || savedScheme === 'light') {
          // console.log('Loaded color scheme from ThemeContext:', savedScheme)
          setColorScheme(savedScheme)
        }
      } catch (error) {
        console.error('Error loading color scheme in ThemeContext', error)
      }
    }

    loadColorScheme()
  }, [])

  const toggleColorScheme = async () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light'
    
    try {
      await AsyncStorage.setItem('colorScheme', newScheme)
      setColorScheme(newScheme)
    } catch (error) {
      console.error('Error saving color scheme in ThemeContext', error)
    }
  }

  const theme = colorScheme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ 
      colorScheme, 
      toggleColorScheme,
      theme 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
