import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { Movie, getImageUrl, IMAGE_SIZES } from '@/lib/types/movie'
import { searchMovies } from '@/lib/api/movies'
import { useTheme } from '@/context/ThemeContext'

export default function MoviesScreen() {
  const { colorScheme } = useTheme()

  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMorePages, setHasMorePages] = useState(true)

  useEffect(() => {
    loadUpcomingMovies()
  }, [])

  async function loadUpcomingMovies(loadMore = false) {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const currentPage = loadMore ? page + 1 : 1
      
      const result = await searchMovies(undefined, currentPage, 'upcoming')

      setMovies(loadMore ? [...movies, ...result.movies] : result.movies);
      setPage(result.currentPage);
      setHasMorePages(result.hasMorePages)
    } catch (err) {
      setError('Failed to load upcoming movies')
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMorePages) {
      loadUpcomingMovies(true)
    }
  }

  const renderFooter = () => {
    if (!loadingMore) return null

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size='large' color='#0000ff' />
      </View>
    )
  }

  const renderMovie = ({ item }: { item: Movie }) => (
    <Pressable 
      style={styles.movieCard}
      onPress={() => router.push({
        pathname: "/movie/[id]",
        params: { id: item.id },
      })}
    >
      <Image
        source={
          item.poster_path 
            ? { uri: getImageUrl(item.poster_path, IMAGE_SIZES.poster.w342) }
            : require('@/assets/placeholder-poster.png')
        }
        style={styles.poster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.overview} numberOfLines={2}>{item.overview}</Text>
        <View style={styles.details}>
          <Text style={styles.releaseDate}>
            🗓️ {new Date(item.release_date).toLocaleDateString()}
          </Text>
          <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );

  const getStyles = () => StyleSheet.create({
    container: {
      padding: 16,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerLoader: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    error: {
      color: 'red',
      fontSize: 16,
    },
    movieCard: {
      flexDirection: 'row',
      backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#fff',
      borderRadius: 8,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    poster: {
      width: 100,
      height: 150,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    movieInfo: {
      flex: 1,
      padding: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colorScheme === 'dark' ? 'white' : 'black',
    },
    overview: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#B0B0B0' : '#666',
      marginBottom: 8,
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    releaseDate: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#B0B0B0' : '#666',
    },
    rating: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#B0B0B0' : '#666',
    },
  });

  const styles = getStyles();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>
  }

  return (
    <View style={styles.container}>
      <FlatList
        key={colorScheme}
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  )
}
