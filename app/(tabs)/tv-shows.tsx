import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { 
  fetchAiringTodayTVShows, 
  fetchPopularTVShows, 
  fetchTopRatedTVShows,
  fetchTrendingTVShows,
  TVShow, 
  getImageUrl 
} from '@/lib/api/tv-shows';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type TVShowSection = {
  title: string;
  data: TVShow[];
  type: 'horizontal' | 'vertical';
};

export default function TVShowsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [tvShowSections, setTVShowSections] = useState<TVShowSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Separate state for Top Rated TV Shows pagination
  const [topRatedState, setTopRatedState] = useState({
    shows: [] as TVShow[],
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    hasMorePages: true
  });

  // Initial fetch of TV shows
  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        const [airingToday, popular, topRated, trending] = await Promise.all([
          fetchAiringTodayTVShows(),
          fetchPopularTVShows(),
          fetchTopRatedTVShows(1),
          fetchTrendingTVShows()
        ]);

        setTVShowSections([
          {
            title: 'Trending TV Shows',
            data: trending.results,
            type: 'horizontal'
          },
          {
            title: 'Popular TV Shows',
            data: popular.results,
            type: 'horizontal'
          },
          {
            title: 'Top Rated TV Shows',
            data: topRated.results,
            type: 'vertical'
          }
        ]);

        // Initialize top rated shows state
        setTopRatedState(prev => ({
          ...prev,
          shows: topRated.results,
          totalPages: topRated.total_pages,
          currentPage: 1
        }));

        setLoading(false);
      } catch (err) {
        setError('Failed to load TV shows');
        console.error(err);
        setLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  // Fetch more top-rated TV shows
  const fetchMoreTopRatedTVShows = useCallback(async () => {
    // Prevent multiple simultaneous calls
   

    try {
      // Update loading state
      setTopRatedState(prev => ({ ...prev, isLoading: true }));

      // Calculate next page
      const nextPage = topRatedState.currentPage + 1;

      // Prevent exceeding total pages
      if (nextPage > topRatedState.totalPages) {
        setTopRatedState(prev => ({ 
          ...prev, 
          isLoading: false, 
          hasMorePages: false 
        }));
        return;
      }

      // Fetch next page
      const response = await fetchTopRatedTVShows(nextPage);
      
      console.log(`Loaded page ${nextPage}. Received ${response.results.length} results`);

      // Update state with new shows
      setTopRatedState(prev => ({
        shows: [...prev.shows, ...response.results],
        currentPage: nextPage,
        totalPages: response.total_pages,
        isLoading: false,
        hasMorePages: nextPage < response.total_pages
      }));

      // Update TV show sections
      setTVShowSections(prevSections => 
        prevSections.map(section => 
          section.title === 'Top Rated TV Shows' 
            ? { ...section, data: [...topRatedState.shows, ...response.results] }
            : section
        )
      );
    } catch (err) {
      console.error('Error fetching more top rated TV shows:', err);
      setTopRatedState(prev => ({ 
        ...prev, 
        isLoading: false, 
        hasMorePages: false 
      }));
    }
  }, [topRatedState.currentPage, topRatedState.totalPages, topRatedState.isLoading]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      paddingHorizontal: 15,
      paddingTop: 15,
      marginBottom: 15
    },
    horizontalListContainer: {
      paddingHorizontal: 10,
    },
    horizontalListItem: {
      width: width * 0.25,
      marginRight: 10,
      marginBottom: 10,
    },
    horizontalListImage: {
      width: '100%',
      height: width * 0.375,
      borderRadius: 10,
    },
    horizontalListTitle: {
      marginTop: 5,
      fontSize: 12,
      color: theme.secondaryText,
      textAlign: 'center',
    },
    verticalListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBackground,
      marginHorizontal: 15,
      marginVertical: 5,
      borderRadius: 10,
      padding: 10,
    },
    verticalListImage: {
      width: 100,
      height: 150,
      borderRadius: 5,
      marginRight: 10,
    },
    verticalListContent: {
      flex: 1,
      justifyContent: 'center',
    },
    verticalListTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 5,
    },
    verticalListSubtitle: {
      fontSize: 14,
      color: theme.secondaryText,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    ratingText: {
      marginLeft: 5,
      fontSize: 12,
      color: theme.secondaryText,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    errorText: {
      color: theme.error,
      fontSize: 16,
    }
  })

  // Render individual TV show items
  const renderVerticalTVShowItem = (item: TVShow) => (
    <TouchableOpacity 
      style={styles.verticalListItem}
      onPress={() => router.push(`/tv-shows/${item.id}`)}
    >
      <Image 
        source={{ uri: getImageUrl(item.poster_path, 'w342') }} 
        style={styles.verticalListImage} 
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.verticalListTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.verticalListSubtitle} numberOfLines={3}>
          {item.overview}
        </Text>
        <View style={styles.ratingContainer}>
          <FontAwesome 
            name="star" 
            size={16} 
            color={theme.primary} 
          />
          <Text style={styles.ratingText}>
            {item.vote_average.toFixed(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render the screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={tvShowSections}
      renderItem={({ item: section }) => (
        <View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.type === 'horizontal' ? (
            <FlatList
              data={section.data}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.horizontalListItem}
                  onPress={() => router.push(`/tv-shows/${item.id}`)}
                >
                  <Image 
                    source={{ uri: getImageUrl(item.poster_path, 'w342') }}
                    style={styles.horizontalListImage}
                    resizeMode="cover"
                  />
                  <Text 
                    style={styles.horizontalListTitle} 
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
            />
          ) : (
            <FlatList
              data={section.data}
              renderItem={({ item }) => renderVerticalTVShowItem(item)}
              keyExtractor={(item, index) => `top-rated-${item.id}-${index}`}
              onEndReached={fetchMoreTopRatedTVShows}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                topRatedState.isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator 
                      size="large" 
                      color={theme.primary} 
                    />
                  </View>
                ) : null
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
      keyExtractor={(item) => item.title}
    />
  );
}