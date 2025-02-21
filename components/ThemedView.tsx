import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type ThemedViewProps = ViewProps & {
  type?: 'default' | 'card' | 'container';
};

export function ThemedView({ 
  style, 
  type = 'default', 
  ...rest 
}: ThemedViewProps) {
  const { theme } = useTheme();

  const viewStyles = StyleSheet.create({
    default: {
      backgroundColor: theme?.background || '#FFFFFF',
    },
    card: {
      backgroundColor: theme?.cardBackground || '#F5F5F5',
      borderRadius: 10,
      padding: 15,
      marginVertical: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    container: {
      flex: 1,
      backgroundColor: theme?.background || '#FFFFFF',
      padding: 15,
    }
  });

  return (
    <View 
      style={[
        viewStyles[type], 
        style
      ]} 
      {...rest} 
    />
  );
}
