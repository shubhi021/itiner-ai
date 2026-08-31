import React, {useState} from 'react';
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
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {RootStackParamList, MainTabParamList} from '../navigation/types';
import {BudgetSelector} from '../components/BudgetSelector';
import {InterestChip} from '../components/InterestChip';
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
} from 'lucide-react-native';

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
  { id: '1', city: 'Lisbon, Portugal', subtext: '12 travelers planning now', image: 'https://images.unsplash.com/photo-1585244585141-8889417d4722?q=80&w=400&auto=format&fit=crop' },
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
  const [mood, setMood] = useState('city');
  const [destination, setDestination] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState<Budget>('medium');
  const [interests, setInterests] = useState<string[]>([]);

  const handleToggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 5
        ? [...prev, interest]
        : prev
    );
  };

  const handleDestinationChange = (text: string) => {
    setDestination(text);
    setShowDropdown(text.length > 0);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setDestination(suggestion);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    navigation.navigate('Loading');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hi Sarah 👋</Text>
            <Text style={styles.heading}>Where to next?</Text>
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
                <View key={t.id} style={styles.trendingCard}>
                  <Image source={{ uri: t.image }} style={styles.trendingImage} />
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingCity}>{t.city}</Text>
                    <Text style={styles.trendingSubtext}>{t.subtext}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Destination Input */}
          <View style={[styles.section, { zIndex: 10 }]}>
            <Text style={styles.label}>Destination</Text>
            <View style={styles.inputContainer}>
              <MapPin color={COLORS.gray} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Where do you want to go?"
                placeholderTextColor="#9CA3AF"
                value={destination}
                onChangeText={handleDestinationChange}
                onFocus={() => destination.length > 0 && setShowDropdown(true)}
              />
            </View>
            
            {showDropdown && (
              <View style={styles.dropdown}>
                {SUGGESTIONS.map((s, idx) => (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.dropdownItem, idx !== SUGGESTIONS.length - 1 && styles.dropdownBorder]}
                    onPress={() => handleSelectSuggestion(s)}
                  >
                    <MapPin color={idx === 0 ? COLORS.coral : COLORS.gray} size={18} />
                    <Text style={[styles.dropdownText, idx === 0 && styles.dropdownTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Days */}
          <View style={styles.section}>
            <Text style={styles.label}>Days</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setDays(Math.max(1, days - 1))}>
                <Text style={styles.stepperButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{days}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setDays(Math.min(30, days + 1))}>
                <Text style={styles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={styles.label}>Budget</Text>
            <BudgetSelector selectedBudget={budget} onSelect={setBudget} />
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <View style={styles.interestsHeader}>
              <Text style={styles.label}>What are you into?</Text>
              <Text style={styles.interestsLimit}>SELECT UP TO 5</Text>
            </View>
            <Text style={styles.helperText}>This helps us shape your perfect itinerary</Text>
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

          {/* Footer branding */}
          <View style={styles.footerBranding}>
            <Text style={styles.footerBrandingText}>Powered by AI • Personalized in seconds</Text>
          </View>
          
          {/* Spacer for fixed button */}
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Fixed Submit Button */}
        <View style={styles.fixedFooter}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
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
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  heading: {
    fontSize: 32,
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
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.teal,
  },
  sectionTitle: {
    fontSize: 11,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.teal,
    marginBottom: 2,
  },
  trendingSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  label: {
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 15,
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
    height: 56,
    width: 140,
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
    fontSize: 20,
    color: COLORS.teal,
    fontWeight: '600',
    lineHeight: 22,
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.teal,
  },
  interestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  interestsLimit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 13,
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
    fontSize: 11,
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
    fontSize: 17,
    color: COLORS.white,
    fontWeight: '700',
  },
});
