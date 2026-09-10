import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MapPin,
  Clock,
  Sun,
  Shuffle,
  BookmarkCheck,
  Globe,
  Heart,
  Calendar,
  Route,
  Download,
  Share2,
  Compass,
} from 'lucide-react-native';
import {fp} from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const {width} = Dimensions.get('window');

interface FloatingBadge {
  icon: any;
  text: string;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  accentColor: string;
}

interface FeatureHighlight {
  icon: any;
  label: string;
}

interface SlideItem {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  image: any;
  floatingBadges: FloatingBadge[];
  features: FeatureHighlight[];
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    step: 'STEP 1 • DESTINATION & STYLE',
    title: 'Tell us where you want to go',
    subtitle:
      'Pick any destination worldwide, set your dates, and select curated travel vibes tailored to you.',
    image: require('../assests/images/onb1.png'),
    floatingBadges: [
      {
        icon: MapPin,
        text: 'Tokyo, Paris, Rome...',
        position: 'top-right',
        accentColor: '#FF6B4A',
      },
      {
        icon: Sparkles,
        text: 'Tailored to your vibe',
        position: 'bottom-left',
        accentColor: '#0F4C5C',
      },
    ],
    features: [
      {icon: Globe, label: '10,000+ Destinations'},
      {icon: Heart, label: 'Custom Interests'},
    ],
  },
  {
    id: '2',
    step: 'STEP 2 • AI ITINERARY ENGINE',
    title: 'Get an AI-crafted day-by-day plan',
    subtitle:
      'Gemini AI orchestrates optimal routes, stop times, and weather-aware suggestions in seconds.',
    image: require('../assests/images/onb2.png'),
    floatingBadges: [
      {
        icon: Clock,
        text: 'Built in 5 seconds',
        position: 'top-left',
        accentColor: '#3B82F6',
      },
      {
        icon: Sun,
        text: 'Live weather synced',
        position: 'bottom-right',
        accentColor: '#F59E0B',
      },
    ],
    features: [
      {icon: Calendar, label: 'Day-by-Day Schedules'},
      {icon: Route, label: 'Optimized Transit'},
    ],
  },
  {
    id: '3',
    step: 'STEP 3 • FLEXIBILITY & OFFLINE',
    title: 'Edit, save, and take it with you',
    subtitle:
      'Swap any stop with 1 tap, bookmark trips for 100% offline access, and share plans with travel buddies.',
    image: require('../assests/images/onb3.png'),
    floatingBadges: [
      {
        icon: Shuffle,
        text: '1-Tap instant swap',
        position: 'top-right',
        accentColor: '#10B981',
      },
      {
        icon: BookmarkCheck,
        text: '100% offline ready',
        position: 'bottom-left',
        accentColor: '#8B5CF6',
      },
    ],
    features: [
      {icon: Download, label: 'Saved Offline Trips'},
      {icon: Share2, label: '1-Tap Group Sharing'},
    ],
  },
];

export const OnboardingScreen: React.FC<Props> = ({navigation}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = async () => {
    await AsyncStorage.setItem('@has_completed_onboarding', 'true');
    navigation.replace('MainTabs', {screen: 'Plan'});
  };

  const handleScrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      handleScrollTo(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleScrollTo(currentIndex - 1);
    }
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };

  const renderItem = ({item}: {item: SlideItem}) => {
    return (
      <View style={styles.slide}>
        {/* Layered Graphic Hero */}
        <View style={styles.graphicCard}>
          <View style={styles.ambientGlow} />
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Floating Vector Icon Badges */}
          {item.floatingBadges.map((badge, idx) => {
            const BadgeIcon = badge.icon;
            const isTop = badge.position.startsWith('top');
            const isLeft = badge.position.endsWith('left');

            return (
              <View
                key={idx}
                style={[
                  styles.floatingBadge,
                  isTop ? styles.badgeTop : styles.badgeBottom,
                  isLeft ? styles.badgeLeft : styles.badgeRight,
                ]}>
                <View
                  style={[
                    styles.badgeIconCircle,
                    {backgroundColor: `${badge.accentColor}15`},
                  ]}>
                  <BadgeIcon size={12} color={badge.accentColor} />
                </View>
                <Text style={styles.badgeText}>{badge.text}</Text>
              </View>
            );
          })}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.stepTag}>{item.step}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>

          {/* Key Feature Benefits with Vector Icons */}
          <View style={styles.featuresRow}>
            {item.features.map((feat, idx) => {
              const FeatIcon = feat.icon;
              return (
                <View key={idx} style={styles.featurePill}>
                  <FeatIcon
                    size={13}
                    color="#0F4C5C"
                    style={styles.featurePillIcon}
                  />
                  <Text style={styles.featurePillText}>{feat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconCircle}>
            <Compass size={16} color="#0F4C5C" />
          </View>
          <Text style={styles.brandTitle}>ItinerAI</Text>
        </View>

        <View style={styles.stepCounterBadge}>
          <Text style={styles.stepCounterText}>
            {currentIndex + 1} of {SLIDES.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleFinish}
          activeOpacity={0.7}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.skipText}>Skip</Text>
          <ChevronRight size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          bounces={false}
        />
      </View>

      {/* Bottom Pagination & Action Controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => handleScrollTo(index)}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Dual Actions Row: Back & Continue */}
        <View style={styles.actionButtonsRow}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePrev}
              activeOpacity={0.8}>
              <ChevronLeft size={22} color="#0F4C5C" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.88}>
            <Text style={styles.buttonText}>
              {currentIndex === SLIDES.length - 1
                ? 'Start Planning Trips'
                : 'Continue'}
            </Text>
            {currentIndex === SLIDES.length - 1 ? (
              <Sparkles size={18} color="#FFFFFF" />
            ) : (
              <ArrowRight size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandTitle: {
    fontSize: fp(1.85),
    fontWeight: '800',
    color: '#0F4C5C',
    letterSpacing: -0.3,
  },
  stepCounterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepCounterText: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#475569',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  skipText: {
    fontSize: fp(1.3),
    color: '#475569',
    fontWeight: '700',
    marginRight: 2,
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'space-around',
  },
  graphicCard: {
    width: width - 48,
    height: 270,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F4C5C',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'visible',
  },
  ambientGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 107, 74, 0.08)',
  },
  image: {
    width: '88%',
    height: 220,
  },
  floatingBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeTop: {
    top: 14,
  },
  badgeBottom: {
    bottom: 14,
  },
  badgeLeft: {
    left: 12,
  },
  badgeRight: {
    right: 12,
  },
  badgeIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  badgeText: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#1E293B',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  stepTag: {
    fontSize: fp(1.2),
    fontWeight: '800',
    color: '#FF6B4A',
    letterSpacing: 1.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: fp(2.7),
    fontWeight: '800',
    color: '#0F4C5C',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 33,
  },
  subtitle: {
    fontSize: fp(1.45),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featurePillIcon: {
    marginRight: 6,
  },
  featurePillText: {
    fontSize: fp(1.2),
    fontWeight: '600',
    color: '#0F4C5C',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 26,
    backgroundColor: '#FF6B4A',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E2E8F0',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    flex: 1,
    backgroundColor: '#0F4C5C',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4C5C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fp(1.65),
    fontWeight: '700',
    marginRight: 8,
  },
});
