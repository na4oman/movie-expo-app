import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  FlatList,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { 
  fetchPersonDetails, 
  fetchPersonMovies,
  fetchPersonTVShows,
  PersonDetails,
  PersonMovie,
  PersonTVShow
} from '@/lib/api/people';
import { FontAwesome } from '@expo/vector-icons';
import { getImageUrl } from '@/lib/api/tv-shows';

const { width } = Dimensions.get('window');

export default function CelebrityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);
  const [movies, setMovies] = useState<PersonMovie[]>([]);
  const [tvShows, setTVShows] = useState<PersonTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');

  // State for biography accordion
  const [isBiographyExpanded, setIsBiographyExpanded] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const personId = id ? Number(id) : undefined;
        
        if (!personId) {
          throw new Error('Invalid Person ID');
        }

        const details = await fetchPersonDetails(personId);
        setPersonDetails(details);
        
        navigation.setOptions({
          title: details?.name || 'Celebrity Details',
          headerTitleStyle: { 
            color: theme.text 
          }
        });

        const personMovies = await fetchPersonMovies(personId);
        setMovies(personMovies);

        const personTVShows = await fetchPersonTVShows(personId);
        setTVShows(personTVShows);
      } catch (err) {
        setError('Failed to load celebrity details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, theme, navigation]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme?.background || '#FFFFFF',
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
    },
    errorText: {
      color: theme?.error || 'red',
      fontSize: 16,
    },
    backdropImage: {
      width: '100%',
      height: width * 0.6,
      opacity: 0.5,
    },
    profileContainer: {
      position: 'absolute',
      top: width * 0.4,
      left: 15,
      width: width * 0.3,
      height: width * 0.45,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
    headerSection: {
      paddingTop: width * 0.15,
      paddingHorizontal: 15,
    },
    titleContainer: {
      marginLeft: width * 0.35,
    },
    nameText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme?.text || '#000',
    },
    subtitleText: {
      fontSize: 16,
      color: theme?.secondaryText || '#666',
      marginBottom: 10,
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 15,
      marginBottom: 10,
    },
    tab: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginHorizontal: 5,
      borderRadius: 20,
    },
    activeTab: {
      backgroundColor: theme?.primary || '#007BFF',
    },
    tabText: {
      color: theme?.text || '#000',
      fontWeight: 'bold',
    },
    bioTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme?.text || '#000',
      marginTop: 15,
      marginBottom: 10,
      paddingHorizontal: 15,
    },
    bioText: {
      fontSize: 16,
      color: theme?.secondaryText || '#666',
      lineHeight: 24,
      paddingHorizontal: 15,
    },
    creditItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginHorizontal: 15,
      backgroundColor: theme?.cardBackground || '#F5F5F5',
      borderRadius: 10,
      padding: 10,
    },
    creditImage: {
      width: 100,
      height: 150,
      borderRadius: 10,
      marginRight: 10,
    },
    creditDetails: {
      flex: 1,
    },
    creditTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme?.text || '#000',
    },
    creditSubtitle: {
      fontSize: 14,
      color: theme?.secondaryText || '#666',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    ratingText: {
      marginLeft: 5,
      color: theme?.text || '#000',
    },
    noCreditContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    noCreditText: {
      fontSize: 16,
      color: theme?.secondaryText || '#666',
    },
    biographyContainer: {
      marginVertical: 10,
      padding: 15,
      backgroundColor: theme?.cardBackground || '#F5F5F5',
      borderRadius: 10,
    },
    biographyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    biographyText: {
      color: theme?.text || '#000',
      fontSize: 14,
      lineHeight: 20,
    },
    expandButton: {
      padding: 5,
    },
  }), [theme, isBiographyExpanded]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme?.primary || '#007BFF'} />
      </View>
    );
  }

  if (error || !personDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'No celebrity details found'}</Text>
      </View>
    );
  }

  const renderCreditItem = ({ item }: { 
    item: PersonMovie | PersonTVShow 
  }) => (
    <TouchableOpacity 
      style={styles.creditItem}
      onPress={() => router.push({
        pathname: activeTab === 'movies' 
          ? '/movie/[id]' 
          : '/tv-shows/[id]',
        params: { id: item.id.toString() }
      })}
    >
      <Image 
        source={{ 
          uri: getImageUrl(item.poster_path) 
        }}
        style={styles.creditImage}
        resizeMode="cover"
      />
      <View style={styles.creditDetails}>
        <Text style={styles.creditTitle}>
          {activeTab === 'movies' 
            ? (item as PersonMovie).title 
            : (item as PersonTVShow).name}
        </Text>
        <Text style={styles.creditSubtitle}>
          {activeTab === 'movies' 
            ? `Character: ${(item as PersonMovie).character}` 
            : `Character: ${(item as PersonTVShow).character}`}
        </Text>
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
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {personDetails.profile_path && (
        <Image
          source={{ uri: getImageUrl(personDetails.profile_path, 'original') }}
          style={styles.backdropImage}
          blurRadius={10}
          resizeMode="cover"
        />
      )}

      <View style={styles.profileContainer}>
        <Image
          source={{ uri: getImageUrl(personDetails.profile_path) }}
          style={styles.profileImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.nameText}>{personDetails.name}</Text>
          <Text style={styles.subtitleText}>
            {personDetails.birthday ? `Born: ${personDetails.birthday}` : 'Birth date unknown'}
          </Text>
        </View>

        <View style={styles.biographyContainer}>
          <View style={styles.biographyHeader}>
            <Text style={styles.bioTitle}>Biography</Text>
            {personDetails.biography.length > 200 && (
              <TouchableOpacity 
                onPress={() => setIsBiographyExpanded(!isBiographyExpanded)}
                style={styles.expandButton}
              >
                <FontAwesome 
                  name={isBiographyExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={theme?.text || '#000'} 
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.biographyText}>
            {personDetails.biography.length > 200 && !isBiographyExpanded 
              ? personDetails.biography.slice(0, 200) + '...' 
              : personDetails.biography}
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'movies' && styles.activeTab
            ]}
            onPress={() => setActiveTab('movies')}
          >
            <Text style={styles.tabText}>Movies</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'tv' && styles.activeTab
            ]}
            onPress={() => setActiveTab('tv')}
          >
            <Text style={styles.tabText}>TV Shows</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const getUniqueKey = (item: PersonMovie | PersonTVShow) => {
    // Combine multiple attributes to create a more unique key
    const baseId = item.id.toString();
    const titleOrName = activeTab === 'movies' 
      ? (item as PersonMovie).title 
      : (item as PersonTVShow).name;
    const character = activeTab === 'movies'
      ? (item as PersonMovie).character
      : (item as PersonTVShow).character;
    
    return `${baseId}-${titleOrName.replace(/\s+/g, '')}-${character.replace(/\s+/g, '')}`;
  };

  const creditData = activeTab === 'movies' ? movies : tvShows;
  const hasCreditData = creditData && creditData.length > 0;

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={renderHeader}
      data={hasCreditData ? creditData : []}
      renderItem={hasCreditData ? renderCreditItem : () => null}
      keyExtractor={hasCreditData 
        ? (item) => getUniqueKey(item)
        : () => 'no-credits'}
      ListEmptyComponent={
        <View style={styles.noCreditContainer}>
          <Text style={styles.noCreditText}>
            {activeTab === 'movies' 
              ? 'No movies found' 
              : 'No TV shows found'}
          </Text>
        </View>
      }
    />
  );
}