import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fp } from '../utils/responsive';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Globe, Plane } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  Easing,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

const SVG_WIDTH = 240;
const SVG_HEIGHT = 160;

const LOADING_TEXTS = [
  "Finding the best spots...",
  "Building your itinerary...",
  "Almost there..."
];

export const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const [textIndex, setTextIndex] = useState(0);
  
  // Animation values
  const progress = useSharedValue(0);
  const globeGlow = useSharedValue(0.4);

  useEffect(() => {
    // Total loading time 6 seconds
    progress.value = withTiming(1, { duration: 6000, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(navigation.replace)('TripSummary');
      }
    });
    
    // Globe glow/pulse loop
    globeGlow.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    const interval = setInterval(() => {
      setTextIndex((prev) => Math.min(prev + 1, LOADING_TEXTS.length - 1));
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [navigation, progress, globeGlow]);

  // Quadratic Bezier Curve points (bottom-left to top-right)
  const p0 = { x: 20, y: 140 };
  const p1 = { x: 60, y: 10 };
  const p2 = { x: 220, y: 20 };

  const planeAnimatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    
    // Position on Bezier curve
    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;

    // Derivative for rotation (tangent angle)
    const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      transform: [
        { translateX: x - SVG_WIDTH / 2 },
        { translateY: y - SVG_HEIGHT / 2 },
        { rotate: `${angle + 45}deg` } // Lucide plane points top-right natively
      ],
      opacity: t < 0.05 ? interpolate(t, [0, 0.05], [0, 1]) : t > 0.95 ? interpolate(t, [0.95, 1], [1, 0]) : 1,
    };
  });

  const progressBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const globeAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: globeGlow.value,
      transform: [{ scale: interpolate(globeGlow.value, [0.4, 1], [0.95, 1.05]) }]
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {/* Path */}
        <View style={styles.svgContainer}>
          <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
            <Path
              d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              strokeDasharray="6, 8"
            />
          </Svg>
        </View>

        {/* Globe */}
        <Animated.View style={[styles.globeContainer, globeAnimatedStyle]}>
          <Globe color="#E5E7EB" size={48} strokeWidth={2} />
        </Animated.View>

        {/* Animated Plane */}
        <Animated.View style={[styles.planeContainer, planeAnimatedStyle]}>
          <Plane color="#FF6B4A" size={28} fill="#FF6B4A" />
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{LOADING_TEXTS[textIndex]}</Text>
        <Text style={styles.subtitle}>Our AI is hand-picking experiences for you</Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressBarAnimatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F4C5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: SVG_WIDTH,
    height: SVG_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  svgContainer: {
    position: 'absolute',
  },
  globeContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  planeContainer: {
    position: 'absolute',
    left: SVG_WIDTH / 2 - 14,
    top: SVG_HEIGHT / 2 - 14,
    zIndex: 2,
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 80,
  },
  title: {
    fontSize: fp(2.2),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fp(1.3),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 120,
    width: 200,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
