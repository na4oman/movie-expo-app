import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'

import { ThemeProvider, useTheme } from '@/context/ThemeContext'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  )
}

function MainApp() {
  const { colorScheme } = useTheme()
  const theme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      // Add your custom colors here
    },
  }

  return (
    <NavigationThemeProvider value={theme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            color: theme.colors.text,
          },
        }}
      >
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='+not-found' />
      </Stack>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.colors.background}
      />
    </NavigationThemeProvider>
  )
}
