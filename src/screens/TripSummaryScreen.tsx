import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import {fp} from '../utils/responsive';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {
  ChevronLeft,
  Share2,
  Bookmark,
  Calendar,
  Wallet,
  MapPin,
  ArrowRight,
  Sun,
  CloudRain,
  Compass,
  Utensils,
  Landmark,
  Trees,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store';
import {saveTrip, deleteTrip} from '../store/savedTripsSlice';
import {SavedTrip} from '../services/storageService';
import {MapRoute} from '../components/MapRoute';

type Props = NativeStackScreenProps<RootStackParamList, 'TripSummary'>;

/**
 * Maps destination query to curated high-resolution editorial travel imagery
 */
const getDestinationImage = (dest?: string): string => {
  if (!dest) {
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop';
  }
  const d = dest.toLowerCase();
  if (d.includes('lisbon') || d.includes('portugal')) {
    return 'https://images.unsplash.com/photo-1585286289943-22877a16fb8e?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('tokyo') || d.includes('japan')) {
    return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('paris') || d.includes('france')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('london') || d.includes('uk') || d.includes('england')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('new york') || d.includes('nyc')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('rome') || d.includes('italy')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('barcelona') || d.includes('spain')) {
    return 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('bali') || d.includes('indonesia')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('amsterdam') || d.includes('netherlands')) {
    return 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('dubai') || d.includes('uae')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop';
  }
  if (d.includes('swiss') || d.includes('switzerland') || d.includes('alps')) {
    return 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1000&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop';
};

/**
 * Calculates a realistic estimated budget range based on days and tier
 */
const getEstimatedBudget = (
  budgetLevel: 'low' | 'mid' | 'high',
  numDays: number,
): string => {
  if (budgetLevel === 'low') {
    const min = numDays * 45;
    const max = numDays * 70;
    return `$${min} - $${max}`;
  }
  if (budgetLevel === 'high') {
    const min = numDays * 250;
    const max = numDays * 400;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }
  const min = numDays * 110;
  const max = numDays * 160;
  return `$${min} - $${max}`;
};

export const TripSummaryScreen: React.FC<Props> = ({route, navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {currentItinerary, weather} = useSelector(
    (state: RootState) => state.itinerary,
  );
  const {budget, destination, days} = useSelector(
    (state: RootState) => state.trip,
  );
  const {trips: savedTrips} = useSelector(
    (state: RootState) => state.savedTrips,
  );

  const displayDestination =
    currentItinerary?.destination || destination || 'Your Destination';
  const cityName = displayDestination.split(',')[0].trim();
  const numDays = currentItinerary?.days?.length || days || 5;

  const heroImageUrl = getDestinationImage(displayDestination);
  const estCostStr = getEstimatedBudget(budget || 'mid', numDays);

  const allActivities = useMemo(
    () =>
      currentItinerary
        ? currentItinerary.days.flatMap((d: any) => d.activities)
        : [],
    [currentItinerary],
  );

  // Category breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allActivities.forEach((a: any) => {
      const cat = a.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allActivities]);

  const isBookmarked = useMemo(() => {
    return savedTrips.some(
      t =>
        (route.params?.tripId && t.id === route.params.tripId) ||
        t.destination.trim().toLowerCase() ===
          displayDestination.trim().toLowerCase(),
    );
  }, [savedTrips, route.params?.tripId, displayDestination]);

  const handleToggleBookmark = () => {
    const existing = savedTrips.find(
      t =>
        (route.params?.tripId && t.id === route.params.tripId) ||
        t.destination.trim().toLowerCase() ===
          displayDestination.trim().toLowerCase(),
    );

    if (existing) {
      dispatch(deleteTrip(existing.id));
      Alert.alert(
        'Trip Removed',
        'Removed from your offline saved trips collection.',
      );
    } else if (currentItinerary) {
      const newTrip: SavedTrip = {
        id: route.params?.tripId || `trip_${Date.now()}`,
        title: `${cityName} Journey`,
        destination: displayDestination,
        dates: `${numDays} Days Plan`,
        duration: `${numDays} days`,
        status: 'UPCOMING',
        imageUrl: heroImageUrl,
        itinerary: currentItinerary,
        weather: weather,
        savedAt: Date.now(),
        budget: budget || 'mid',
      };
      dispatch(saveTrip(newTrip));
      Alert.alert(
        'Trip Saved!',
        'This itinerary is now stored offline on your device.',
      );
    }
  };

  const handleShareTrip = async () => {
    try {
      let shareMsg = `${cityName} Journey (${numDays} Days)\nDestination: ${displayDestination}\nEstimated Budget: ${estCostStr}\n\n`;
      if (currentItinerary) {
        currentItinerary.days.forEach(d => {
          shareMsg += `Day ${d.day}:\n`;
          d.activities.forEach(a => {
            shareMsg += `• ${a.time}: ${a.name} (${a.location})\n`;
          });
          shareMsg += '\n';
        });
      }
      shareMsg += 'Handcrafted with ItinerAI';

      await Share.share({
        message: shareMsg,
        title: `${cityName} Journey`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        {/* Editorial Destination Hero */}
        <ImageBackground
          source={{uri: heroImageUrl}}
          style={styles.heroBackground}>
          <View style={styles.heroShading}>
            {/* Top Navigation Bar */}
            <SafeAreaView style={styles.topNavSafeArea}>
              <View style={styles.topNavRow}>
                <TouchableOpacity
                  style={styles.navIconButton}
                  onPress={() => navigation.goBack()}>
                  <ChevronLeft color="#FFFFFF" size={22} />
                </TouchableOpacity>

                <View style={styles.topNavRight}>
                  <TouchableOpacity
                    style={[
                      styles.navIconButton,
                      isBookmarked && styles.navIconButtonActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={handleToggleBookmark}>
                    <Bookmark
                      color="#FFFFFF"
                      size={18}
                      fill={isBookmarked ? '#FFFFFF' : 'none'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navIconButton}
                    activeOpacity={0.8}
                    onPress={handleShareTrip}>
                    <Share2 color="#FFFFFF" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>

            {/* Bottom Hero Title & Badges */}
            <View style={styles.heroContent}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroPill}>
                  <MapPin
                    size={11}
                    color="#FF6B4A"
                    style={styles.heroPillIcon}
                  />
                  <Text style={styles.heroPillText}>ITINERARY GENERATED</Text>
                </View>

                {weather && (
                  <View style={styles.weatherHeroPill}>
                    {weather.condition.toLowerCase().includes('rain') ? (
                      <CloudRain
                        size={11}
                        color="#38BDF8"
                        style={styles.heroPillIcon}
                      />
                    ) : (
                      <Sun
                        size={11}
                        color="#F59E0B"
                        style={styles.heroPillIcon}
                      />
                    )}
                    <Text style={styles.weatherHeroText}>
                      {weather.temp}°C • {weather.condition}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.heroTitle}>{cityName} Journey</Text>
              <Text style={styles.heroSubtitle}>
                {numDays} Days • {budget.toUpperCase()} Tier • Handcrafted with
                Gemini AI
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* Main Content Card */}
        <View style={styles.cardContainer}>
          {/* Executive Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Calendar color="#0F4C5C" size={18} />
              </View>
              <Text style={styles.statLabel}>DURATION</Text>
              <Text style={styles.statValue}>{numDays} Days</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Compass color="#0F4C5C" size={18} />
              </View>
              <Text style={styles.statLabel}>TOTAL STOPS</Text>
              <Text style={styles.statValue}>
                {allActivities.length > 0
                  ? `${allActivities.length} Spots`
                  : `${numDays * 3} Spots`}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Wallet color="#0F4C5C" size={18} />
              </View>
              <Text style={styles.statLabel}>EST. BUDGET</Text>
              <Text style={styles.statValue}>{estCostStr}</Text>
            </View>
          </View>

          {/* Interactive Map Route Preview */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Interactive Route Preview</Text>
            <Text style={styles.sectionSubtitle}>
              {allActivities.length} Geocoded stops
            </Text>
          </View>

          <View style={styles.mapContainer}>
            <MapRoute activities={allActivities} />
            <TouchableOpacity
              style={styles.mapOverlayButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ItineraryDetail')}>
              <Text style={styles.mapOverlayText}>Tap to explore route</Text>
              <ArrowRight
                size={14}
                color="#0F4C5C"
                style={styles.mapOverlayIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Daily Schedule Breakdown */}
          {currentItinerary &&
            currentItinerary.days &&
            currentItinerary.days.length > 0 && (
              <View style={styles.timelineSection}>
                <Text style={styles.sectionTitle}>Daily Roadmap</Text>

                <View style={styles.daysList}>
                  {currentItinerary.days.slice(0, 3).map(dayObj => (
                    <TouchableOpacity
                      key={dayObj.day}
                      style={styles.dayRowCard}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('ItineraryDetail')}>
                      <View style={styles.dayNumberPill}>
                        <Text style={styles.dayNumberText}>
                          DAY {dayObj.day}
                        </Text>
                      </View>

                      <View style={styles.dayDetailsCol}>
                        <Text style={styles.dayStopsHeading}>
                          {dayObj.activities.length} Stops Planned
                        </Text>
                        <Text
                          style={styles.dayActivitiesSnippet}
                          numberOfLines={1}>
                          {dayObj.activities.map(a => a.name).join(' • ')}
                        </Text>
                      </View>

                      <ArrowRight size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}

                  {currentItinerary.days.length > 3 && (
                    <TouchableOpacity
                      style={styles.seeAllDaysBtn}
                      onPress={() => navigation.navigate('ItineraryDetail')}>
                      <Text style={styles.seeAllDaysText}>
                        + View remaining {currentItinerary.days.length - 3} days
                        in full schedule
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

          {/* Category Experience Chips */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Experience Highlights</Text>
            <View style={styles.chipsRow}>
              {categoryCounts.landmark && (
                <View style={styles.categoryChip}>
                  <Landmark size={13} color="#3B82F6" style={styles.chipIcon} />
                  <Text style={styles.categoryChipText}>
                    {categoryCounts.landmark} Historic Landmarks
                  </Text>
                </View>
              )}
              {categoryCounts.food && (
                <View style={styles.categoryChip}>
                  <Utensils size={13} color="#FF6B4A" style={styles.chipIcon} />
                  <Text style={styles.categoryChipText}>
                    {categoryCounts.food} Culinary Stops
                  </Text>
                </View>
              )}
              {categoryCounts.nature && (
                <View style={styles.categoryChip}>
                  <Trees size={13} color="#10B981" style={styles.chipIcon} />
                  <Text style={styles.categoryChipText}>
                    {categoryCounts.nature} Scenic Spots
                  </Text>
                </View>
              )}
              {categoryCounts.shopping && (
                <View style={styles.categoryChip}>
                  <ShoppingBag
                    size={13}
                    color="#F59E0B"
                    style={styles.chipIcon}
                  />
                  <Text style={styles.categoryChipText}>
                    {categoryCounts.shopping} Boutiques & Markets
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Primary CTA & Secondary Options */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryCtaButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ItineraryDetail')}>
              <Text style={styles.primaryCtaText}>
                View Full Schedule & Maps
              </Text>
              <ArrowRight color="#FFFFFF" size={18} style={styles.btnIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryTextButton}
              onPress={() => navigation.navigate('MainTabs', {screen: 'Plan'})}>
              <RotateCcw size={14} color="#6B7280" style={styles.btnIcon} />
              <Text style={styles.secondaryText}>
                Modify preferences or destination
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Hero Section */
  heroBackground: {
    width: '100%',
    height: 380,
  },
  heroShading: {
    flex: 1,
    backgroundColor: 'rgba(7, 36, 44, 0.45)',
    justifyContent: 'space-between',
  },
  topNavSafeArea: {
    paddingTop: 10,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  navIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconButtonActive: {
    backgroundColor: '#FF6B4A',
  },
  topNavRight: {
    flexDirection: 'row',
    gap: 10,
  },
  heroContent: {
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroPillIcon: {
    marginRight: 5,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: fp(1.1),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  weatherHeroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 92, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  weatherHeroText: {
    color: '#FFFFFF',
    fontSize: fp(1.2),
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: fp(3.4),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: fp(1.4),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  /* Card Surface */
  cardContainer: {
    backgroundColor: '#FAFAF8',
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.06)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: fp(1.05),
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: fp(1.45),
    fontWeight: '700',
    color: '#0F4C5C',
  },

  /* Section Titles */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: fp(1.6),
    fontWeight: '700',
    color: '#0F4C5C',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: fp(1.2),
    color: '#6B7280',
    fontWeight: '500',
  },

  /* Map Container */
  mapContainer: {
    width: '100%',
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 26,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.1)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  mapOverlayButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  mapOverlayText: {
    fontSize: fp(1.25),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  mapOverlayIcon: {
    marginLeft: 4,
  },

  /* Daily Roadmap */
  timelineSection: {
    marginBottom: 24,
  },
  daysList: {
    gap: 10,
  },
  dayRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.06)',
  },
  dayNumberPill: {
    backgroundColor: '#0F4C5C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  dayNumberText: {
    color: '#FFFFFF',
    fontSize: fp(1.15),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dayDetailsCol: {
    flex: 1,
    marginRight: 8,
  },
  dayStopsHeading: {
    fontSize: fp(1.4),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  dayActivitiesSnippet: {
    fontSize: fp(1.25),
    color: '#6B7280',
  },
  seeAllDaysBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  seeAllDaysText: {
    fontSize: fp(1.3),
    fontWeight: '600',
    color: '#FF6B4A',
  },

  /* Categories Section */
  categoriesSection: {
    marginBottom: 28,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipIcon: {
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: fp(1.25),
    fontWeight: '600',
    color: '#334155',
  },

  /* Actions */
  actionsContainer: {
    alignItems: 'center',
    paddingTop: 6,
  },
  primaryCtaButton: {
    backgroundColor: '#0F4C5C',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4C5C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 16,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: fp(1.65),
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 6,
  },
  secondaryTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryText: {
    fontSize: fp(1.35),
    fontWeight: '600',
    color: '#6B7280',
  },
});
