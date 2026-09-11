import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert, SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import {fp} from '../utils/responsive';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {
  Globe,
  Plane,
  Sparkles,
  CircleCheck,
  Clock,
  MapPin,
  Compass,
  Lightbulb,
} from 'lucide-react-native';
import Svg, {Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

const ORBIT_SIZE = 220;

export const LoadingScreen: React.FC<Props> = ({navigation}) => {
  const {destination, days, budget, interests} = useSelector(
    (state: RootState) => state.trip,
  );
  const {loading, error, currentItinerary} = useSelector(
    (state: RootState) => state.itinerary,
  );

  const [displayPercent, setDisplayPercent] = useState(12);

  // Animation values
  const progress = useSharedValue(0.1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const orbitRotation = useSharedValue(0);

  const cityName = destination
    ? destination.split(',')[0].trim()
    : 'Destination';

  const MILESTONES = [
    {
      id: 1,
      title: `Mapping ${cityName} landmarks & hidden spots`,
      desc: 'Analyzing cultural hotspots & neighborhood vibes',
    },
    {
      id: 2,
      title: 'Connecting live weather context',
      desc: 'Optimizing outdoor vs indoor stops for forecasts',
    },
    {
      id: 3,
      title: 'Clustering daily transit routes',
      desc: 'Minimizing travel times between daily venues',
    },
    {
      id: 4,
      title: 'Polishing your personalized day-by-day plan',
      desc: 'Generating accurate GPS coordinates & scheduling',
    },
  ];

  // Active milestone step (0 to 3) based on progress
  const activeStep =
    displayPercent < 28
      ? 0
      : displayPercent < 58
      ? 1
      : displayPercent < 85
      ? 2
      : 3;

  useEffect(() => {
    // Progress starts and advances naturally towards 92%
    progress.value = withTiming(0.92, {
      duration: 20000,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    // Continuous orbital rotation of the plane
    orbitRotation.value = withRepeat(
      withTiming(360, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    // Subtle pulsing globe wave
    pulseScale.value = withRepeat(
      withTiming(1.14, {
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    pulseOpacity.value = withRepeat(
      withTiming(0.15, {
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    // Smooth UI percentage counter ticker
    const interval = setInterval(() => {
      setDisplayPercent(prev => {
        if (prev < 90) {
          const step = prev < 40 ? 3 : prev < 75 ? 2 : 1;
          return prev + step;
        }
        return prev;
      });
    }, 380);

    return () => {
      clearInterval(interval);
    };
  }, [orbitRotation, progress, pulseOpacity, pulseScale]);

  useEffect(() => {
    if (!loading && currentItinerary) {
      setDisplayPercent(100);
      progress.value = withTiming(1, {duration: 400}, finished => {
        if (finished) {
          runOnJS(navigation.replace)('TripSummary');
        }
      });
    } else if (!loading && error) {
      runOnJS(Alert.alert)('Generation Failed', error, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    }
  }, [loading, currentItinerary, error, navigation, progress]);

  // Orbit rotation animation
  const orbitAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${orbitRotation.value}deg`}],
    };
  });

  // Pulse wave animation
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: pulseScale.value}],
      opacity: pulseOpacity.value,
    };
  });

  // Progress bar fill width
  const progressBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Ambient Decorative Background Auras */}
        <View style={styles.glowTopRight} />
        <View style={styles.glowBottomLeft} />

        {/* Top Header & Destination Context */}
        <View style={styles.headerContainer}>
          <View style={styles.aiBadge}>
            <Sparkles size={13} color="#FF6B4A" style={styles.badgeIcon} />
            <Text style={styles.aiBadgeText}>AI TRIP CONCIERGE</Text>
          </View>

          <Text style={styles.mainHeading}>
            Designing your {cityName} Journey
          </Text>

          {/* Trip Meta Badges */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{days} Days</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {budget.toUpperCase()} Budget
              </Text>
            </View>
            {interests.length > 0 && (
              <>
                <View style={styles.metaDot} />
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {interests.slice(0, 2).join(' & ')}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Dynamic Center Orbit Animation */}
        <View style={styles.orbitCenter}>
          {/* Pulsing Aura Wave */}
          <Animated.View style={[styles.pulseCircle, pulseAnimatedStyle]} />

          {/* Concentric SVG Orbit Rings */}
          <View style={styles.svgAbsolute}>
            <Svg width={ORBIT_SIZE} height={ORBIT_SIZE}>
              <Defs>
                <LinearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#0F4C5C" stopOpacity="0.2" />
                </LinearGradient>
              </Defs>
              <Circle
                cx={ORBIT_SIZE / 2}
                cy={ORBIT_SIZE / 2}
                r={ORBIT_SIZE / 2 - 12}
                fill="none"
                stroke="url(#orbitGrad)"
                strokeWidth="1.5"
                strokeDasharray="6, 8"
              />
            </Svg>
          </View>

          {/* Central Glass Globe */}
          <View style={styles.globeCore}>
            <Globe color="#FFFFFF" size={44} strokeWidth={1.8} />
          </View>

          {/* Rotating Flight Path with Plane */}
          <Animated.View style={[styles.orbitArm, orbitAnimatedStyle]}>
            <View style={styles.planeWrapper}>
              <Plane color="#FF6B4A" size={24} fill="#FF6B4A" />
            </View>
          </Animated.View>

          {/* Floating Vibe Badges around orbit */}
          <View style={styles.floatingTagLeft}>
            <MapPin size={11} color="#FF6B4A" style={styles.tagIcon} />
            <Text style={styles.floatingTagText}>Local Gems</Text>
          </View>

          <View style={styles.floatingTagRight}>
            <Compass size={11} color="#38BDF8" style={styles.tagIcon} />
            <Text style={styles.floatingTagText}>Smart Routes</Text>
          </View>
        </View>

        {/* Thought Stream / Milestone Progress Card */}
        <View style={styles.glassCard}>
          <View style={styles.milestonesHeader}>
            <Text style={styles.milestonesTitle}>INTELLIGENT PLANNING</Text>
            <Text style={styles.percentText}>{displayPercent}%</Text>
          </View>

          <View style={styles.milestonesList}>
            {MILESTONES.map((item, index) => {
              const isComplete = index < activeStep;
              const isCurrent = index === activeStep;

              return (
                <View key={item.id} style={styles.milestoneRow}>
                  <View style={styles.milestoneIconWrapper}>
                    {isComplete ? (
                      <CircleCheck size={18} color="#2DD4BF" />
                    ) : isCurrent ? (
                      <Sparkles size={16} color="#FF6B4A" />
                    ) : (
                      <Clock size={16} color="rgba(255,255,255,0.3)" />
                    )}
                  </View>

                  <View style={styles.milestoneTextContainer}>
                    <Text
                      style={[
                        styles.milestoneHeading,
                        isComplete && styles.milestoneHeadingDone,
                        isCurrent && styles.milestoneHeadingActive,
                      ]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.milestoneSub,
                        isCurrent && styles.milestoneSubActive,
                      ]}>
                      {item.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bottom Progress Bar & Smart Hint */}
        <View style={styles.bottomSection}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, progressBarAnimatedStyle]}
            />
          </View>

          <View style={styles.proTipRow}>
            <Lightbulb size={13} color="#FF6B4A" style={styles.proTipIcon} />
            <Text style={styles.proTipText}>
              Pro tip: Real-time weather context is included. You can "Swap" any
              stop dynamically!
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07242C',
    paddingHorizontal: 16,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  /* Decorative Ambient Auras */
  glowTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 107, 74, 0.15)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(15, 76, 92, 0.35)',
  },

  /* Header */
  headerContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeIcon: {
    marginRight: 6,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: fp(1.2),
    fontWeight: '700',
    letterSpacing: 1,
  },
  mainHeading: {
    color: '#FFFFFF',
    fontSize: fp(2.6),
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  metaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaBadgeText: {
    color: '#94A3B8',
    fontSize: fp(1.25),
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  /* Orbit Hero Centerpiece */
  orbitCenter: {
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  svgAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 107, 74, 0.2)',
  },
  globeCore: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#0F4C5C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FF6B4A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  orbitArm: {
    position: 'absolute',
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  planeWrapper: {
    marginTop: -2,
    transform: [{rotate: '45deg'}],
  },
  floatingTagLeft: {
    position: 'absolute',
    bottom: 8,
    left: -18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 92, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  floatingTagRight: {
    position: 'absolute',
    top: 14,
    right: -24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 92, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  tagIcon: {
    marginRight: 4,
  },
  floatingTagText: {
    color: '#E2E8F0',
    fontSize: fp(1.15),
    fontWeight: '600',
  },

  /* Milestone Thought Stream Card */
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 8,
  },
  milestonesTitle: {
    fontSize: fp(1.15),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  percentText: {
    fontSize: fp(1.6),
    fontWeight: '700',
    color: '#FF6B4A',
  },
  milestonesList: {
    gap: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneHeading: {
    fontSize: fp(1.4),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 2,
  },
  milestoneHeadingActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  milestoneHeadingDone: {
    color: '#E2E8F0',
    textDecorationLine: 'line-through',
    textDecorationColor: 'rgba(255, 255, 255, 0.4)',
  },
  milestoneSub: {
    fontSize: fp(1.15),
    color: 'rgba(255, 255, 255, 0.35)',
  },
  milestoneSubActive: {
    color: '#38BDF8',
    fontWeight: '500',
  },

  /* Bottom Progress Bar & Hint */
  bottomSection: {
    paddingBottom: 10,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B4A',
    borderRadius: 3,
  },
  proTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  proTipIcon: {
    marginTop: 1,
  },
  proTipText: {
    fontSize: fp(1.2),
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 18,
    flexShrink: 1,
  },
});
