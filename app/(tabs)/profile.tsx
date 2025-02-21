import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native'
import { useTheme } from '../../context/ThemeContext'

export default function ProfileScreen() {
  const { colorScheme, toggleColorScheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
      padding: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#fff' : '#000',
      paddingBottom: 10,
    },
    settingText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    settingDescription: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#fff' : '#000',
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
