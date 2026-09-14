import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Share,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {RootState} from '../store';
import {fp} from '../utils/responsive';
import {
  MapPin,
  Pencil,
  Globe,
  Plane,
  Calendar,
  SlidersHorizontal,
  Heart,
  Check,
  Wallet,
  Coins,
  ChevronRight,
  Share2,
  Trash2,
  X,
  Coffee,
  Scale,
  Zap,
  Landmark,
  Utensils,
  Gem,
  Mountain,
  Palette,
  ShoppingBag,
  Moon,
  Bookmark,
  Plus,
  CreditCard,
} from 'lucide-react-native';

const USER_PROFILE_STORAGE_KEY = '@itinerai_user_profile';

interface UserProfileData {
  name: string;
  handle: string;
  homeCity: string;
  pace: 'relaxed' | 'balanced' | 'packed';
  budget: 'low' | 'mid' | 'high';
  vibes: string[];
  currency: string;
}

const DEFAULT_PROFILE: UserProfileData = {
  name: 'Sarah Jenkins',
  handle: '@sarah_wanders',
  homeCity: 'San Francisco, CA',
  pace: 'balanced',
  budget: 'mid',
  vibes: [
    'History & Culture',
    'Food & Dining',
    'Hidden Gems',
    'Nature & Views',
  ],
  currency: 'USD ($)',
};

interface VibeItem {
  id: string;
  label: string;
  icon: any;
}

const ALL_VIBES: VibeItem[] = [
  {id: 'History & Culture', label: 'History & Culture', icon: Landmark},
  {id: 'Food & Dining', label: 'Food & Dining', icon: Utensils},
  {id: 'Hidden Gems', label: 'Hidden Gems', icon: Gem},
  {id: 'Nature & Views', label: 'Nature & Views', icon: Mountain},
  {id: 'Art & Museums', label: 'Art & Museums', icon: Palette},
  {id: 'Shopping', label: 'Shopping', icon: ShoppingBag},
  {id: 'Cafes & Bakeries', label: 'Cafes & Bakeries', icon: Coffee},
  {id: 'Nightlife & Bars', label: 'Nightlife', icon: Moon},
];

const PACING_OPTIONS = [
  {
    id: 'relaxed' as const,
    label: 'Relaxed',
    sub: '2-3 stops / day',
    icon: Coffee,
  },
  {
    id: 'balanced' as const,
    label: 'Balanced',
    sub: '3-4 stops / day',
    icon: Scale,
  },
  {
    id: 'packed' as const,
    label: 'Fast-Paced',
    sub: '5+ stops / day',
    icon: Zap,
  },
];

const BUDGET_OPTIONS = [
  {
    id: 'low' as const,
    label: 'Budget',
    sub: 'Cost-friendly',
    icon: Wallet,
  },
  {
    id: 'mid' as const,
    label: 'Standard',
    sub: 'Balanced',
    icon: CreditCard,
  },
  {
    id: 'high' as const,
    label: 'Luxury',
    sub: 'Premium',
    icon: Gem,
  },
];

const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)', 'INR (₹)'];

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const savedTrips = useSelector((state: RootState) => state.savedTrips.trips);
  const currentItinerary = useSelector(
    (state: RootState) => state.itinerary.currentItinerary,
  );

  const [profile, setProfile] = useState<UserProfileData>(DEFAULT_PROFILE);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(profile.name);
  const [editHandle, setEditHandle] = useState(profile.handle);
  const [editHomeCity, setEditHomeCity] = useState(profile.homeCity);

  // Load saved profile preferences from AsyncStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(prev => {
            const merged = {...prev, ...parsed};
            setEditName(merged.name);
            setEditHandle(merged.handle);
            setEditHomeCity(merged.homeCity);
            return merged;
          });
        }
      } catch (e) {
        console.warn('Failed to load profile preferences:', e);
      }
    };
    loadProfile();
  }, []);

  // Save profile helper
  const saveProfileUpdate = async (updated: Partial<UserProfileData>) => {
    const newProfile = {...profile, ...updated};
    setProfile(newProfile);
    try {
      await AsyncStorage.setItem(
        USER_PROFILE_STORAGE_KEY,
        JSON.stringify(newProfile),
      );
    } catch (e) {
      console.warn('Failed to save profile preferences:', e);
    }
  };

  // Real Metrics derived directly from savedTrips and active itinerary
  const stats = useMemo(() => {
    const destinationsSet = new Set<string>();
    let totalDays = 0;

    savedTrips.forEach(t => {
      if (t.destination) {
        destinationsSet.add(t.destination.split(',')[0].trim());
      }
      if (t.itinerary?.days) {
        totalDays += t.itinerary.days.length;
      }
    });

    // Also include active trip if not already in saved trips
    if (
      currentItinerary?.destination &&
      !savedTrips.some(t => t.destination === currentItinerary.destination)
    ) {
      destinationsSet.add(currentItinerary.destination.split(',')[0].trim());
      if (currentItinerary.days) {
        totalDays += currentItinerary.days.length;
      }
    }

    return {
      tripsCount: savedTrips.length,
      destinationsCount: destinationsSet.size,
      totalDays,
    };
  }, [savedTrips, currentItinerary]);

  const handleToggleVibe = (vibeId: string) => {
    const exists = profile.vibes.includes(vibeId);
    let updatedVibes: string[];
    if (exists) {
      if (profile.vibes.length <= 1) {
        Alert.alert(
          'Keep at least 1 vibe',
          'Select at least one travel vibe to personalize your AI trips.',
        );
        return;
      }
      updatedVibes = profile.vibes.filter(v => v !== vibeId);
    } else {
      updatedVibes = [...profile.vibes, vibeId];
    }
    saveProfileUpdate({vibes: updatedVibes});
  };

  const handleSaveProfileModal = () => {
    const trimmedName = editName.trim() || profile.name;
    const trimmedHandle = editHandle.trim() || profile.handle;
    const trimmedCity = editHomeCity.trim() || profile.homeCity;

    saveProfileUpdate({
      name: trimmedName,
      handle: trimmedHandle.startsWith('@')
        ? trimmedHandle
        : `@${trimmedHandle}`,
      homeCity: trimmedCity,
    });
    setIsEditModalVisible(false);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Local Cache',
      'This will clear temporary weather forecasts and temporary chat logs. Your saved trips will remain safe.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const tempKeys = keys.filter(
                k =>
                  k.startsWith('@itinerai_weather_cache_') ||
                  k.startsWith('@itinerai_chat_'),
              );
              if (tempKeys.length > 0) {
                await Promise.all(
                  tempKeys.map(k => AsyncStorage.removeItem(k)),
                );
              }
              Alert.alert(
                'Cache Cleared',
                'Temporary weather and copilot memory caches were reset.',
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to clear cache.');
            }
          },
        },
      ],
    );
  };

  const handleExportAllTrips = async () => {
    try {
      if (savedTrips.length === 0) {
        Alert.alert(
          'No Trips to Export',
          'You have not saved any trips yet. Plan a trip first!',
        );
        return;
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: {
          name: profile.name,
          homeCity: profile.homeCity,
          pace: profile.pace,
          budget: profile.budget,
          vibes: profile.vibes,
        },
        savedTrips: savedTrips,
      };

      await Share.share({
        title: 'ItinerAI Saved Trips Export',
        message: JSON.stringify(exportData, null, 2),
      });
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export trip data.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F4C5C" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Clean Profile Header */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
                }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.avatarEditBadge}
                activeOpacity={0.8}
                onPress={() => setIsEditModalVisible(true)}>
                <Pencil size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroInfoCol}>
              <Text style={styles.userName} numberOfLines={1}>
                {profile.name}
              </Text>
              <Text style={styles.userHandle}>{profile.handle}</Text>

              <View style={styles.locationRow}>
                <MapPin size={12} color="rgba(255, 255, 255, 0.85)" />
                <Text style={styles.locationText}>{profile.homeCity}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editProfileBtn}
              activeOpacity={0.7}
              onPress={() => setIsEditModalVisible(true)}>
              <Text style={styles.editProfileBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Real Travel Analytics Dashboard */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Trips')}>
            <View style={[styles.statIconBadge, styles.statIconBlue]}>
              <Plane size={16} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.tripsCount}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, styles.statIconGreen]}>
              <Globe size={16} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.destinationsCount}</Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, styles.statIconOrange]}>
              <Calendar size={16} color="#F97316" />
            </View>
            <Text style={styles.statValue}>{stats.totalDays}</Text>
            <Text style={styles.statLabel}>Days Planned</Text>
          </View>
        </View>

        {/* Quick Travel Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Plan')}>
            <Plus size={16} color="#FF6B4A" />
            <Text style={styles.shortcutBtnText}>Plan New Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Trips')}>
            <Bookmark size={16} color="#0F4C5C" />
            <Text style={styles.shortcutBtnText}>My Saved Trips</Text>
          </TouchableOpacity>
        </View>

        {/* Traveler DNA: Preferred Pace */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <SlidersHorizontal size={15} color="#0F4C5C" />
            <Text style={styles.sectionTitle}>PACING PREFERENCE</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            How densely should AI plan your itinerary days?
          </Text>

          <View style={styles.paceSelectorRow}>
            {PACING_OPTIONS.map(opt => {
              const IconComp = opt.icon;
              const isActive = profile.pace === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.paceOption,
                    isActive && styles.paceOptionActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => saveProfileUpdate({pace: opt.id})}>
                  <View
                    style={[
                      styles.paceIconCircle,
                      isActive && styles.paceIconCircleActive,
                    ]}>
                    <IconComp
                      size={16}
                      color={isActive ? '#2563EB' : '#64748B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.paceTitle,
                      isActive && styles.paceTitleActive,
                    ]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.paceSub}>{opt.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Traveler DNA: Favorite Travel Vibes */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Heart size={15} color="#FF6B4A" />
            <Text style={styles.sectionTitle}>TRAVEL VIBES & THEMES</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Themes prioritized when generating activities:
          </Text>

          <View style={styles.vibesGrid}>
            {ALL_VIBES.map(vibe => {
              const IconComp = vibe.icon;
              const isSelected = profile.vibes.includes(vibe.id);
              return (
                <TouchableOpacity
                  key={vibe.id}
                  style={[
                    styles.vibeChip,
                    isSelected && styles.vibeChipSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleToggleVibe(vibe.id)}>
                  <IconComp
                    size={14}
                    color={isSelected ? '#FFFFFF' : '#0F4C5C'}
                  />
                  <Text
                    style={[
                      styles.vibeText,
                      isSelected && styles.vibeTextSelected,
                    ]}>
                    {vibe.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.vibeCheckBadge}>
                      <Check size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Default Trip Preferences */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Wallet size={15} color="#0F4C5C" />
            <Text style={styles.sectionTitle}>DEFAULT TRIP BUDGET</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Starting expense tier when generating new itineraries:
          </Text>

          <View style={styles.paceSelectorRow}>
            {BUDGET_OPTIONS.map(opt => {
              const IconComp = opt.icon;
              const isActive = profile.budget === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.paceOption,
                    isActive && styles.budgetOptionActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => saveProfileUpdate({budget: opt.id})}>
                  <View
                    style={[
                      styles.paceIconCircle,
                      isActive && styles.budgetIconCircleActive,
                    ]}>
                    <IconComp
                      size={16}
                      color={isActive ? '#0F4C5C' : '#64748B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.paceTitle,
                      isActive && styles.budgetTitleActive,
                    ]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.paceSub}>{opt.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.settingDivider, {marginVertical: 12}]} />

          {/* Currency Setting */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setIsCurrencyModalVisible(true)}>
            <View style={[styles.settingIconBadge, styles.settingIconOrange]}>
              <Coins size={16} color="#F97316" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Display Currency</Text>
              <Text style={styles.settingDescription}>
                Used in cost breakdowns and estimates
              </Text>
            </View>
            <View style={styles.currencyValRow}>
              <Text style={styles.settingValue}>{profile.currency}</Text>
              <ChevronRight size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Data & Storage Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Share2 size={15} color="#0F4C5C" />
            <Text style={styles.sectionTitle}>DATA & BACKUP</Text>
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={handleExportAllTrips}>
            <View style={[styles.settingIconBadge, styles.settingIconGray]}>
              <Share2 size={15} color="#475569" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Export Saved Trips</Text>
              <Text style={styles.settingDescription}>
                Share or backup your itineraries as JSON
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={handleClearCache}>
            <View style={[styles.settingIconBadge, styles.settingIconRed]}>
              <Trash2 size={15} color="#EF4444" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.dangerText]}>
                Clear Cache
              </Text>
              <Text style={styles.settingDescription}>
                Reset cached weather and temporary logs
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Version Footnote */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerBrand}>ItinerAI</Text>
          <Text style={styles.footerSubText}>
            Smart AI Travel Itinerary Planner
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsEditModalVisible(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your Name"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Traveler Handle</Text>
            <TextInput
              style={styles.modalInput}
              value={editHandle}
              onChangeText={setEditHandle}
              placeholder="@handle"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Home City</Text>
            <TextInput
              style={styles.modalInput}
              value={editHomeCity}
              onChangeText={setEditHomeCity}
              placeholder="e.g. San Francisco, CA"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfileModal}>
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Picker Modal */}
      <Modal
        visible={isCurrencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCurrencyModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCurrencyModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Display Currency</Text>
            <Text style={styles.modalSubtitle}>
              Select currency for budget and cost estimates
            </Text>

            {CURRENCIES.map(curr => {
              const isSelected = profile.currency === curr;
              return (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyRow,
                    isSelected && styles.currencyRowSelected,
                  ]}
                  onPress={() => {
                    saveProfileUpdate({currency: curr});
                    setIsCurrencyModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.currencyRowText,
                      isSelected && styles.currencyRowTextSelected,
                    ]}>
                    {curr}
                  </Text>
                  {isSelected && <Check size={16} color="#0F4C5C" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: '#0F4C5C',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#0F4C5C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF6B4A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0F4C5C',
  },
  heroInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: fp(2.1),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userHandle: {
    fontSize: fp(1.2),
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: fp(1.15),
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  editProfileBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  editProfileBtnText: {
    fontSize: fp(1.15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIconGreen: {
    backgroundColor: '#ECFDF5',
  },
  statIconBlue: {
    backgroundColor: '#EFF6FF',
  },
  statIconOrange: {
    backgroundColor: '#FFF7ED',
  },
  statValue: {
    fontSize: fp(2.0),
    fontWeight: '800',
    color: '#0F4C5C',
  },
  statLabel: {
    fontSize: fp(1.05),
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shortcutBtnText: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: fp(1.15),
    fontWeight: '800',
    color: '#0F4C5C',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: fp(1.15),
    color: '#64748B',
    marginBottom: 12,
  },
  paceSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paceOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  paceOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  paceIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  paceIconCircleActive: {
    backgroundColor: '#DBEAFE',
  },
  paceTitle: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#1E293B',
  },
  paceTitleActive: {
    color: '#2563EB',
  },
  paceSub: {
    fontSize: fp(0.9),
    color: '#64748B',
    marginTop: 2,
  },
  vibesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  vibeChipSelected: {
    backgroundColor: '#0F4C5C',
    borderColor: '#0F4C5C',
  },
  vibeText: {
    fontSize: fp(1.15),
    color: '#334155',
    fontWeight: '600',
  },
  vibeTextSelected: {
    color: '#FFFFFF',
  },
  vibeCheckBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF6B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconBlue: {
    backgroundColor: '#EFF6FF',
  },
  settingIconOrange: {
    backgroundColor: '#FFF7ED',
  },
  settingIconGray: {
    backgroundColor: '#F1F5F9',
  },
  settingIconRed: {
    backgroundColor: '#FEF2F2',
  },
  dangerText: {
    color: '#EF4444',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fp(1.3),
    fontWeight: '700',
    color: '#1E293B',
  },
  settingDescription: {
    fontSize: fp(1.05),
    color: '#64748B',
    marginTop: 1,
  },
  settingValue: {
    fontSize: fp(1.2),
    color: '#64748B',
    fontWeight: '600',
  },
  currencyValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetOptionActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0F4C5C',
  },
  budgetIconCircleActive: {
    backgroundColor: '#CCFBF1',
  },
  budgetTitleActive: {
    color: '#0F4C5C',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerBrand: {
    fontSize: fp(1.25),
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  footerSubText: {
    fontSize: fp(1.05),
    color: '#94A3B8',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: fp(1.8),
    fontWeight: '800',
    color: '#0F4C5C',
  },
  modalSubtitle: {
    fontSize: fp(1.15),
    color: '#64748B',
    marginBottom: 16,
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: fp(1.15),
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fp(1.35),
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: fp(1.3),
    fontWeight: '600',
    color: '#64748B',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0F4C5C',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: fp(1.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currencyRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  currencyRowText: {
    fontSize: fp(1.35),
    fontWeight: '600',
    color: '#1E293B',
  },
  currencyRowTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
