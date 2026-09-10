import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Share,
  Linking,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import {fp} from '../utils/responsive';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {
  ChevronLeft,
  Share2,
  CheckCircle,
  MapPin,
  Clock,
  Wallet,
  Compass,
  Navigation,
  Utensils,
  Landmark,
  Trees,
  ShoppingBag,
  Moon,
} from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivityDetail'>;

/**
 * Editorial imagery based on destination or category
 */
const getCategoryHeroImage = (category?: string, dest?: string): string => {
  const d = (dest || '').toLowerCase();
  if (d.includes('tokyo') || d.includes('japan')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop';
  }
  if (d.includes('lisbon') || d.includes('portugal')) {
    return 'https://images.unsplash.com/photo-1585286289943-22877a16fb8e?q=80&w=800&auto=format&fit=crop';
  }
  if (d.includes('paris') || d.includes('france')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop';
  }

  switch (category) {
    case 'food':
      return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop';
    case 'nature':
      return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop';
    case 'nightlife':
      return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop';
    case 'shopping':
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop';
    case 'landmark':
    default:
      return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop';
  }
};

export const ActivityDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const params = route.params;

  // Graceful fallback if opened directly without params
  const activity = params?.activity || {
    name: 'Historic City Exploration',
    time: '10:00 AM',
    description:
      'Immerse yourself in local history, architecture, and cultural landmarks handcrafted by your AI travel concierge.',
    location: 'City Center',
    estimatedCost: 'Free - €15',
    category: 'landmark' as const,
    coordinates: {latitude: 38.7139, longitude: -9.1335},
  };

  const dayNumber = params?.dayNumber || 1;
  const destination = params?.destination || 'Destination';
  const heroImage = getCategoryHeroImage(activity.category, destination);

  const handleOpenDirections = async () => {
    const lat = activity.coordinates?.latitude;
    const lon = activity.coordinates?.longitude;
    const placeName = encodeURIComponent(activity.name);

    let mapUrl = '';
    if (lat && lon) {
      if (Platform.OS === 'ios') {
        mapUrl = `https://maps.apple.com/?q=${placeName}&ll=${lat},${lon}`;
      } else {
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      }
    } else {
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${placeName}+${encodeURIComponent(
        destination,
      )}`;
    }

    try {
      const supported = await Linking.canOpenURL(mapUrl);
      if (supported) {
        await Linking.openURL(mapUrl);
      } else {
        await Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${placeName}`,
        );
      }
    } catch {
      Alert.alert(
        'Directions Error',
        'Could not open map navigation application.',
      );
    }
  };

  const handleShareActivity = async () => {
    try {
      const message =
        `${activity.name}\n` +
        `Time: ${activity.time}\n` +
        `Location: ${activity.location}\n` +
        `Cost: ${activity.estimatedCost || 'Free entry'}\n\n` +
        `${activity.description}\n\n` +
        `Handpicked stop for Day ${dayNumber} in ${destination} via ItinerAI`;

      await Share.share({
        message,
        title: activity.name,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <Utensils size={14} color="#FF6B4A" />;
      case 'landmark':
        return <Landmark size={14} color="#3B82F6" />;
      case 'nature':
        return <Trees size={14} color="#10B981" />;
      case 'nightlife':
        return <Moon size={14} color="#8B5CF6" />;
      case 'shopping':
        return <ShoppingBag size={14} color="#F59E0B" />;
      default:
        return <Compass size={14} color="#0F4C5C" />;
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
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{uri: heroImage}} style={styles.headerImage} />

          {/* Top Actions */}
          <SafeAreaView style={styles.topActionsSafeArea}>
            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.goBack()}>
                <ChevronLeft color="#FFF" size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleShareActivity}>
                <Share2 color="#FFF" size={20} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Floating Category Pill */}
          <View style={styles.floatingTag}>
            {renderCategoryIcon(activity.category)}
            <Text style={styles.floatingTagText}>
              {activity.category.toUpperCase()} STOP
            </Text>
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.dayTimeText}>
            DAY {dayNumber} • {activity.time}
          </Text>

          <Text style={styles.title}>{activity.name}</Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagBase}>
              <Text style={styles.tagBaseText}>
                {activity.category.toUpperCase()}
              </Text>
            </View>
            <View style={styles.tagSaved}>
              <CheckCircle color="#10B981" size={14} style={{marginRight: 4}} />
              <Text style={styles.tagSavedText}>INCLUDED IN ITINERARY</Text>
            </View>
          </View>

          <Text style={styles.description}>{activity.description}</Text>

          {/* Info Cards */}
          <View style={styles.infoCardsRow}>
            <View style={styles.infoCard}>
              <Wallet size={16} color="#0F4C5C" style={{marginBottom: 4}} />
              <Text style={styles.infoCardLabel}>ESTIMATED COST</Text>
              <Text style={styles.infoCardValue}>
                {activity.estimatedCost || 'Free entry'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Clock size={16} color="#0F4C5C" style={{marginBottom: 4}} />
              <Text style={styles.infoCardLabel}>SCHEDULED TIME</Text>
              <Text style={styles.infoCardValue}>{activity.time}</Text>
            </View>
          </View>

          {/* Location Details Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationIconCircle}>
              <MapPin size={20} color="#FF6B4A" />
            </View>
            <View style={styles.locationInfoCol}>
              <Text style={styles.locationTitle}>Location & Address</Text>
              <Text style={styles.locationAddressText}>
                {activity.location}
              </Text>
              {activity.coordinates && (
                <Text style={styles.coordsText}>
                  GPS: {activity.coordinates.latitude.toFixed(4)},{' '}
                  {activity.coordinates.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryDirectionsBtn}
              activeOpacity={0.8}
              onPress={handleOpenDirections}>
              <Navigation size={18} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.primaryDirectionsText}>Get Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryShareBtn}
              activeOpacity={0.8}
              onPress={handleShareActivity}>
              <Share2 size={16} color="#0F4C5C" style={{marginRight: 6}} />
              <Text style={styles.secondaryShareText}>Share Stop</Text>
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
  imageContainer: {
    height: 320,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  topActionsSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingTag: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    gap: 6,
  },
  floatingTagText: {
    fontSize: fp(1.15),
    fontWeight: '700',
    color: '#0F4C5C',
    letterSpacing: 0.5,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    marginTop: -20,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  dayTimeText: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#FF6B4A',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: fp(3.0),
    fontWeight: '800',
    color: '#0F4C5C',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  tagBase: {
    backgroundColor: '#E6F4F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagBaseText: {
    fontSize: fp(1.15),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  tagSaved: {
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagSavedText: {
    fontSize: fp(1.15),
    fontWeight: '700',
    color: '#059669',
  },
  description: {
    fontSize: fp(1.5),
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 24,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.08)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardLabel: {
    fontSize: fp(1.05),
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: fp(1.4),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.08)',
    marginBottom: 28,
  },
  locationIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  locationInfoCol: {
    flex: 1,
  },
  locationTitle: {
    fontSize: fp(1.4),
    fontWeight: '700',
    color: '#0F4C5C',
    marginBottom: 2,
  },
  locationAddressText: {
    fontSize: fp(1.3),
    color: '#4B5563',
    lineHeight: 18,
  },
  coordsText: {
    fontSize: fp(1.1),
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryDirectionsBtn: {
    backgroundColor: '#0F4C5C',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#0F4C5C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryDirectionsText: {
    color: '#FFFFFF',
    fontSize: fp(1.6),
    fontWeight: '700',
  },
  secondaryShareBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.15)',
  },
  secondaryShareText: {
    color: '#0F4C5C',
    fontSize: fp(1.45),
    fontWeight: '700',
  },
});
