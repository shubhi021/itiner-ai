import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Alert,
  Share,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  loadSavedTrips,
  deleteTrip,
  updateTripStatus,
  setActiveFilter,
  setSearchQuery,
} from '../store/savedTripsSlice';
import { setItinerary, setWeather } from '../store/itinerarySlice';
import { SavedTrip } from '../services/storageService';
import { fp } from '../utils/responsive';
import {
  Search,
  MoreVertical,
  Compass,
  MapPin,
  X,
  Sparkles,
} from 'lucide-react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Trips'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const SavedTripsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { trips, loading, activeFilter, searchQuery } = useSelector(
    (state: RootState) => state.savedTrips,
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    dispatch(loadSavedTrips());
  }, [dispatch]);

  const filters: Array<'All' | 'Upcoming' | 'Past'> = [
    'All',
    'Upcoming',
    'Past',
  ];

  // Filtered trips computation
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // Filter by status tab
      if (activeFilter === 'Upcoming' && trip.status === 'COMPLETED') {
        return false;
      }
      if (activeFilter === 'Past' && trip.status !== 'COMPLETED') {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = trip.title.toLowerCase().includes(query);
        const matchesDest = trip.destination.toLowerCase().includes(query);
        return matchesTitle || matchesDest;
      }

      return true;
    });
  }, [trips, activeFilter, searchQuery]);

  const handleSelectTrip = (trip: SavedTrip) => {
    dispatch(setItinerary(trip.itinerary));
    if (trip.weather) {
      dispatch(setWeather(trip.weather));
    }
    navigation.navigate('ItineraryDetail', {
      tripId: trip.id,
      isOffline: true,
    });
  };

  const handleOpenActionMenu = (trip: SavedTrip) => {
    const isCompleted = trip.status === 'COMPLETED';

    Alert.alert(
      trip.title,
      `${trip.destination} • ${trip.duration}`,
      [
        {
          text: isCompleted ? 'Mark as Upcoming' : 'Mark as Completed',
          onPress: () => {
            dispatch(
              updateTripStatus({
                id: trip.id,
                status: isCompleted ? 'UPCOMING' : 'COMPLETED',
              }),
            );
          },
        },
        {
          text: 'Share Trip',
          onPress: async () => {
            try {
              const shareSummary =
                `${trip.title} (${trip.destination})\n${trip.duration} Day-by-Day Journey:\n\n` +
                trip.itinerary.days
                  .map(
                    d =>
                      `Day ${d.day}:\n` +
                      d.activities
                        .map(a => `• ${a.time}: ${a.name} (${a.location})`)
                        .join('\n'),
                  )
                  .join('\n\n') +
                '\n\nPlanned with ItinerAI';

              await Share.share({
                message: shareSummary,
                title: trip.title,
              });
            } catch (err) {
              console.warn('Share error:', err);
            }
          },
        },
        {
          text: 'Delete Trip',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Trip',
              `Are you sure you want to remove ${trip.title} from offline storage?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => dispatch(deleteTrip(trip.id)),
                },
              ],
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return '#0F4C5C';
      case 'DRAFT':
        return '#FF6B4A';
      case 'COMPLETED':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return '#E6F4F7';
      case 'DRAFT':
        return '#FFF1F2';
      case 'COMPLETED':
        return '#F3F4F6';
      default:
        return '#F3F4F6';
    }
  };

  const renderTripCard = ({ item }: { item: SavedTrip }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.85}
      onPress={() => handleSelectTrip(item)}>
      <Image
        source={{ uri: item.imageUrl }}
        style={[
          styles.cardImage,
          item.status === 'COMPLETED' && { opacity: 0.65 },
        ]}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBgColor(item.status) },
            ]}>
            <Text
              style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={12} color="#9CA3AF" style={styles.locPinIcon} />
          <Text style={styles.cardDates} numberOfLines={1}>
            {item.destination}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.moreButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => handleOpenActionMenu(item)}>
        <MoreVertical size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Screen Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Your Trips</Text>
            <Text style={styles.subtitle}>
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
              offline
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.searchButton,
              isSearchOpen && styles.searchButtonActive,
            ]}
            onPress={() => {
              setIsSearchOpen(prev => !prev);
              if (isSearchOpen) {
                dispatch(setSearchQuery(''));
              }
            }}>
            {isSearchOpen ? (
              <X size={20} color="#0F4C5C" />
            ) : (
              <Search size={20} color="#0F4C5C" />
            )}
          </TouchableOpacity>
        </View>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <View style={styles.searchBarWrapper}>
            <Search size={16} color="#9CA3AF" style={styles.searchIconInside} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination or trip name..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={text => dispatch(setSearchQuery(text))}
              autoFocus
              clearButtonMode="while-editing"
            />
          </View>
        )}

        {/* Filter Pills */}
        <View style={styles.filtersContainer}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => dispatch(setActiveFilter(filter))}>
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trips List or Empty State */}
        {loading && trips.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0F4C5C" />
            <Text style={styles.loadingText}>Loading saved itineraries...</Text>
          </View>
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Compass size={40} color="#0F4C5C" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? 'No matching trips found'
                : 'No saved trips yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim()
                ? 'Try a different search keyword or filter.'
                : 'Generate your dream itinerary with AI and bookmark it to access schedules & maps anytime, 100% offline.'}
            </Text>

            {!searchQuery.trim() && (
              <TouchableOpacity
                style={styles.emptyCtaButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Plan')}>
                <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyCtaText}>Plan a New Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredTrips}
            keyExtractor={item => item.id}
            renderItem={renderTripCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: fp(3.0),
    fontWeight: '800',
    color: '#0F4C5C',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fp(1.3),
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.08)',
  },
  searchButtonActive: {
    backgroundColor: '#E6F4F7',
    borderColor: '#0F4C5C',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIconInside: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: fp(1.5),
    color: '#1E293B',
    paddingVertical: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#0F4C5C',
    borderColor: '#0F4C5C',
  },
  filterText: {
    fontSize: fp(1.4),
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
    gap: 14,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: 76,
    height: 76,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: fp(1.15),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: fp(1.3),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: '#0F4C5C',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locPinIcon: {
    marginRight: 4,
  },
  cardDates: {
    fontSize: fp(1.3),
    color: '#6B7280',
    fontWeight: '400',
  },
  moreButton: {
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: fp(1.4),
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: fp(2.2),
    fontWeight: '700',
    color: '#0F4C5C',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fp(1.4),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F4C5C',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: fp(1.5),
    fontWeight: '700',
  },
});
