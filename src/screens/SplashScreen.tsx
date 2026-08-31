import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const PRIMARY_COLOR = '#144C5A';
const ICON_COLOR = '#144C5A';
const ACCENT_COLOR = '#F05A4A';

// ----------------- CUSTOM ICONS -----------------

const CustomRouteIcon = () => (
  <Svg width={46} height={46} viewBox="0 0 46 46">
    {/* S-shaped Connecting Path */}
    <Path
      d="M 11 32 L 28 32 C 34 32, 34 24, 28 24 L 16 24 C 10 24, 10 16, 16 16 L 31 16"
      fill="none"
      stroke={ICON_COLOR}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Start Pin (Bottom Left) */}
    <G x="4.4" y="19.9" transform="scale(0.55)">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FFF" stroke={ICON_COLOR} strokeWidth={4.5} strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="3.5" fill={ICON_COLOR} />
    </G>

    {/* End Pin (Top Right) */}
    <G x="24.4" y="3.9" transform="scale(0.55)">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FFF" stroke={ICON_COLOR} strokeWidth={4.5} strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="3.5" fill={ICON_COLOR} />
    </G>
  </Svg>
);

const MountainBg = () => (
  <Svg width={240} height={160} viewBox="0 0 240 160">
    <Path
      d="M 10 160 L 85 45 C 90 35, 105 35, 110 45 L 150 110 L 160 95 C 165 85, 180 85, 185 95 L 230 160 Z"
      fill="rgba(255,255,255,0.08)"
    />
    <Circle cx="170" cy="40" r="16" fill="rgba(255,255,255,0.08)" />
  </Svg>
);

const PlaneBg = () => (
  <Svg width={180} height={180} viewBox="0 0 180 180">
    <G transform="rotate(-15, 90, 90)">
      {/* Trail underneath */}
      <Rect x="15" y="115" width="60" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
      {/* Body */}
      <Path d="M 40 90 L 130 90 C 150 90, 160 85, 160 80 C 160 75, 150 70, 130 70 L 40 70 C 25 70, 25 90, 40 90 Z" fill="rgba(255,255,255,0.08)" />
      {/* Bottom Wing */}
      <Path d="M 80 90 L 40 130 L 65 130 L 110 90 Z" fill="rgba(255,255,255,0.08)" />
      {/* Top Wing */}
      <Path d="M 90 70 L 65 35 L 85 35 L 115 70 Z" fill="rgba(255,255,255,0.08)" />
      {/* Tail Bottom */}
      <Path d="M 45 90 L 30 110 L 45 110 L 60 90 Z" fill="rgba(255,255,255,0.08)" />
      {/* Tail Top */}
      <Path d="M 50 70 L 40 50 L 50 50 L 60 70 Z" fill="rgba(255,255,255,0.08)" />
    </G>
  </Svg>
);

const MapBg = () => (
  <View style={styles.bgMapContainer}>
    <View style={[styles.bgMapPanel, { transform: [{ skewY: '-15deg' }] }]} />
    <View style={[styles.bgMapPanel, { transform: [{ skewY: '15deg' }] }]} />
    <View style={[styles.bgMapPanel, { transform: [{ skewY: '-15deg' }] }]} />
  </View>
);

// ------------------------------------------------

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Automatically navigate after animation finishes
    const timer = setTimeout(async () => {
      try {
        const hasCompleted = await AsyncStorage.getItem('@has_completed_onboarding');
        if (hasCompleted === 'true') {
          navigation.replace('MainTabs', { screen: 'Plan' });
        } else {
          navigation.replace('Onboarding');
        }
      } catch (error) {
        // Fallback to onboarding if there's an error reading
        navigation.replace('Onboarding');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation, progressAnim, fadeAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const planeTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 120] // move plane to the right
  });

  const planeTranslateY = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, -50] // move plane up
  });

  return (
    <View style={styles.container}>
      {/* Background decorations */}
      <View style={styles.bgDecorationContainer}>
        {/* Dashed curved line (Sine wave shape) */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none">
            <Path
              d="M -50 350 C 100 250, 250 450, 450 300"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              strokeDasharray="8,10"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Mountain illustration */}
        <Animated.View style={[styles.mountainPos, { opacity: fadeAnim }]}>
          <MountainBg />
        </Animated.View>

        {/* Plane illustration animated */}
        <Animated.View
          style={[
            styles.planePos,
            {
              opacity: fadeAnim,
              transform: [
                { translateX: planeTranslateX },
                { translateY: planeTranslateY }
              ]
            }
          ]}
        >
          <PlaneBg />
        </Animated.View>

        {/* Map illustration */}
        <Animated.View style={[styles.mapPos, { opacity: fadeAnim }]}>
          <MapBg />
        </Animated.View>
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <CustomRouteIcon />
        </View>
        <Text style={styles.title}>ItinerAI</Text>
        <Text style={styles.tagline}>Your trip, planned in seconds</Text>
      </Animated.View>

      {/* Progress Bar & Footer */}
      <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.bottomText}>ADVENTURE AWAITS</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgDecorationContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  mountainPos: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
  },
  planePos: {
    position: 'absolute',
    top: '38%',
    left: '8%',
  },
  mapPos: {
    position: 'absolute',
    bottom: '18%',
    alignSelf: 'center',
  },
  bgMapContainer: {
    flexDirection: 'row',
  },
  bgMapPanel: {
    width: 35,
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 1,
    borderRadius: 4,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
    marginTop: -40, // slightly offset content up to balance map
  },
  iconContainer: {
    width: 84,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  progressBarTrack: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ACCENT_COLOR,
    borderRadius: 2,
  },
  bottomText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 2,
  },
});
