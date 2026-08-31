import React, { useRef, useState } from 'react';
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
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ArrowRight } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Tell us where you want to go',
    subtitle: "Pick a destination, dates, and what you're into",
    image: require('../assests/images/onb1.png'),
  },
  {
    id: '2',
    title: 'Get an AI-crafted day-by-day plan',
    subtitle: 'A personalized itinerary built in seconds',
    image: require('../assests/images/onb2.png'),
  },
  {
    id: '3',
    title: 'Edit, save, and take it with you',
    subtitle: 'Adjust any day, save your trip, and export it offline',
    image: require('../assests/images/onb3.png'),
  }
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = async () => {
    await AsyncStorage.setItem('@has_completed_onboarding', 'true');
    navigation.replace('MainTabs', { screen: 'Plan' });
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.graphicContainer}>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          bounces={false}
        />
      </View>

      {/* Pagination & Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.9}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get started' : 'Next'}
          </Text>
          {currentIndex === SLIDES.length - 1 && (
            <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  graphicContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 280,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F4C5C',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FF6B4A',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#FF6B4A',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
