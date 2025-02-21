import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { colorScheme } = useTheme();

  // Select colors based on the color scheme preference
  const themeColors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // console.log('Current Color Scheme:', {
  //   preference: colorScheme,
  //   themeColors: {
  //     background: themeColors.background,
  //     text: themeColors.text,
  //     tabBackground: themeColors.tabBackground
  //   }
  // });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tabIconSelected,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: themeColors.background, 
          borderTopColor: themeColors.background,
        },
        tabBarLabelStyle: {
          color: themeColors.text,
        },
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.text,
        headerTitleStyle: {
          color: themeColors.text,
        },
        headerShown: true,
        headerShadowVisible: false,
        headerTransparent: false,
      }}>
      <Tabs.Screen
        name="movies"
        options={{
          title: 'Movies',
          tabBarIcon: ({ color }) => <FontAwesome name="film" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tv-shows"
        options={{
          title: 'TV Shows',
          tabBarIcon: ({ color }) => <FontAwesome name="tv" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="celebrities"
        options={{
          title: 'Celebrities',
          tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome name="search" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
