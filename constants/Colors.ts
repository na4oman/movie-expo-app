/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#4db8ff';

// Define the color scheme type with tabBackground
type ColorScheme = {
  text: string;
  background: string;
  tabBackground: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
};

export const Colors: { light: ColorScheme; dark: ColorScheme } = {
  light: {
    text: '#11181C',
    background: '#ffffff', // White background
    tabBackground: '#f5f5f5', // Light gray for tabs
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff', // Bright white for better contrast
    background: '#121212', // Very dark gray, almost black
    tabBackground: '#1E1E1E', // Slightly lighter dark background for tabs
    tint: tintColorDark,
    icon: '#B0B0B0', // Light gray for icons
    tabIconDefault: '#B0B0B0',
    tabIconSelected: tintColorDark,
  },
};