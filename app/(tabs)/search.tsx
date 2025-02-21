import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  StyleSheet, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { 
  fetchMultiSearch, 
  MultiSearchResult 
} from '@/lib/api/people';
import { getImageUrl } from '@/lib/api/tv-shows';
import { FontAwesome } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MultiSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(
    debounce(async (query: string, currentPage: number = 1) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetchMultiSearch(query, currentPage);
        
        setSearchResults(currentPage === 1 
          ? response.results 
          : [...searchResults, ...response.results]
        );
        setPage(response.page);
        setTotalPages(response.total_pages);
      } catch (err) {
        setError('Failed to perform search');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500),
    [searchResults]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query, 1);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      performSearch(searchQuery, page + 1);
    }
  };

  const renderSearchItem = ({ item }: { item: MultiSearchResult }) => {
    const getNavigationPath = () => {
      switch (item.media_type) {
        case 'movie': return '/movie/[id]';
        case 'tv': return '/tv-shows/[id]';
        case 'person': return '/celebrities/[id]';
        default: 
          console.warn(`Unknown media type: ${item.media_type}`);
          return '/celebrities/[id]'; // Fallback to a valid route
      }
    };

    const getTitle = () => {
      switch (item.media_type) {
        case 'movie': return item.title || 'Unknown Movie';
        case 'tv': return item.name || 'Unknown TV Show';
        case 'person': return item.name || 'Unknown Person';
        default: return 'Unknown';
      }
    };

    const getSubtitle = () => {
      switch (item.media_type) {
        case 'movie': 
          return item.release_date 
            ? `Movie • ${item.release_date.split('-')[0]}` 
            : 'Movie';
        case 'tv': 
          return item.first_air_date 
            ? `TV Show • ${item.first_air_date.split('-')[0]}` 
            : 'TV Show';
        case 'person': return 'Celebrity';
        default: return '';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.searchItem}
        onPress={() => router.push({
          pathname: getNavigationPath(),
          params: { id: item.id.toString() }
        })}
      >
        <Image 
          source={{ 
            uri: item.poster_path 
              ? getImageUrl(item.poster_path) 
              : 'https://via.placeholder.com/342x513.png?text=No+Image' 
          }}
          style={styles.searchItemImage}
          resizeMode="cover"
        />
        <View style={styles.searchItemDetails}>
          <Text 
            style={styles.searchItemTitle} 
            numberOfLines={2}
          >
            {getTitle()}
          </Text>
          <Text 
            style={styles.searchItemSubtitle}
            numberOfLines={1}
          >
            {getSubtitle()}
          </Text>
          {item.vote_average !== undefined && (
            <View style={styles.ratingContainer}>
              <FontAwesome 
                name="star" 
                size={16} 
                color={theme?.primary || '#FFD700'} 
              />
              <Text style={styles.ratingText}>
                {item.vote_average.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme?.background || '#FFFFFF',
    },
    container: {
      flex: 1,
      paddingTop: 10, // Add some top padding
      backgroundColor: theme?.background || '#FFFFFF',
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 15,
      backgroundColor: theme?.cardBackground || '#F5F5F5',
      borderRadius: 10,
      paddingHorizontal: 15,
    },
    searchInput: {
      flex: 1,
      height: 50,
      color: theme?.text || '#000',
      fontSize: 16,
    },
    searchIcon: {
      marginRight: 10,
      color: theme?.secondaryText || '#666',
    },
    searchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginHorizontal: 15,
      backgroundColor: theme?.cardBackground || '#F5F5F5',
      borderRadius: 10,
      padding: 10,
    },
    searchItemImage: {
      width: 100,
      height: 150,
      borderRadius: 10,
      marginRight: 10,
    },
    searchItemDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    searchItemTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme?.text || '#000',
      marginBottom: 5,
    },
    searchItemSubtitle: {
      fontSize: 14,
      color: theme?.secondaryText || '#666',
      marginBottom: 5,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      marginLeft: 5,
      color: theme?.text || '#000',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
    },
    errorText: {
      color: theme?.error || 'red',
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme?.secondaryText || '#666',
    }
  }), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchInputContainer}>
          <FontAwesome 
            name="search" 
            size={20} 
            style={styles.searchIcon} 
          />
          <TextInput
            placeholder="Search movies, TV shows, and people"
            placeholderTextColor={theme?.secondaryText || '#666'}
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <FlatList
          data={searchResults}
          renderItem={renderSearchItem}
          keyExtractor={(item, index) => `${item.media_type}-${item.id}-${index}`}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator 
                  size="large" 
                  color={theme?.primary || '#007BFF'} 
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && searchQuery ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No results found
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}