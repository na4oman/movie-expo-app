import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { 
  fetchTVShowDetails, 
  fetchTVShowCredits,
  getImageUrl,
  TVShowDetails,
  TVShowCast,
  TVShowCrew
} from '@/lib/api/tv-shows';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TVShowDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [tvShowDetails, setTVShowDetails] = useState<TVShowDetails | null>(null);
  const [credits, setCredits] = useState<{
    cast: TVShowCast[];
    crew: TVShowCrew[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cast' | 'crew'>('cast');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const tvShowId = id ? Number(id) : undefined;
        
        if (!tvShowId) {
          throw new Error('Invalid TV show ID');
        }

        const details = await fetchTVShowDetails(tvShowId);
        setTVShowDetails(details);
        
        navigation.setOptions({
          title: details?.name || 'TV Show Details',
          headerTitleStyle: { 
            color: theme.text 
          }
        });

        const showCredits = await fetchTVShowCredits(tvShowId);
        setCredits(showCredits);
      } catch (err) {
        setError('Failed to load TV show details');
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
    },
    posterContainer: {
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
    posterImage: {
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
    titleText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme?.text || '#000',
    },
    subtitleText: {
      fontSize: 16,
      color: theme?.secondaryText || '#666',
      marginBottom: 10,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    ratingText: {
      marginLeft: 5,
      color: theme?.text || '#000',
    },
    overviewTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme?.text || '#000',
      marginTop: 15,
      marginBottom: 10,
    },
    overviewText: {
      fontSize: 16,
      color: theme?.secondaryText || '#666',
      lineHeight: 24,
      paddingHorizontal: 15,
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
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 10,
    },
    creditDetails: {
      flex: 1,
    },
    creditName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme?.text || '#000',
    },
    creditRole: {
      fontSize: 14,
      color: theme?.secondaryText || '#666',
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
    }
  }), [theme]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme?.primary || '#007BFF'} />
      </View>
    );
  }

  if (error || !tvShowDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'No TV show details found'}</Text>
      </View>
    );
  }

  const renderCreditItem = ({ item }: { item: TVShowCast | TVShowCrew }) => (
    <TouchableOpacity 
      style={styles.creditItem}
      onPress={() => router.push({
        pathname: '/celebrities/[id]',
        params: { id: item.id.toString() }
      })}
    >
      <Image 
        source={{ 
          uri: item.profile_path 
            ? `https://image.tmdb.org/t/p/w342${item.profile_path}` 
            : 'https://via.placeholder.com/80?text=No+Image' 
        }}
        style={styles.creditImage}
        resizeMode="cover"
      />
      <View style={styles.creditDetails}>
        <Text style={styles.creditName}>{item.name}</Text>
        <Text style={styles.creditRole}>
          {'character' in item 
            ? (item as TVShowCast).character 
            : (item as TVShowCrew).job}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const creditData = activeTab === 'cast' ? credits?.cast : credits?.crew;
  const hasCreditData = creditData && creditData.length > 0;

  const renderHeader = () => (
    <>
      {tvShowDetails.backdrop_path && (
        <Image
          source={{ uri: getImageUrl(tvShowDetails.backdrop_path, 'original') }}
          style={styles.backdropImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.posterContainer}>
        <Image
          source={{ uri: getImageUrl(tvShowDetails.poster_path) }}
          style={styles.posterImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{tvShowDetails.name}</Text>
          <Text style={styles.subtitleText}>
            {tvShowDetails.first_air_date} • {tvShowDetails.number_of_seasons} Seasons
          </Text>
          <View style={styles.ratingContainer}>
            <FontAwesome 
              name="star" 
              size={20} 
              color={theme?.primary || '#FFD700'} 
            />
            <Text style={styles.ratingText}>
              {tvShowDetails.vote_average.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.overviewTitle}>Overview</Text>
        <Text style={styles.overviewText}>{tvShowDetails.overview}</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'cast' && styles.activeTab
            ]}
            onPress={() => setActiveTab('cast')}
          >
            <Text style={styles.tabText}>Cast</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'crew' && styles.activeTab
            ]}
            onPress={() => setActiveTab('crew')}
          >
            <Text style={styles.tabText}>Crew</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={renderHeader}
      data={hasCreditData ? creditData : []}
      renderItem={hasCreditData ? renderCreditItem : () => null}
      keyExtractor={(item, index) => `${item.id}-${index}-${activeTab}`}
      ListEmptyComponent={
        <View style={styles.noCreditContainer}>
          <Text style={styles.noCreditText}>
            {activeTab === 'cast' 
              ? 'No cast information available' 
              : 'No crew information available'}
          </Text>
        </View>
      }
    />
  );
}