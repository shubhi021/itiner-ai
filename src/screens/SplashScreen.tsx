import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {fp} from '../utils/responsive';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import Svg, {Path, Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const PRIMARY_COLOR = '#0F4C5C';
const ACCENT_COLOR = '#FF6B4A';

const BrandLogoIcon = () => (
  <Svg width={54} height={54} viewBox="0 0 52 52">
    <Defs>
      <LinearGradient id="routeGrad" x1="0" y1="1" x2="1" y2="0">
        <Stop offset="0%" stopColor="#0F4C5C" />
        <Stop offset="100%" stopColor="#FF6B4A" />
      </LinearGradient>
    </Defs>

    {/* Route Curve */}
    <Path
      d="M 14 36 C 24 36, 20 26, 26 26 C 32 26, 30 16, 38 16"
      fill="none"
      stroke="url(#routeGrad)"
      strokeWidth={3.8}
      strokeLinecap="round"
    />

    {/* Departure Dot */}
    <Circle cx={14} cy={36} r={4.5} fill="#0F4C5C" />
    <Circle cx={14} cy={36} r={2} fill="#FFFFFF" />

    {/* Destination Pin */}
    <Circle cx={38} cy={16} r={5} fill="#FF6B4A" />
    <Circle cx={38} cy={16} r={2.2} fill="#FFFFFF" />

    {/* Sparkle Star */}
    <Path
      d="M 44 9 Q 44 12, 47 12 Q 44 12, 44 15 Q 44 12, 41 12 Q 44 12, 44 9 Z"
      fill="#F59E0B"
    />
  </Svg>
);

export const SplashScreen: React.FC<Props> = ({navigation}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Coordinated entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();

    // Gentle pulse loop behind logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.14,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Automatic navigation
    const timer = setTimeout(async () => {
      try {
        const hasCompleted = await AsyncStorage.getItem(
          '@has_completed_onboarding',
        );
        if (hasCompleted === 'true') {
          navigation.replace('MainTabs', {screen: 'Plan'});
        } else {
          navigation.replace('Onboarding');
        }
      } catch (error) {
        navigation.replace('Onboarding');
      }
    }, 2100);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, pulseAnim, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      <SafeAreaView style={styles.safeArea}>
        {/* Centered Brand & Clear Purpose */}
        <Animated.View
          style={[
            styles.centerContent,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Logo with Ambient Glow */}
          <View style={styles.emblemWrapper}>
            <Animated.View
              style={[
                styles.glowAura,
                {transform: [{scale: pulseAnim}]},
              ]}
            />
            <View style={styles.logoCard}>
              <BrandLogoIcon />
            </View>
          </View>

          {/* App Name */}
          <Text style={styles.appName}>ItinerAI</Text>

          {/* Clear, Instant Value Proposition */}
          <Text style={styles.appTagline}>
            Smart Travel Itineraries in Seconds
          </Text>

          {/* Minimal 3-pillar feature summary */}
          <View style={styles.pillarsRow}>
            <Text style={styles.pillarText}>Day-by-Day Plans</Text>
            <View style={styles.pillarDot} />
            <Text style={styles.pillarText}>Live Weather</Text>
            <View style={styles.pillarDot} />
            <Text style={styles.pillarText}>Instant Swap</Text>
          </View>
        </Animated.View>

        {/* Clean Progress Bar at bottom */}
        <Animated.View style={[styles.footerContainer, {opacity: fadeAnim}]}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, {width: progressWidth}]}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emblemWrapper: {
    width: 104,
    height: 104,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  glowAura: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255, 107, 74, 0.22)',
  },
  logoCard: {
    width: 86,
    height: 86,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
  },
  appName: {
    fontSize: fp(4.2),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: fp(1.65),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  pillarText: {
    fontSize: fp(1.2),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  pillarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT_COLOR,
    marginHorizontal: 8,
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    width: '100%',
  },
  progressTrack: {
    width: 80,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT_COLOR,
    borderRadius: 1.5,
  },
});
