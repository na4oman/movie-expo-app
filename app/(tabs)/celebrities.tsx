import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { 
  Person,
  getPersonImageUrl 
} from '@/lib/types/person';
import { fetchPopularCelebrities } from '@/lib/api/people';


export default function CelebritiesScreen() {
  const [celebrities, setCelebrities] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const router = useRouter();
  const { theme, colorScheme } = useTheme();

  const loadPopularCelebrities = async () => {
    try {
      setLoading(true);
      const fetchedCelebrities = await fetchPopularCelebrities({ page });
      
      setCelebrities(prevCelebrities => [...prevCelebrities, ...fetchedCelebrities]);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopularCelebrities();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 16,
      color: theme.text
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
    },
    celebrityCard: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'center',
      backgroundColor: theme.cardBackground,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    celebrityImage: {
      width: 100,
      height: 150,
      borderRadius: 8,
      marginRight: 16,
    },
    celebrityInfo: {
      flex: 1,
      justifyContent: 'center',
      color: theme.secondaryText
    },
    celebrityName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text
    },
    knownForText: {
      fontSize: 14,
      marginTop: 4,
    },
  });

  
  
  const renderCelebrityItem = ({ item, index }: { item: Person, index: number }) => {
    const knownForTitles = (item.known_for || [])
      .map(work => work.title || work.name)
      .filter(Boolean)
      .join(', ');

    const uniqueKey = `celebrity-${item.id}-${index}`;

    return (
      <TouchableOpacity 
        key={uniqueKey}
        style={styles.celebrityCard}
        onPress={() => router.push({
          pathname: '/celebrities/[id]',
          params: { id: item.id.toString() }
        })}
      >
        <Image
          source={
            item.profile_path 
              ? { uri: getPersonImageUrl(item.profile_path) || '' }
              : { uri: Image.resolveAssetSource(require('@/assets/no-image-placeholder.png')).uri }
          }
          style={styles.celebrityImage}
        />
        <View style={styles.celebrityInfo}>
          <Text 
            style={[
              styles.celebrityName, 
              { color: theme.text }
            ]}
          >
            {item.name}
          </Text>
          <Text 
            style={[
              styles.knownForText, 
              { color: theme.secondaryText }
            ]}
            numberOfLines={2}
          >
            {knownForTitles || item.known_for_department}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const loadMoreCelebrities = () => {
    setPage(prevPage => prevPage + 1);
    loadPopularCelebrities();
  };

  if (loading && celebrities.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={celebrities}
        renderItem={renderCelebrityItem}
        keyExtractor={(item, index) => `celebrity-${item.id}-${index}`}
        onEndReached={loadMoreCelebrities}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Text style={[styles.screenTitle, { color: theme.text }]}>
            Popular Celebrities
          </Text>
        }
      />
    </View>
  );
}

