import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchWeatherForTrip, pivotActivity } from '../store/itinerarySlice';
import { getWeatherTip } from '../services/weatherService';
import { MapRoute } from '../components/MapRoute';
import { Activity, Itinerary } from '../types/trip';
import {
  ChevronLeft,
  Share2,
  Bookmark,
  MapPin,
  Utensils,
  Landmark,
  Trees,
  Moon,
  ShoppingBag,
  Compass,
  Sparkles,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind,
  Droplets,
  X,
  Check,
  Footprints,
} from 'lucide-react-native';
import { fp } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'ItineraryDetail'>;

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

const FALLBACK_ITINERARY: Itinerary = {
  destination: 'Lisbon, Portugal',
  days: [
    {
      day: 1,
      activities: [
        {
          name: 'Pasteis de Belém',
          time: '09:30 AM',
          description:
            'Historic bakery famous for original custard tarts. Essential Lisbon culinary experience.',
          location: 'R. de Belém 84-92, 1300-085 Lisboa',
          estimatedCost: '€10-15',
          category: 'food',
          coordinates: { latitude: 38.6975, longitude: -9.2032 },
        },
        {
          name: 'Jerónimos Monastery',
          time: '11:00 AM',
          description:
            'UNESCO World Heritage site showcasing intricate Manueline gothic architecture.',
          location: 'Praça do Império 1400-206 Lisboa',
          estimatedCost: '€12',
          category: 'landmark',
          coordinates: { latitude: 38.6979, longitude: -9.2066 },
        },
        {
          name: 'Miradouro de Santa Catarina',
          time: '02:30 PM',
          description:
            'Scenic viewpoint offering panoramic vistas of the Tagus River and 25th of April Bridge.',
          location: 'R. de Santa Catarina, 1200-012 Lisboa',
          estimatedCost: 'Free',
          category: 'nature',
          coordinates: { latitude: 38.7107, longitude: -9.1485 },
        },
        {
          name: 'Bairro Alto Dining & Fado',
          time: '07:30 PM',
          description:
            'Atmospheric evening dining enjoying traditional Portuguese tapas and soulful live Fado.',
          location: 'Bairro Alto, Lisboa',
          estimatedCost: '€30-45',
          category: 'nightlife',
          coordinates: { latitude: 38.7126, longitude: -9.1444 },
        },
      ],
    },
    {
      day: 2,
      activities: [
        {
          name: 'São Jorge Castle',
          time: '10:00 AM',
          description:
            'Historic hilltop fortification with pine-shaded courtyards and sweeping city panoramas.',
          location: 'R. de Santa Cruz do Castelo, 1100-129 Lisboa',
          estimatedCost: '€15',
          category: 'landmark',
          coordinates: { latitude: 38.7139, longitude: -9.1335 },
        },
        {
          name: 'Time Out Market',
          time: '01:00 PM',
          description:
            'Curated gourmet food hall featuring top local chefs and traditional culinary specialties.',
          location: 'Av. 24 de Julho 49, 1200-479 Lisboa',
          estimatedCost: '€18-25',
          category: 'food',
          coordinates: { latitude: 38.7071, longitude: -9.146 },
        },
        {
          name: 'Avenida da Liberdade',
          time: '04:00 PM',
          description:
            'Tree-lined boulevard with luxury boutiques, tiled pavements, and historic open cafes.',
          location: 'Av. da Liberdade, Lisboa',
          estimatedCost: 'Varies',
          category: 'shopping',
          coordinates: { latitude: 38.7205, longitude: -9.1465 },
        },
      ],
    },
  ],
};

const REASON_OPTIONS = [
  { id: 'indoor', label: '🌧️ Indoor alternative (Rain-safe)' },
  { id: 'budget', label: '💰 Budget-friendly pick' },
  { id: 'relaxed', label: '🚶 Less walking / Relaxed' },
  { id: 'food', label: '🍽️ Food & cafe spot' },
  { id: 'surprise', label: '✨ Surprise alternative' },
];

export const ItineraryDetailScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentItinerary, weather, weatherLoading, pivotingActivity } =
    useSelector((state: RootState) => state.itinerary);
  const { budget } = useSelector((state: RootState) => state.trip);

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Swap modal states
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [selectedReason, setSelectedReason] = useState<string>(
    '🌧️ Indoor alternative (Rain-safe)',
  );
  const [customReason, setCustomReason] = useState<string>('');

  const displayItinerary: Itinerary = currentItinerary || FALLBACK_ITINERARY;
  const isMock = !currentItinerary;

  const destinationStr = displayItinerary.destination;
  const cityName = destinationStr.split(',')[0].trim();
  const daysCount = displayItinerary.days.length;
  const heroImageUrl = getDestinationImage(destinationStr);

  // Fetch weather context on mount / when itinerary updates
  useEffect(() => {
    const destination = displayItinerary.destination;
    const firstCoord = displayItinerary.days?.[0]?.activities?.find(
      (a: Activity) => a.coordinates?.latitude && a.coordinates?.longitude,
    )?.coordinates;

    if (!weather && !weatherLoading) {
      dispatch(fetchWeatherForTrip({ destination, coordinates: firstCoord }));
    }
  }, [dispatch, displayItinerary, weather, weatherLoading]);

  // Activities for current active day
  const currentDayActivities: Activity[] =
    displayItinerary.days[activeDayIndex]?.activities || [];

  const totalActivitiesCount = displayItinerary.days.reduce(
    (acc, d) => acc + d.activities.length,
    0,
  );

  const renderWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return <CloudRain size={22} color="#38BDF8" />;
    }
    if (cond.includes('thunderstorm')) {
      return <CloudLightning size={22} color="#A78BFA" />;
    }
    if (cond.includes('snow')) {
      return <CloudSnow size={22} color="#67E8F9" />;
    }
    if (cond.includes('cloud')) {
      return <Cloud size={22} color="#93C5FD" />;
    }
    if (cond.includes('clear')) {
      return <Sun size={22} color="#F59E0B" />;
    }
    return <Wind size={22} color="#0F4C5C" />;
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <Utensils size={16} color="#FF6B4A" />;
      case 'landmark':
        return <Landmark size={16} color="#3B82F6" />;
      case 'nature':
        return <Trees size={16} color="#10B981" />;
      case 'nightlife':
        return <Moon size={16} color="#8B5CF6" />;
      case 'shopping':
        return <ShoppingBag size={16} color="#F59E0B" />;
      case 'other':
      default:
        return <Compass size={16} color="#0F4C5C" />;
    }
  };

  const getCategoryTagStyle = (category: string) => {
    switch (category) {
      case 'food':
        return { backgroundColor: '#FFF1F2', color: '#E11D48' };
      case 'landmark':
        return { backgroundColor: '#EFF6FF', color: '#2563EB' };
      case 'nature':
        return { backgroundColor: '#ECFDF5', color: '#059669' };
      case 'nightlife':
        return { backgroundColor: '#F5F3FF', color: '#7C3AED' };
      case 'shopping':
        return { backgroundColor: '#FFFBEB', color: '#D97706' };
      case 'other':
      default:
        return { backgroundColor: '#E6F4F1', color: '#0F4C5C' };
    }
  };

  const handleOpenSwap = (index: number) => {
    setSelectedActivityIndex(index);
    if (
      weather?.condition &&
      (weather.condition.toLowerCase().includes('rain') ||
        weather.condition.toLowerCase().includes('drizzle'))
    ) {
      setSelectedReason('🌧️ Indoor alternative (Rain-safe)');
    } else {
      setSelectedReason('✨ Surprise alternative');
    }
    setCustomReason('');
    setSwapModalVisible(true);
  };

  const handleConfirmSwap = () => {
    if (selectedActivityIndex === null) {
      return;
    }
    const reasonToUse = customReason.trim()
      ? customReason.trim()
      : selectedReason;
    setSwapModalVisible(false);

    dispatch(
      pivotActivity({
        dayIndex: activeDayIndex,
        activityIndex: selectedActivityIndex,
        reason: reasonToUse,
        fallbackItinerary: isMock ? FALLBACK_ITINERARY : undefined,
      }),
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Editorial Destination Hero */}
        <ImageBackground source={{ uri: heroImageUrl }} style={styles.heroBackground}>
          <View style={styles.heroOverlay}>
            <SafeAreaView style={styles.heroSafeArea}>
              {/* Top Navigation */}
              <View style={styles.topNavRow}>
                <TouchableOpacity
                  style={styles.circleNavBtn}
                  onPress={() => navigation.goBack()}>
                  <ChevronLeft size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.topNavRight}>
                  <TouchableOpacity style={styles.circleNavBtn}>
                    <Bookmark size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.circleNavBtn}>
                    <Share2 size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hero Bottom Title & Info */}
              <View style={styles.heroBottomContent}>
                <View style={styles.heroPillRow}>
                  <View style={styles.locationPill}>
                    <MapPin size={11} color="#FF6B4A" style={styles.pillIcon} />
                    <Text style={styles.locationPillText}>
                      {cityName.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.tierPill}>
                    <Text style={styles.tierPillText}>
                      {budget.toUpperCase()} BUDGET
                    </Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>{cityName} Daily Plan</Text>
                <Text style={styles.heroSubtitle}>
                  {daysCount} Days • {totalActivitiesCount} Handpicked Stops
                </Text>
              </View>
            </SafeAreaView>
          </View>
        </ImageBackground>

        {/* Main Content Area */}
        <View style={styles.mainContentSheet}>
          {/* Glassmorphic Real-Time Weather Context */}
          <View style={styles.weatherCard}>
            {weatherLoading ? (
              <View style={styles.weatherLoadingRow}>
                <ActivityIndicator size="small" color="#0F4C5C" />
                <Text style={styles.weatherLoadingText}>
                  Updating live weather for {cityName}...
                </Text>
              </View>
            ) : weather ? (
              <View>
                <View style={styles.weatherTopRow}>
                  <View style={styles.weatherLeft}>
                    <View style={styles.weatherIconCircle}>
                      {renderWeatherIcon(weather.condition)}
                    </View>
                    <View>
                      <View style={styles.tempConditionRow}>
                        <Text style={styles.tempText}>{weather.temp}°C</Text>
                        <View style={styles.conditionTag}>
                          <Text style={styles.conditionTagText}>
                            {weather.condition}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.weatherDescription}>
                        {weather.cityName} • {weather.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.weatherRight}>
                    <View style={styles.weatherStatItem}>
                      <Droplets size={12} color="#0F4C5C" style={styles.statIcon} />
                      <Text style={styles.weatherStatText}>{weather.humidity}%</Text>
                    </View>
                    <View style={styles.weatherStatItem}>
                      <Wind size={12} color="#0F4C5C" style={styles.statIcon} />
                      <Text style={styles.weatherStatText}>
                        {weather.windSpeed} m/s
                      </Text>
                    </View>
                  </View>
                </View>

                {/* AI Smart Advisory Banner */}
                <View style={styles.advisoryBanner}>
                  <Text style={styles.advisoryText}>
                    {getWeatherTip(weather.condition, weather.temp)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.weatherTopRow}>
                <View style={styles.weatherIconCircle}>
                  <Sun size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.tempText}>{cityName}</Text>
                  <Text style={styles.weatherDescription}>
                    Destination context ready for itinerary
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Day Selector Segmented Tabs */}
          <View style={styles.daySelectorWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}>
              {displayItinerary.days.map((d, index) => {
                const isActive = activeDayIndex === index;
                return (
                  <TouchableOpacity
                    key={d.day}
                    activeOpacity={0.7}
                    style={[styles.dayTabPill, isActive && styles.dayTabPillActive]}
                    onPress={() => setActiveDayIndex(index)}>
                    <Text
                      style={[
                        styles.dayTabText,
                        isActive && styles.dayTabTextActive,
                      ]}>
                      Day {d.day}
                    </Text>
                    <Text
                      style={[
                        styles.dayTabSub,
                        isActive && styles.dayTabSubActive,
                      ]}>
                      {d.activities.length} stops
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Day Route Map Preview */}
          <View style={styles.mapSection}>
            <View style={styles.mapCard}>
              <MapRoute activities={currentDayActivities} />
              <View style={styles.mapBadge}>
                <Text style={styles.mapBadgeText}>
                  Day {activeDayIndex + 1} Route • {currentDayActivities.length} Stops
                </Text>
              </View>
            </View>
          </View>

          {/* Connected Day Timeline Schedule */}
          <View style={styles.timelineSection}>
            <View style={styles.timelineHeaderRow}>
              <Text style={styles.sectionHeading}>
                Day {activeDayIndex + 1} Schedule
              </Text>
              <Text style={styles.sectionStopsCount}>
                {currentDayActivities.length} Stops Planned
              </Text>
            </View>

            <View style={styles.timelineList}>
              {currentDayActivities.map((activity, index) => {
                const isPivoting =
                  pivotingActivity?.dayIndex === activeDayIndex &&
                  pivotingActivity?.activityIndex === index;

                const tagStyle = getCategoryTagStyle(activity.category);

                if (isPivoting) {
                  return (
                    <View key={`pivoting-${index}`} style={styles.pivotingCard}>
                      <ActivityIndicator
                        size="small"
                        color="#0F4C5C"
                        style={styles.pivotingSpinner}
                      />
                      <View style={styles.pivotingTextCol}>
                        <Text style={styles.pivotingTitle}>
                          AI Concierge is finding alternative...
                        </Text>
                        <Text style={styles.pivotingSubtitle}>
                          Customizing {activity.time} slot matching weather & neighborhood
                        </Text>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={`${activity.name}-${index}`}>
                    {/* Activity Item Card */}
                    <View style={styles.activityCard}>
                      {/* Top Card Row: Category Badge & Swap Button */}
                      <View style={styles.cardHeaderRow}>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: tagStyle.backgroundColor },
                          ]}>
                          {renderCategoryIcon(activity.category)}
                          <Text
                            style={[
                              styles.categoryBadgeText,
                              { color: tagStyle.color },
                            ]}>
                            {activity.category.toUpperCase()}
                          </Text>
                        </View>

                        {/* Interactive Swap / Pivot Button */}
                        <TouchableOpacity
                          style={styles.swapActionBtn}
                          activeOpacity={0.7}
                          onPress={() => handleOpenSwap(index)}>
                          <Sparkles
                            size={12}
                            color="#0F4C5C"
                            style={styles.swapActionIcon}
                          />
                          <Text style={styles.swapActionText}>Swap</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Main Title & Time */}
                      <Text style={styles.activityNameText}>{activity.name}</Text>

                      <View style={styles.timeLocationRow}>
                        <View style={styles.timeTag}>
                          <Text style={styles.timeTagText}>{activity.time}</Text>
                        </View>
                        <View style={styles.locationCol}>
                          <MapPin size={12} color="#94A3B8" style={styles.locIcon} />
                          <Text
                            style={styles.locationText}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {activity.location}
                          </Text>
                        </View>
                      </View>

                      {/* Description */}
                      <Text style={styles.activityDescriptionText}>
                        {activity.description}
                      </Text>

                      {/* Footer: Estimated Cost */}
                      <View style={styles.cardFooter}>
                        <Text style={styles.costLabel}>Estimated Cost</Text>
                        <Text style={styles.costValue}>
                          {activity.estimatedCost || 'Free entry'}
                        </Text>
                      </View>
                    </View>

                    {/* Realistic Transit / Walking Connector Between Stops */}
                    {index < currentDayActivities.length - 1 && (
                      <View style={styles.transitConnector}>
                        <View style={styles.transitLine} />
                        <View style={styles.transitBubble}>
                          <Footprints size={12} color="#94A3B8" style={styles.transitIcon} />
                          <Text style={styles.transitText}>
                            ~10-20 min transit / walk to next stop
                          </Text>
                        </View>
                        <View style={styles.transitLine} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Interactive Pivot / Swap Bottom Sheet Modal */}
      <Modal
        visible={swapModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSwapModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSwapModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleCol}>
                <View style={styles.modalTitleRow}>
                  <Sparkles
                    size={18}
                    color="#FF6B4A"
                    style={styles.modalSparklesIcon}
                  />
                  <Text style={styles.modalTitle}>Pivot / Swap Stop</Text>
                </View>
                <Text style={styles.modalSubtitle}>
                  Gemini will generate a context-aware alternative
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSwapModalVisible(false)}>
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Target Activity Preview */}
            {selectedActivityIndex !== null &&
              currentDayActivities[selectedActivityIndex] && (
                <View style={styles.modalPreviewBox}>
                  <Text style={styles.modalPreviewLabel}>CURRENT ACTIVITY</Text>
                  <Text style={styles.modalPreviewName}>
                    {currentDayActivities[selectedActivityIndex].name}
                  </Text>
                  <Text style={styles.modalPreviewMeta}>
                    {currentDayActivities[selectedActivityIndex].time} •{' '}
                    {currentDayActivities[
                      selectedActivityIndex
                    ].category.toUpperCase()}
                  </Text>
                </View>
              )}

            {/* Weather context notice */}
            {weather && (
              <View style={styles.modalWeatherBadge}>
                <Text style={styles.modalWeatherText}>
                  Current weather: {weather.condition} ({weather.temp}°C)
                </Text>
              </View>
            )}

            {/* Reason Chips */}
            <Text style={styles.modalSectionLabel}>Select reason or vibe:</Text>
            <View style={styles.chipsContainer}>
              {REASON_OPTIONS.map(opt => {
                const isSelected = selectedReason === opt.label;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.7}
                    style={[
                      styles.modalReasonChip,
                      isSelected && styles.modalReasonChipSelected,
                    ]}
                    onPress={() => setSelectedReason(opt.label)}>
                    <Text
                      style={[
                        styles.modalReasonText,
                        isSelected && styles.modalReasonTextSelected,
                      ]}>
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Check size={13} color="#0F4C5C" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional Custom Instructions */}
            <Text style={styles.modalSectionLabel}>
              Custom instructions (optional):
            </Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="e.g. Prefer an authentic artisan cafe or rooftop view"
              placeholderTextColor="#9CA3AF"
              value={customReason}
              onChangeText={setCustomReason}
              maxLength={120}
            />

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.8}
              onPress={handleConfirmSwap}>
              <Sparkles size={16} color="#FFFFFF" style={styles.confirmIcon} />
              <Text style={styles.modalConfirmBtnText}>
                Generate Smart Alternative
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.shareTripBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('TripSummary')}>
          <Compass size={18} color="#0F4C5C" style={styles.barIcon} />
          <Text style={styles.shareTripBtnText}>Trip Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportBtn}
          activeOpacity={0.8}
          onPress={() => { }}>
          <Share2 size={18} color="#FFFFFF" style={styles.barIcon} />
          <Text style={styles.exportBtnText}>Share Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',

  },
  scrollContent: {
    paddingBottom: 110,
  },

  /* Hero Section */
  heroBackground: {
    width: '100%',
    height: 340,

  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 36, 44, 0.45)',
    justifyContent: 'space-between',
  },
  heroSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,

  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  topNavRight: {
    flexDirection: 'row',
    gap: 10,
  },
  circleNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBottomContent: {
    paddingBottom: 36,
  },
  heroPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillIcon: {
    marginRight: 4,
  },
  locationPillText: {
    color: '#FFFFFF',
    fontSize: fp(1.1),
    fontWeight: '700',
    letterSpacing: 0.8,

  },
  tierPill: {
    backgroundColor: 'rgba(15, 76, 92, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tierPillText: {
    color: '#FFFFFF',
    fontSize: fp(1.1),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: fp(3.2),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: fp(1.35),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  /* Main Sheet */
  mainContentSheet: {
    backgroundColor: '#FAFAF8',
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },

  /* Weather Card */
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.08)',
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weatherLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  weatherLoadingText: {
    fontSize: fp(1.35),
    color: '#0F4C5C',
    fontWeight: '500',
  },
  weatherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  weatherIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tempConditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tempText: {
    fontSize: fp(2.0),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  conditionTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  conditionTagText: {
    fontSize: fp(1.15),
    fontWeight: '600',
    color: '#0369A1',
  },
  weatherDescription: {
    fontSize: fp(1.25),
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  weatherRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  weatherStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  statIcon: {
    marginRight: 4,
  },
  weatherStatText: {
    fontSize: fp(1.15),
    fontWeight: '600',
    color: '#0F4C5C',
  },
  advisoryBanner: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0F4C5C',
  },
  advisoryText: {
    fontSize: fp(1.25),
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Day Tabs */
  daySelectorWrapper: {
    marginBottom: 16,
  },
  tabsScrollContent: {
    gap: 10,
  },
  dayTabPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  dayTabPillActive: {
    backgroundColor: '#0F4C5C',
    borderColor: '#0F4C5C',
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  dayTabText: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#64748B',
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  dayTabSub: {
    fontSize: fp(1.1),
    color: '#94A3B8',
    marginTop: 2,
  },
  dayTabSubActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  /* Map Section */
  mapSection: {
    marginBottom: 20,
  },
  mapCard: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  mapBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 76, 92, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  mapBadgeText: {
    fontSize: fp(1.15),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Timeline Section */
  timelineSection: {
    marginBottom: 20,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: fp(1.8),
    fontWeight: '800',
    color: '#0F4C5C',
  },
  sectionStopsCount: {
    fontSize: fp(1.25),
    color: '#6B7280',
    fontWeight: '500',
  },
  timelineList: {
    gap: 0,
  },

  /* Activity Card */
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pivotingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#0F4C5C',
    borderStyle: 'dashed',
    marginVertical: 6,
  },
  pivotingSpinner: {
    marginRight: 12,
  },
  pivotingTextCol: {
    flex: 1,
  },
  pivotingTitle: {
    fontSize: fp(1.45),
    fontWeight: '700',
    color: '#0F4C5C',
    marginBottom: 2,
  },
  pivotingSubtitle: {
    fontSize: fp(1.25),
    color: '#64748B',
    lineHeight: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
  },
  categoryBadgeText: {
    fontSize: fp(1.05),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  swapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.15)',
  },
  swapActionIcon: {
    marginRight: 4,
  },
  swapActionText: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  activityNameText: {
    fontSize: fp(1.75),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  timeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  timeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeTagText: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#334155',
  },
  locationCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIcon: {
    marginRight: 3,
  },
  locationText: {
    fontSize: fp(1.25),
    color: '#64748B',
    flex: 1,
  },
  activityDescriptionText: {
    fontSize: fp(1.35),
    color: '#475569',
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  costLabel: {
    fontSize: fp(1.15),
    color: '#94A3B8',
    fontWeight: '500',
  },
  costValue: {
    fontSize: fp(1.3),
    fontWeight: '700',
    color: '#0F4C5C',
  },

  /* Transit Connector Between Stops */
  transitConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  transitLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  transitBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  transitIcon: {
    marginRight: 4,
  },
  transitText: {
    fontSize: fp(1.05),
    color: '#64748B',
    fontWeight: '500',
  },

  /* Swap Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitleCol: {
    flex: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSparklesIcon: {
    marginRight: 6,
  },
  modalTitle: {
    fontSize: fp(2.0),
    fontWeight: '800',
    color: '#0F4C5C',
  },
  modalSubtitle: {
    fontSize: fp(1.35),
    color: '#6B7280',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPreviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B4A',
  },
  modalPreviewLabel: {
    fontSize: fp(1.05),
    fontWeight: '700',
    color: '#FF6B4A',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalPreviewName: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#1E293B',
  },
  modalPreviewMeta: {
    fontSize: fp(1.2),
    color: '#64748B',
    marginTop: 2,
  },
  modalWeatherBadge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  modalWeatherText: {
    fontSize: fp(1.2),
    fontWeight: '600',
    color: '#0369A1',
  },
  modalSectionLabel: {
    fontSize: fp(1.4),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalReasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  modalReasonChipSelected: {
    backgroundColor: '#E6F4F1',
    borderColor: '#0F4C5C',
  },
  modalReasonText: {
    fontSize: fp(1.25),
    fontWeight: '500',
    color: '#475569',
  },
  modalReasonTextSelected: {
    color: '#0F4C5C',
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: 6,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: fp(1.35),
    color: '#1E293B',
    marginBottom: 20,
  },
  modalConfirmBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0F4C5C',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmIcon: {
    marginRight: 8,
  },
  modalConfirmBtnText: {
    fontSize: fp(1.65),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  shareTripBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0F4C5C',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  },
  barIcon: {
    marginRight: 6,
  },
  shareTripBtnText: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  exportBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  exportBtnText: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
