import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Dimensions 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { 
  fetchTVShowDetails, 
  fetchTVShowCredits, 
  fetchTVShowSeasons, 
  fetchTVShowSeasonEpisodes,
  fetchTVShowEpisodeDetails,
  getImageUrl,
  TVShowDetails, 
  TVShowCredits,
  TVShowSeason,
  TVShowEpisode
} from '@/lib/api/tv-shows';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function TVShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const [tvShowDetails, setTVShowDetails] = useState<TVShowDetails | null>(null);
  const [credits, setCredits] = useState<TVShowCredits | null>(null);
  const [seasons, setSeasons] = useState<TVShowSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<TVShowSeason | null>(null);
  const [selectedSeasonEpisodes, setSelectedSeasonEpisodes] = useState<TVShowEpisode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<TVShowEpisode | null>(null);
  const [isSeasonModalVisible, setIsSeasonModalVisible] = useState(false);
  const [isEpisodeModalVisible, setIsEpisodeModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTVShowData = async () => {
      if (!id) return;

      try {
        const [details, showCredits, showSeasons] = await Promise.all([
          fetchTVShowDetails(parseInt(id)),
          fetchTVShowCredits(parseInt(id)),
          fetchTVShowSeasons(parseInt(id))
        ]);

        setTVShowDetails(details);
        setCredits(showCredits);
        setSeasons(showSeasons);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching TV show details:', err);
        setError('Failed to load TV show details');
        setLoading(false);
      }
    };

    fetchTVShowData();
  }, [id]);

  const handleSeasonSelect = async (season: TVShowSeason) => {
    try {
      const episodes = await fetchTVShowSeasonEpisodes(parseInt(id), season.season_number);
      setSelectedSeason(season);
      setSelectedSeasonEpisodes(episodes);
      setIsSeasonModalVisible(true);
    } catch (err) {
      console.error('Error fetching season episodes:', err);
    }
  };

  const handleEpisodeSelect = async (episode: TVShowEpisode) => {
    try {
      const episodeDetails = await fetchTVShowEpisodeDetails(
        parseInt(id), 
        episode.season_number, 
        episode.episode_number
      );
      setSelectedEpisode(episodeDetails);
      setIsSeasonModalVisible(false);
      setIsEpisodeModalVisible(true);
    } catch (err) {
      console.error('Error fetching episode details:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading TV Show Details...</Text>
      </View>
    );
  }

  if (error || !tvShowDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* TV Show Header */}
      <View style={styles.headerContainer}>
        <Image 
          source={{ uri: getImageUrl(tvShowDetails.poster_path, 'original') }} 
          style={styles.posterImage} 
        />
        <View style={styles.headerTextContainer}>
          <Text style={[styles.titleText, { color: theme.text }]}>{tvShowDetails.name}</Text>
          <Text style={[styles.subtitleText, { color: theme.subtext }]}>
            {tvShowDetails.number_of_seasons} Seasons | {tvShowDetails.number_of_episodes} Episodes
          </Text>
          <View style={styles.genreContainer}>
            {tvShowDetails.genres.map(genre => (
              <Text key={genre.id} style={[styles.genreText, { color: theme.subtext }]}>
                {genre.name}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Seasons Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Seasons</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {seasons.map(season => (
            <TouchableOpacity 
              key={season.id} 
              style={styles.seasonCard}
              onPress={() => handleSeasonSelect(season)}
            >
              <Image 
                source={{ uri: getImageUrl(season.poster_path) }} 
                style={styles.seasonPoster} 
              />
              <Text style={[styles.seasonText, { color: theme.text }]}>
                Season {season.season_number}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Seasons Modal */}
      <Modal
        visible={isSeasonModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSeasonModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {selectedSeason?.name || 'Season Episodes'}
            </Text>
            <ScrollView>
              {selectedSeasonEpisodes.map(episode => (
                <TouchableOpacity 
                  key={episode.id} 
                  style={styles.episodeItem}
                  onPress={() => handleEpisodeSelect(episode)}
                >
                  <Image 
                    source={{ uri: getImageUrl(episode.still_path) }} 
                    style={styles.episodeThumbnail} 
                  />
                  <View style={styles.episodeTextContainer}>
                    <Text style={[styles.episodeTitle, { color: theme.text }]}>
                      {episode.episode_number}. {episode.name}
                    </Text>
                    <Text style={[styles.episodeSubtitle, { color: theme.subtext }]}>
                      {episode.air_date}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsSeasonModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Episode Details Modal */}
      <Modal
        visible={isEpisodeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEpisodeModalVisible(false)}
      >
        {selectedEpisode && (
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Image 
                source={{ uri: getImageUrl(selectedEpisode.still_path, 'original') }} 
                style={styles.episodeFullImage} 
              />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedEpisode.name}
              </Text>
              <View style={styles.episodeDetailsContainer}>
                <View style={styles.episodeDetailRow}>
                  <FontAwesome name="calendar" size={16} color={theme.subtext} />
                  <Text style={[styles.episodeDetailText, { color: theme.subtext }]}>
                    {selectedEpisode.air_date}
                  </Text>
                </View>
                <View style={styles.episodeDetailRow}>
                  <FontAwesome name="clock-o" size={16} color={theme.subtext} />
                  <Text style={[styles.episodeDetailText, { color: theme.subtext }]}>
                    {selectedEpisode.runtime} mins
                  </Text>
                </View>
                <View style={styles.episodeDetailRow}>
                  <FontAwesome name="star" size={16} color={theme.subtext} />
                  <Text style={[styles.episodeDetailText, { color: theme.subtext }]}>
                    {selectedEpisode.rating.toFixed(1)} / 10
                  </Text>
                </View>
              </View>
              <Text style={[styles.episodeOverview, { color: theme.text }]}>
                {selectedEpisode.overview}
              </Text>
              {selectedEpisode.guest_stars.length > 0 && (
                <View style={styles.guestStarsContainer}>
                  <Text style={[styles.guestStarsTitle, { color: theme.text }]}>Guest Stars</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedEpisode.guest_stars.map(star => (
                      <View key={star.id} style={styles.guestStarItem}>
                        <Image 
                          source={{ uri: getImageUrl(star.profile_path) }} 
                          style={styles.guestStarImage} 
                        />
                        <Text style={[styles.guestStarName, { color: theme.subtext }]}>
                          {star.name}
                        </Text>
                        <Text style={[styles.guestStarCharacter, { color: theme.subtext }]}>
                          {star.character}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setIsEpisodeModalVisible(false);
                  setIsSeasonModalVisible(true);
                }}
              >
                <Text style={[styles.closeButtonText, { color: theme.text }]}>Back to Episodes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  headerContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    marginBottom: 10,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreText: {
    fontSize: 12,
    marginRight: 10,
    marginBottom: 5,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  seasonCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  seasonPoster: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  seasonText: {
    marginTop: 5,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  episodeItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  episodeThumbnail: {
    width: 100,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  episodeTextContainer: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  episodeSubtitle: {
    fontSize: 12,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
  },
  episodeFullImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 15,
  },
  episodeDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  episodeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeDetailText: {
    marginLeft: 10,
    fontSize: 14,
  },
  episodeOverview: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'justify',
  },
  guestStarsContainer: {
    marginTop: 15,
  },
  guestStarsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  guestStarItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 100,
  },
  guestStarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  guestStarName: {
    fontSize: 12,
    textAlign: 'center',
  },
  guestStarCharacter: {
    fontSize: 10,
    textAlign: 'center',
  },
});
