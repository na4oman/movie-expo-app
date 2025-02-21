import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'link';
};

export function ThemedText({ 
  style, 
  type = 'default', 
  ...rest 
}: ThemedTextProps) {
  const { theme } = useTheme();

  const textStyles = StyleSheet.create({
    default: {
      color: theme?.text || '#000',
      fontSize: 16,
    },
    title: {
      color: theme?.text || '#000',
      fontSize: 24,
      fontWeight: 'bold',
    },
    subtitle: {
      color: theme?.secondaryText || '#666',
      fontSize: 18,
    },
    link: {
      color: theme?.primary || '#007BFF',
      fontSize: 16,
      textDecorationLine: 'underline',
    }
  });

  return (
    <Text 
      style={[
        textStyles[type], 
        style
      ]} 
      {...rest} 
    />
  );
}
