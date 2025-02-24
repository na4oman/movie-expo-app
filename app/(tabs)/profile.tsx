import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native'
import { useTheme } from '../../context/ThemeContext'

export default function ProfileScreen() {
  const { colorScheme, toggleColorScheme, theme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.secondaryText,
      paddingBottom: 10,
    },
    settingText: {
      fontSize: 16,
      color: theme.text,
    },
    settingDescription: {
      fontSize: 12,
      color: theme.secondaryText,
      opacity: 0.6,
      marginTop: 5,
    },
  })

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingRow} onPress={toggleColorScheme}>
        <View>
          <Text style={styles.settingText}>
            {colorScheme === 'dark' ? 'Dark Theme' : 'Light Theme'}
          </Text>
          <Text style={styles.settingDescription}>
            Currently in {colorScheme} mode
          </Text>
        </View>
        <Switch
          value={colorScheme === 'dark'}
          onValueChange={toggleColorScheme}
        />
      </TouchableOpacity>
    </View>
  )
}
