import { fp } from '../utils/responsive';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import {
  setDestination as setReduxDestination,
  setDays as setReduxDays,
  setBudget as setReduxBudget,
  toggleInterest as toggleReduxInterest,
  selectIsFormValid
} from '../store/tripSlice';
import { BudgetSelector } from '../components/BudgetSelector';
import { InterestChip } from '../components/InterestChip';
import {
  MapPin,
  Palmtree,
  Building2,
  TreePine,
  Compass,
  Utensils,
  Landmark,
  Moon,
  Palette,
  ShoppingBag,
  ArrowRight,
  X,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react-native';
import { RootState } from '../store';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Plan'>,
  NativeStackScreenProps<RootStackParamList>
>;
type Budget = 'low' | 'medium' | 'high';

// ---- Data & Constants ----
const COLORS = {
  teal: '#0F4C5C',
  coral: '#FF6B4A',
  bg: '#FAFAF8',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
};

const MOODS = [
  { id: 'beach', label: 'Beach', icon: Palmtree, bgColor: '#E8F2FF', iconColor: '#0066FF' },
  { id: 'city', label: 'City', icon: Building2, bgColor: '#FFEEE8', iconColor: '#FF6B4A' },
  { id: 'nature', label: 'Nature', icon: TreePine, bgColor: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 'adventure', label: 'Adventure', icon: Compass, bgColor: '#F4E8FF', iconColor: '#7B1FA2' }
];

const TRENDING = [
  { id: '1', city: 'Lisbon, Portugal', subtext: '12 travelers planning now', badge: 'POPULAR', image: 'https://images.unsplash.com/photo-1585244585141-8889417d4722?q=80&w=400&auto=format&fit=crop' },
  { id: '2', city: 'Ubud, Indonesia', subtext: 'Trending this week', image: 'https://images.unsplash.com/photo-1559628233-eb1b1a45564b?q=80&w=400&auto=format&fit=crop' },
  { id: '3', city: 'Positano, Italy', subtext: 'Hot summer choice', image: 'https://images.unsplash.com/photo-1533682805518-48d1f5b8cb3a?q=80&w=400&auto=format&fit=crop' }
];

const INTERESTS = [
  { id: 'Food', label: 'Food', icon: Utensils },
  { id: 'History', label: 'History', icon: Landmark },
  { id: 'Nightlife', label: 'Nightlife', icon: Moon },
  { id: 'Art', label: 'Art', icon: Palette },
  { id: 'Nature', label: 'Nature', icon: TreePine },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
];

const SUGGESTIONS = [
  'Lisbon, Portugal',
  'Porto, Portugal',
  'Sintra, Portugal'
];

export const TripFormScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();

  const destination = useSelector((state: RootState) => state.trip.destination);
  const days = useSelector((state: RootState) => state.trip.days);
  const budget = useSelector((state: RootState) => state.trip.budget) as Budget;
  const interests = useSelector((state: RootState) => state.trip.interests);
  const isFormValid = useSelector(selectIsFormValid);

  const [mood, setMood] = useState('city');
  const [searchInput, setSearchInput] = useState('');
  const [isDestinationSelected, setIsDestinationSelected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleToggleInterest = (interest: string) => {
    dispatch(toggleReduxInterest(interest));
  };

  const handleDestinationChange = (text: string) => {
    setSearchInput(text);
    setShowDropdown(text.length > 0);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    dispatch(setReduxDestination(suggestion));
    setSearchInput('');
    setIsDestinationSelected(true);
    setShowDropdown(false);
  };

  const clearDestination = () => {
    dispatch(setReduxDestination(''));
    setSearchInput('');
    setIsDestinationSelected(false);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    navigation.navigate('Loading');
  };

  const filteredSuggestions = SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(searchInput.toLowerCase())
  );

  const getBudgetEstimate = () => {
    switch (budget) {
      case 'low': return 'EST. €40-80 / DAY';
      case 'high': return 'EST. €150-300+ / DAY';
      case 'medium':
      default: return 'EST. €80-150 / DAY';
    }
  };

  const calculateProgress = () => {
    let progress = 0;
    if (mood) progress++; // Step 1: Mood
    if (isDestinationSelected) progress++; // Step 2: Destination
    if (days && budget) progress++; // Step 3: Logistics
    if (interests.length > 0) progress++; // Step 4: Interests
    return Math.min(4, progress);
  };

  const progress = calculateProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>Hi Sarah 👋</Text>
              <View style={styles.progressContainer}>
                {[1, 2, 3, 4].map((step) => (
                  <View
                    key={step}
                    style={[
                      styles.progressBar,
                      step <= progress && styles.progressActive
                    ]}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.heading}>Where to next?</Text>

            {isDestinationSelected && (
              <View style={styles.selectedDestinationPill}>
                <MapPin color={COLORS.coral} size={14} />
                <Text style={styles.selectedDestinationText}>{destination}</Text>
                <TouchableOpacity style={styles.removeDestinationBtn} onPress={clearDestination}>
                  <X color="#9CA3AF" size={14} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Mood Tiles */}
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
              {MOODS.map(m => {
                const Icon = m.icon;
                const isSelected = mood === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.moodTile,
                      { backgroundColor: m.bgColor },
                      isSelected && styles.moodTileSelected
                    ]}
                    onPress={() => setMood(m.id)}
                    activeOpacity={0.8}
                  >
                    <Icon color={m.iconColor} size={28} style={{ marginBottom: 8 }} />
                    <Text style={styles.moodLabel}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Trending Destinations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRENDING DESTINATIONS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {TRENDING.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.trendingCard}
                  activeOpacity={0.9}
                  onPress={() => handleSelectSuggestion(t.city)}
                >
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: t.image }} style={styles.trendingImage} />
                    {t.badge && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{t.badge}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingCity}>{t.city}</Text>
                    <Text style={styles.trendingSubtext}>{t.subtext}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Destination Input */}
          {!isDestinationSelected && (
            <View style={[styles.section, { zIndex: 10 }]}>
              <Text style={styles.label}>Destination</Text>
              <View style={styles.inputContainer}>
                <MapPin color={COLORS.gray} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Where do you want to go?"
                  placeholderTextColor="#9CA3AF"
                  value={searchInput}
                  onChangeText={handleDestinationChange}
                  onFocus={() => searchInput.length > 0 && setShowDropdown(true)}
                />
              </View>

              {showDropdown && filteredSuggestions.length > 0 && (
                <View style={styles.dropdown}>
                  {filteredSuggestions.map((s, idx) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.dropdownItem, idx !== filteredSuggestions.length - 1 && styles.dropdownBorder]}
                      onPress={() => handleSelectSuggestion(s)}
                    >
                      <MapPin color={idx === 0 ? COLORS.coral : '#9CA3AF'} size={16} />
                      <Text style={[styles.dropdownText, idx === 0 && styles.dropdownTextActive]}>{s}</Text>
                      {idx === 0 && <ChevronRight color="#D1D5DB" size={16} style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Trip length */}
          <View style={styles.section}>
            <Text style={styles.label}>Trip length</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => dispatch(setReduxDays(Math.max(1, days - 1)))}>
                <Text style={styles.stepperButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.stepperValueContainer}>
                <Text style={styles.stepperValue}>{days}</Text>
                <Text style={styles.stepperLabel}>DAYS</Text>
              </View>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => dispatch(setReduxDays(Math.min(30, days + 1)))}>
                <Text style={styles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={styles.label}>Budget</Text>
            <BudgetSelector selectedBudget={budget} onSelect={(val) => dispatch(setReduxBudget(val))} />
            <View style={styles.budgetEstimateContainer}>
              <Text style={styles.budgetEstimate}>{getBudgetEstimate()}</Text>
            </View>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <View style={styles.interestsHeader}>
              <View style={styles.interestsTitleRow}>
                <Text style={styles.label}>Interests</Text>
                <View style={styles.interestCountBadge}>
                  <Text style={styles.interestCountText}>{interests.length}/5 selected</Text>
                </View>
              </View>
              <Text style={styles.interestsLimit}>SELECT UP TO 5</Text>
            </View>
            <View style={styles.chipsContainer}>
              {INTERESTS.map(interest => {
                const isSelected = interests.includes(interest.id);
                const Icon = interest.icon;
                return (
                  <InterestChip
                    key={interest.id}
                    label={interest.label}
                    selected={isSelected}
                    onToggle={() => handleToggleInterest(interest.id)}
                    icon={<Icon color={isSelected ? '#FFF' : '#9CA3AF'} size={16} />}
                  />
                );
              })}
            </View>
          </View>

          {/* Advanced options */}
          <View style={styles.advancedOptions}>
            <View style={styles.advancedOptionsLeft}>
              <SlidersHorizontal color="#9CA3AF" size={18} />
              <Text style={styles.advancedOptionsText}>Advanced options</Text>
            </View>
            <ChevronDown color="#9CA3AF" size={18} />
          </View>

          {/* Footer branding */}
          <View style={styles.footerBranding}>
            <Text style={styles.footerBrandingText}>POWERED BY AI • PERSONALIZED IN SECONDS</Text>
          </View>

          {/* Spacer for fixed button */}
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Fixed Submit Button */}
        <View style={styles.fixedFooter}>
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={!isFormValid}
            activeOpacity={0.9}>
            <Text style={styles.submitButtonText}>Generate Itinerary</Text>
            <ArrowRight color={COLORS.white} size={20} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: fp(1.4),
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  heading: {
    fontSize: fp(3.2),
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  moodScroll: {
    paddingRight: 20,
  },
  moodTile: {
    width: 80,
    height: 86,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodTileSelected: {
    borderColor: COLORS.coral,
  },
  moodLabel: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: COLORS.teal,
  },
  sectionTitle: {
    fontSize: fp(1.1),
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  trendingScroll: {
    paddingRight: 20,
  },
  trendingCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  trendingImage: {
    width: '100%',
    height: 90,
    backgroundColor: '#E5E7EB',
  },
  trendingInfo: {
    padding: 12,
  },
  trendingCity: {
    fontSize: fp(1.4),
    fontWeight: '700',
    color: COLORS.teal,
    marginBottom: 2,
  },
  trendingSubtext: {
    fontSize: fp(1.0),
    color: '#9CA3AF',
  },
  label: {
    fontSize: fp(1.4),
    fontWeight: '600',
    color: COLORS.teal,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: fp(1.6),
    color: COLORS.teal,
    height: '100%',
  },
  dropdown: {
    position: 'absolute',
    top: 88,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dropdownBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownText: {
    marginLeft: 12,
    fontSize: fp(1.5),
    color: COLORS.teal,
    fontWeight: '500',
  },
  dropdownTextActive: {
    color: COLORS.coral,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 16,
    height: 64,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: {
    fontSize: fp(2.0),
    color: COLORS.teal,
    fontWeight: '600',
    lineHeight: 22,
  },
  stepperValue: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: COLORS.teal,
  },
  interestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  interestsLimit: {
    fontSize: fp(1.0),
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: fp(1.3),
    color: '#9CA3AF',
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footerBranding: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  footerBrandingText: {
    fontSize: fp(1.1),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  submitButton: {
    backgroundColor: COLORS.coral,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: fp(1.7),
    color: COLORS.white,
    fontWeight: '700',
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 24,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginLeft: 4,
  },
  progressActive: {
    backgroundColor: COLORS.coral,
  },
  selectedDestinationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  selectedDestinationText: {
    fontSize: fp(1.3),
    fontWeight: '700',
    color: COLORS.teal,
    marginLeft: 6,
    marginRight: 8,
  },
  removeDestinationBtn: {
    padding: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: fp(0.9),
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: 0.5,
  },
  stepperValueContainer: {
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: fp(1.0),
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  budgetEstimateContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  budgetEstimate: {
    fontSize: fp(1.1),
    fontWeight: '700',
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  interestsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestCountBadge: {
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  interestCountText: {
    fontSize: fp(1.0),
    fontWeight: '700',
    color: COLORS.coral,
  },
  advancedOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  advancedOptionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advancedOptionsText: {
    fontSize: fp(1.4),
    fontWeight: '600',
    color: COLORS.teal,
    marginLeft: 12,
  },
});

