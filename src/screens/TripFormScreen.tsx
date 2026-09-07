import React, { useState, useEffect } from 'react';
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
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDestination as setReduxDestination,
  setDays as setReduxDays,
  setBudget as setReduxBudget,
  toggleInterest as toggleReduxInterest,
  selectIsFormValid,
} from '../store/tripSlice';
import { fetchItinerary } from '../store/itinerarySlice';
import { AppDispatch, RootState } from '../store';
import { fetchCitySuggestions, PlaceSuggestion } from '../services/placesService';
import {
  MapPin,
  Sparkles,
  Utensils,
  Landmark,
  Moon,
  Palette,
  TreePine,
  ShoppingBag,
  X,
  Wallet,
  CreditCard,
  Gem,
} from 'lucide-react-native';
import { fp } from '../utils/responsive';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const INTERESTS = [
  { id: 'Food', label: 'Food & Dining', icon: Utensils },
  { id: 'History', label: 'History', icon: Landmark },
  { id: 'Nightlife', label: 'Nightlife', icon: Moon },
  { id: 'Art', label: 'Art Galleries', icon: Palette },
  { id: 'Nature', label: 'Nature', icon: TreePine },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
];

export const TripFormScreen: React.FC<any> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const destination = useSelector((state: RootState) => state.trip.destination);
  const days = useSelector((state: RootState) => state.trip.days);
  const budget = useSelector((state: RootState) => state.trip.budget);
  const interests = useSelector((state: RootState) => state.trip.interests);
  const isFormValid = useSelector(selectIsFormValid);

  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);

  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    const getSuggestions = async () => {
      if (debouncedSearch.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      const results = await fetchCitySuggestions(debouncedSearch);
      setSuggestions(results);
      setIsSearching(false);
    };
    getSuggestions();
  }, [debouncedSearch]);

  const handleSelectSuggestion = (placeDesc: string) => {
    dispatch(setReduxDestination(placeDesc));
    setSearchInput('');
  };

  const handleSubmit = () => {
    dispatch(
      fetchItinerary({
        destination,
        days,
        budget,
        interests,
      }),
    );
    navigation.navigate('Loading');
  };

  const showDropdown = searchInput.length > 0 && !destination;

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop' }}
      style={styles.container}>
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Explore the World</Text>
            <Text style={styles.headerSubtitle}>Let AI craft your perfect itinerary.</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            <BlurView style={styles.glassCard} blurType="light" blurAmount={20} reducedTransparencyFallbackColor="white">

              {/* DESTINATION */}
              <View style={[styles.section, { zIndex: 10 }]}>
                <Text style={styles.label}>Destination</Text>

                {destination ? (
                  <View style={styles.selectedDestinationPill}>
                    <MapPin color="#0F4C5C" size={20} />
                    <Text style={styles.selectedDestinationText}>{destination}</Text>
                    <TouchableOpacity
                      style={styles.clearBtn}
                      onPress={() => dispatch(setReduxDestination(''))}>
                      <X color="#9CA3AF" size={18} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <View style={styles.inputContainer}>
                      <MapPin color="#6B7280" size={20} />
                      <TextInput
                        style={styles.input}
                        placeholder="Search for a city..."
                        placeholderTextColor="#9CA3AF"
                        value={searchInput}
                        onChangeText={setSearchInput}
                        onSubmitEditing={() => {
                          if (searchInput.trim()) {
                            handleSelectSuggestion(searchInput.trim());
                          }
                        }}
                        returnKeyType="done"
                      />
                      {isSearching && <ActivityIndicator size="small" color="#0F4C5C" />}
                    </View>

                    {/* Inline Dropdown for suggestions */}
                    {showDropdown && (
                      <View style={styles.dropdown}>
                        {suggestions.map((s, idx) => (
                          <TouchableOpacity
                            key={s.placeId}
                            style={[styles.dropdownItem, idx < suggestions.length - 1 && styles.dropdownBorder]}
                            onPress={() => handleSelectSuggestion(s.description)}>
                            <MapPin color="#FF6B4A" size={16} />
                            <Text style={styles.dropdownText} numberOfLines={1}>
                              {s.description}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {suggestions.length === 0 && !isSearching && searchInput.length > 1 && (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => handleSelectSuggestion(searchInput.trim())}>
                            <MapPin color="#FF6B4A" size={16} />
                            <Text style={styles.dropdownText} numberOfLines={1}>
                              Search for "{searchInput}"
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* DURATION */}
              <View style={styles.section}>
                <Text style={styles.label}>Duration</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.stepperBtn}
                    onPress={() => dispatch(setReduxDays(Math.max(1, days - 1)))}>
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.stepperValueContainer}>
                    <Text style={styles.stepperValue}>{days}</Text>
                    <Text style={styles.stepperSubtext}>Days</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.stepperBtn}
                    onPress={() => dispatch(setReduxDays(Math.min(30, days + 1)))}>
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* BUDGET */}
              <View style={styles.section}>
                <Text style={styles.label}>Budget</Text>
                <View style={styles.budgetCardsContainer}>
                  {(['low', 'medium', 'high'] as const).map((b) => {
                    const isSelected = budget === b;
                    let Icon = Wallet;
                    let title = 'Budget';
                    let subtitle = 'Cost-friendly';

                    if (b === 'medium') {
                      Icon = CreditCard;
                      title = 'Standard';
                      subtitle = 'Balanced';
                    } else if (b === 'high') {
                      Icon = Gem;
                      title = 'Luxury';
                      subtitle = 'Premium';
                    }

                    return (
                      <TouchableOpacity
                        key={b}
                        activeOpacity={0.7}
                        style={[styles.budgetCard, isSelected && styles.budgetCardActive]}
                        onPress={() => dispatch(setReduxBudget(b))}>
                        <Icon color={isSelected ? '#0F4C5C' : '#9CA3AF'} size={24} style={{ marginBottom: 8 }} />
                        <Text style={[styles.budgetCardTitle, isSelected && styles.budgetCardTitleActive]}>{title}</Text>
                        <Text style={[styles.budgetCardSubtitle, isSelected && styles.budgetCardSubtitleActive]}>{subtitle}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* INTERESTS */}
              <View style={styles.section}>
                <View style={styles.interestsHeader}>
                  <Text style={styles.label}>Interests</Text>
                  <Text style={styles.interestsCount}>{interests.length}/5</Text>
                </View>
                <View style={styles.chipsContainer}>
                  {INTERESTS.map((interest) => {
                    const isSelected = interests.includes(interest.id);
                    const Icon = interest.icon;
                    return (
                      <TouchableOpacity
                        key={interest.id}
                        activeOpacity={0.8}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => dispatch(toggleReduxInterest(interest.id))}>
                        <Icon color={isSelected ? '#FFFFFF' : '#4B5563'} size={14} style={{ marginRight: 6 }} />
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {interest.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

            </BlurView>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!isFormValid}
              activeOpacity={0.9}>
              <Sparkles color={isFormValid ? '#FFFFFF' : '#9CA3AF'} size={20} style={{ marginRight: 8 }} />
              <Text style={[styles.submitButtonText, !isFormValid && { color: '#9CA3AF' }]}>Generate Itinerary</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Darken image slightly to make form pop
  },
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fp(4.2),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: fp(1.6),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 10, // space for fixed footer
  },
  glassCard: {
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // High opacity white for readability
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  section: {
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: fp(1.4),
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: fp(1.6),
    color: '#111827',
    marginLeft: 12,
  },
  selectedDestinationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 92, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 92, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  selectedDestinationText: {
    flex: 1,
    fontSize: fp(1.6),
    fontWeight: '700',
    color: '#0F4C5C',
    marginLeft: 12,
  },
  clearBtn: {
    padding: 4,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
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
    fontSize: fp(1.4),
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepperBtnText: {
    fontSize: fp(2.2),
    fontWeight: '600',
    color: '#111827',
  },
  stepperValueContainer: {
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: fp(1.8),
    fontWeight: '800',
    color: '#111827',
  },
  stepperSubtext: {
    fontSize: fp(1.0),
    color: '#6B7280',
    fontWeight: '700',
  },
  budgetCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  budgetCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  budgetCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0F4C5C',
    borderWidth: 2,
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.02 }], // Slight pop effect for interactivity
  },
  budgetCardTitle: {
    fontSize: fp(1.4),
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 2,
  },
  budgetCardTitleActive: {
    color: '#0F4C5C',
  },
  budgetCardSubtitle: {
    fontSize: fp(1.0),
    fontWeight: '600',
    color: '#9CA3AF',
  },
  budgetCardSubtitleActive: {
    color: '#0F4C5C',
    opacity: 0.8,
  },
  interestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  interestsCount: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#FF6B4A',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#0F4C5C',
    borderColor: '#0F4C5C',
  },
  chipText: {
    fontSize: fp(1.3),
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 14 : 24,
  },
  submitButton: {
    backgroundColor: '#FF6B4A',
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: fp(1.8),
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
