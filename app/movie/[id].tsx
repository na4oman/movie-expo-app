import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, FlatList, Dimensions, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRouter, type RouteParams } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { fetchMovieDetails, fetchMovieCredits, fetchMovieVideos } from '@/lib/api/movies';
import { Movie, MovieDetails, MovieCredits, MovieVideo, getImageUrl, IMAGE_SIZES, Cast, Crew } from '@/lib/types/movie';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<MovieCredits | null>(null);
  const [trailer, setTrailer] = useState<MovieVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const router = useRouter();

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        navigation.setOptions({
          title: 'Movie Details',
          headerTitleStyle: { 
            color: theme.text 
          }
        });

        const movieData = await fetchMovieDetails(Number(id));
        setMovie(movieData);
        
        navigation.setOptions({
          title: movieData?.title || 'Movie Details',
          headerTitleStyle: { 
            color: theme.text 
          }
        });

        const creditsData = await fetchMovieCredits(Number(id));
        const videosData = await fetchMovieVideos(Number(id));

        setCredits(creditsData);
        
        const officialTrailer = videosData.results.find(
          video => video.site === 'YouTube' && 
          video.type === 'Trailer'
        );

        if (officialTrailer) {
          setTrailer(officialTrailer);
        }
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, theme, navigation]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: '#fff',
      backgroundColor: theme.background,
      // backgroundColor: theme === 'dark' ? '#2C2C2C' : '#f1f1f1',
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    contentContainer: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    overview: {
      fontSize: 16,
      // color: '#666',
      marginBottom: 16,
      lineHeight: 24,
      color: theme.secondaryText,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    releaseDate: {
      fontSize: 14,
      color: '#666',
    },
    rating: {
      fontSize: 14,
      color: '#666',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.text,
    },
    castList: {
      marginBottom: 16,
    },
    castItemContainer: {
      width: 100,
    },
    castImage: {
      width: 100,
      height: 150,
      borderRadius: 8,
      marginBottom: 4,
    },
    castName: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.text,
    },
    characterName: {
      fontSize: 11,
      // color: '#666',
      color: theme.secondaryText,
    },
    trailerContainer: {
      marginTop: 16,
    },
    crewContainer: {
      marginTop: 16,
    },
    crewSectionContainer: {
      // marginBottom: 20,
    },
    crewTypeContainer: {
      // marginRight: 10,
      marginBottom: 10,
    },
    item: {
      // marginHorizontal: 30,
      // marginBottom: 10,
    },
    crewTypeTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      // color: '#333',
      color: theme.text,
    },
    crewList: {
      marginBottom: 10,
    },
    crewItemContainer: {
      width: 100,
      marginBottom: 10,
    },
    crewImage: {
      width: 100,
      height: 150,
      borderRadius: 10,
    },
    crewName: {
      marginTop: 5,
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.text,
    },
    crewJob: {
      fontSize: 10,
      // color: '#666',
      color: theme.secondaryText,
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Failed to load movie details</Text>
      </View>
    );
  }

  const renderCastItem = ({ item }: { item: Cast }) => {
    const imageSource: ImageSourcePropType = item.profile_path 
      ? { uri: getImageUrl(item.profile_path, IMAGE_SIZES.profile.w185) || '' }
      : { uri: Image.resolveAssetSource(require('@/assets/no-image-placeholder.png')).uri };

    return (
      <TouchableOpacity 
        style={styles.castItemContainer}
        onPress={() => router.push(`/celebrities/${item.id}`)}
      >
        <Image 
          source={imageSource} 
          style={styles.castImage} 
          resizeMode="cover" 
        />
        <Text style={styles.castName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.characterName} numberOfLines={1}>
          {item.character}
        </Text>
      </TouchableOpacity>
    );
  };

  const getCrewByJob = (job: string | string[]) => {
    if (!credits?.crew) return [];
    const jobs = Array.isArray(job) ? job : [job];
    return credits.crew.filter(person => jobs.includes(person.job));
  };

  const renderCrewItem = (item: Crew) => {
    const imageSource: ImageSourcePropType = item.profile_path 
      ? { uri: getImageUrl(item.profile_path, IMAGE_SIZES.profile.w185) || '' }
      : { uri: Image.resolveAssetSource(require('@/assets/no-image-placeholder.png')).uri };

    return (
      <TouchableOpacity 
        style={styles.crewItemContainer}
        onPress={() => router.push(`/celebrities/${item.id}`)}
      >
        <Image 
          source={imageSource} 
          style={styles.crewImage} 
          resizeMode="cover" 
        />
        <Text style={styles.crewName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.crewJob} numberOfLines={1}>{item.job}</Text>
      </TouchableOpacity>
    );
  };

  const renderCrewSection = () => {
    const crewTypes = [
      { title: 'Director', crew: getCrewByJob('Director') },
      { title: 'Music', crew: getCrewByJob(['Music', 'Original Music Composer']) },
      { title: 'Cinematography', crew: getCrewByJob(['Director of Photography', 'Cinematographer']) }
    ];

    const writingCrew = [
      ...getCrewByJob(['Screenplay', 'Writer', 'Story']),
      ...getCrewByJob(['Writing Department'])
    ];

    const filteredCrewTypes = crewTypes.filter(type => type.crew.length > 0);

    if (filteredCrewTypes.length === 0 && writingCrew.length === 0) return null;

    return (
      <View style={styles.crewSectionContainer}>
        <Text style={styles.sectionTitle}>Key Crew</Text>
        
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredCrewTypes}
          keyExtractor={(item) => item.title}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          renderItem={({ item }) => (
            <View style={styles.crewTypeContainer}>
              <Text style={styles.crewTypeTitle}>{item.title}</Text>
              {item.crew && item.crew.length > 0 && (
                <FlatList
                  data={item.crew.slice(0, 3)}
                  keyExtractor={(person, index) => `${person.id}-${index}`}
                  renderItem={({ item: person }) => {
                    const imageSource: ImageSourcePropType = {
                      uri: person.profile_path 
                        ? getImageUrl(person.profile_path, IMAGE_SIZES.poster.w185) || ''
                        : Image.resolveAssetSource(require('@/assets/no-image-placeholder.png')).uri
                    };

                    return (
                      <TouchableOpacity 
                        onPress={() => router.push(`/celebrities/${person.id}`)}
                      >
                        <Image
                          source={imageSource}
                          style={styles.crewImage}
                          resizeMode="cover"
                        />
                        <Text style={styles.crewName} numberOfLines={1}>{person.name}</Text>
                        <Text style={styles.crewJob} numberOfLines={1}>{person.job}</Text>
                      </TouchableOpacity>
                    );
                  }}
                  ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.crewList}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                />
              )}
            </View>
          )}
        />

        {writingCrew && writingCrew.length > 0 && (
          <View style={styles.crewTypeContainer}>
            <Text style={styles.crewTypeTitle}>Writers</Text>
            <FlatList
              data={writingCrew.slice(0, 6)}
              keyExtractor={(person, index) => `writing-${person.id}-${index}`}
              renderItem={({ item: person }) => {
                const imageSource: ImageSourcePropType = {
                  uri: person.profile_path 
                    ? getImageUrl(person.profile_path, IMAGE_SIZES.poster.w185) || ''
                    : Image.resolveAssetSource(require('@/assets/no-image-placeholder.png')).uri
                };

                return (
                  <TouchableOpacity 
                    onPress={() => router.push(`/celebrities/${person.id}`)}
                  >
                    <Image
                      source={imageSource}
                      style={styles.crewImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.crewName} numberOfLines={1}>{person.name}</Text>
                    <Text style={styles.crewJob} numberOfLines={1}>{person.job}</Text>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.crewList}
              // contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {movie && (
        <>
          {movie.backdrop_path && (
            <Image
              source={{
                uri: getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.w780)
              } as ImageSourcePropType}
              style={styles.backdrop}
              resizeMode="cover"
            />
          )}
          {!movie.backdrop_path && (
            <Image
              source={{
                uri: Image.resolveAssetSource(require('@/assets/no-image-placeholder.png')).uri
              } as ImageSourcePropType}
              style={styles.backdrop}
              resizeMode="cover"
            />
          )}
          <View style={styles.contentContainer}>
            {/* <Text style={styles.title}>{movie.title}</Text> */}
            <Text style={styles.overview}>{movie.overview}</Text>
            
            <View style={styles.detailsRow}>
              <Text style={styles.releaseDate}>
                🗓️ {new Date(movie.release_date).toLocaleDateString()}
              </Text>
              <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}</Text>
            </View>

            {renderCrewSection()}

            <Text style={styles.sectionTitle}>Stars</Text>
            {credits && credits.cast && (
              <FlatList
                data={credits.cast.slice(0, 6)}
                renderItem={renderCastItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                style={styles.castList}
              />
            )}

            {trailer && (
              <View style={styles.trailerContainer}>
                <Text style={styles.sectionTitle}>Trailer</Text>
                <YoutubePlayer
                  height={200}
                  play={playing}
                  videoId={trailer.key}
                  onChangeState={onStateChange}
                />
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}


