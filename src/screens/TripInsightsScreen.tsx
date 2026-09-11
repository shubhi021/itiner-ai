import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchPackingList,
  togglePackingItem,
  fetchDestinationInsights,
  fetchBudgetForecast,
} from '../store/itinerarySlice';
import { fp } from '../utils/responsive';
import {
  ChevronLeft,
  Sparkles,
  Luggage,
  Compass,
  Wallet,
  Check,
  RefreshCw,
  Phone,
  Coins,
  Train,
  CheckCircle2,
  XCircle,
  Volume2,
  Lightbulb,
} from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'TripInsights'>;
type ActiveTab = 'packing' | 'guide' | 'budget';

export const TripInsightsScreen: React.FC<Props> = ({ route, navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { destination, daysCount, budget } = route.params;

  const {
    currentItinerary,
    weather,
    packingList,
    packingLoading,
    insights,
    insightsLoading,
    budgetForecast,
    forecastLoading,
  } = useSelector((state: RootState) => state.itinerary);

  const [activeTab, setActiveTab] = useState<ActiveTab>('packing');

  const destinationCity = destination.split(',')[0].trim();
  const tripDays = daysCount || (currentItinerary?.days.length ?? 3);
  const tripBudget = (budget as 'low' | 'mid' | 'high') || 'mid';

  // Extract all activities flat for packing intelligence
  const allActivities = useMemo(() => {
    if (!currentItinerary) {
      return undefined;
    }
    return currentItinerary.days.flatMap(d => d.activities);
  }, [currentItinerary]);

  const weatherSummary = useMemo(() => {
    if (!weather) {
      return undefined;
    }
    return `${weather.condition}, ${weather.temp}°C`;
  }, [weather]);

  // Fetch data on initial mount
  useEffect(() => {
    dispatch(
      fetchPackingList({
        destination,
        daysCount: tripDays,
        weatherSummary,
        activities: allActivities,
      }),
    );
    dispatch(fetchDestinationInsights({ destination }));
    dispatch(
      fetchBudgetForecast({
        destination,
        daysCount: tripDays,
        budgetTier: tripBudget,
      }),
    );
  }, [
    dispatch,
    destination,
    tripDays,
    weatherSummary,
    allActivities,
    tripBudget,
  ]);

  // Packing stats
  const packingStats = useMemo(() => {
    if (!packingList || packingList.length === 0) {
      return { packed: 0, total: 0, percentage: 0 };
    }
    const packed = packingList.filter(i => i.packed).length;
    const total = packingList.length;
    return { packed, total, percentage: Math.round((packed / total) * 100) };
  }, [packingList]);

  // Group packing items by category
  const categorizedPacking = useMemo(() => {
    if (!packingList) {
      return {};
    }
    return packingList.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof packingList>);
  }, [packingList]);

  const handleToggleItem = (id: string) => {
    dispatch(togglePackingItem({ id, destination }));
  };

  const handleCallEmergency = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum}`).catch(() => {
      Alert.alert('Unable to dial', `Emergency number is ${phoneNum}`);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>{destinationCity} Intelligence</Text>
          <Text style={styles.headerSub}>AI-generated guides & trip tools</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Segmented Tab Controls */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'packing' && styles.tabButtonActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('packing')}>
          <Luggage
            size={16}
            color={activeTab === 'packing' ? '#FF6B4A' : '#64748B'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'packing' && styles.tabButtonTextActive,
            ]}>
            Packing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'guide' && styles.tabButtonActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('guide')}>
          <Compass
            size={16}
            color={activeTab === 'guide' ? '#FF6B4A' : '#64748B'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'guide' && styles.tabButtonTextActive,
            ]}>
            Guide
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'budget' && styles.tabButtonActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('budget')}>
          <Wallet
            size={16}
            color={activeTab === 'budget' ? '#FF6B4A' : '#64748B'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'budget' && styles.tabButtonTextActive,
            ]}>
            Budget
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* TAB 1: SMART PACKING CHECKLIST */}
        {activeTab === 'packing' && (
          <View>
            {/* Progress Card */}
            <View style={styles.progressCard}>
              <View style={styles.progressTopRow}>
                <View>
                  <Text style={styles.progressTitle}>Packing Progress</Text>
                  <Text style={styles.progressSub}>
                    {packingStats.packed} of {packingStats.total} packed (
                    {packingStats.percentage}%)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshIconBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    dispatch(
                      fetchPackingList({
                        destination,
                        daysCount: tripDays,
                        weatherSummary,
                        activities: allActivities,
                        forceRefresh: true,
                      }),
                    )
                  }>
                  <RefreshCw size={16} color="#0F4C5C" />
                </TouchableOpacity>
              </View>

              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${packingStats.percentage}%` },
                  ]}
                />
              </View>

              {weather && (
                <View style={styles.weatherContextPill}>
                  <Sparkles size={12} color="#0F4C5C" />
                  <Text style={styles.weatherContextText}>
                    Synced with {weather.condition} forecast in{' '}
                    {destinationCity}
                  </Text>
                </View>
              )}
            </View>

            {packingLoading && !packingList ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FF6B4A" />
                <Text style={styles.loaderText}>
                  Gemini is curating your personalized packing list...
                </Text>
              </View>
            ) : (
              Object.entries(categorizedPacking).map(([category, items]) => (
                <View key={category} style={styles.categoryBlock}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {items.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.packingItemCard,
                        item.packed && styles.packingItemCardPacked,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleToggleItem(item.id)}>
                      <View
                        style={[
                          styles.checkbox,
                          item.packed && styles.checkboxPacked,
                        ]}>
                        {item.packed && <Check size={13} color="#FFFFFF" />}
                      </View>
                      <View style={styles.itemContent}>
                        <Text
                          style={[
                            styles.itemName,
                            item.packed && styles.itemNamePacked,
                          ]}>
                          {item.name}
                        </Text>
                        {item.tip ? (
                          <Text style={styles.itemTip}>{item.tip}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: CULTURAL & SURVIVAL GUIDE */}
        {activeTab === 'guide' && (
          <View>
            {insightsLoading && !insights ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FF6B4A" />
                <Text style={styles.loaderText}>
                  Generating local cultural briefing...
                </Text>
              </View>
            ) : insights ? (
              <View>
                {/* Tipping Culture */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconCircleTeal}>
                      <Coins size={16} color="#0F4C5C" />
                    </View>
                    <Text style={styles.cardTitle}>Tipping Customs</Text>
                  </View>
                  <Text style={styles.cardBodyText}>
                    {insights.tippingCulture}
                  </Text>
                </View>

                {/* Transit Tips */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconCircleCoral}>
                      <Train size={16} color="#FF6B4A" />
                    </View>
                    <Text style={styles.cardTitle}>
                      Transit & Getting Around
                    </Text>
                  </View>
                  {insights.transitTips.map((tip, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{tip}</Text>
                    </View>
                  ))}
                </View>

                {/* Cultural Dos & Don'ts */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconCircleTeal}>
                      <Compass size={16} color="#0F4C5C" />
                    </View>
                    <Text style={styles.cardTitle}>Cultural Etiquette</Text>
                  </View>

                  <Text style={styles.subSectionTitle}>Key Dos</Text>
                  {insights.culturalEtiquette.dos.map((item, idx) => (
                    <View key={`do_${idx}`} style={styles.etiquetteRow}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <Text style={styles.etiquetteText}>{item}</Text>
                    </View>
                  ))}

                  <Text style={[styles.subSectionTitle, styles.dontsTitle]}>
                    Key Don'ts
                  </Text>
                  {insights.culturalEtiquette.donts.map((item, idx) => (
                    <View key={`dont_${idx}`} style={styles.etiquetteRow}>
                      <XCircle size={16} color="#EF4444" />
                      <Text style={styles.etiquetteText}>{item}</Text>
                    </View>
                  ))}
                </View>

                {/* Essential Phrases */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconCircleCoral}>
                      <Volume2 size={16} color="#FF6B4A" />
                    </View>
                    <Text style={styles.cardTitle}>Essential Phrases</Text>
                  </View>
                  {insights.essentialPhrases.map((phrase, idx) => (
                    <View key={idx} style={styles.phraseRow}>
                      <View style={styles.phraseCol}>
                        <Text style={styles.phraseOriginal}>
                          {phrase.phrase}
                        </Text>
                        <Text style={styles.phraseTranslation}>
                          {phrase.translation}
                        </Text>
                      </View>
                      {phrase.pronunciation && (
                        <View style={styles.pronounceBadge}>
                          <Text style={styles.pronounceText}>
                            /{phrase.pronunciation}/
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                {/* Emergency Hotlines */}
                <View style={[styles.card, styles.emergencyCard]}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconCircleRed}>
                      <Phone size={16} color="#EF4444" />
                    </View>
                    <Text style={styles.cardTitle}>Emergency Hotlines</Text>
                  </View>
                  <View style={styles.emergencyRow}>
                    <TouchableOpacity
                      style={styles.emergencyBtn}
                      activeOpacity={0.7}
                      onPress={() =>
                        handleCallEmergency(insights.emergencyNumbers.police)
                      }>
                      <Text style={styles.emergencyLabel}>Police</Text>
                      <Text style={styles.emergencyNumber}>
                        {insights.emergencyNumbers.police}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.emergencyBtn}
                      activeOpacity={0.7}
                      onPress={() =>
                        handleCallEmergency(insights.emergencyNumbers.ambulance)
                      }>
                      <Text style={styles.emergencyLabel}>Ambulance</Text>
                      <Text style={styles.emergencyNumber}>
                        {insights.emergencyNumbers.ambulance}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.emergencyBtn}
                      activeOpacity={0.7}
                      onPress={() =>
                        handleCallEmergency(insights.emergencyNumbers.general)
                      }>
                      <Text style={styles.emergencyLabel}>General</Text>
                      <Text style={styles.emergencyNumber}>
                        {insights.emergencyNumbers.general}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* TAB 3: BUDGET BREAKDOWN & FORECAST */}
        {activeTab === 'budget' && (
          <View>
            {forecastLoading && !budgetForecast ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FF6B4A" />
                <Text style={styles.loaderText}>
                  Calculating expense projection...
                </Text>
              </View>
            ) : budgetForecast ? (
              <View>
                {/* Hero Cost Card */}
                <View style={styles.budgetHeroCard}>
                  <Text style={styles.budgetHeroLabel}>
                    PROJECTED TOTAL ({tripDays} DAYS •{' '}
                    {tripBudget.toUpperCase()} TIER)
                  </Text>
                  <Text style={styles.budgetHeroTotal}>
                    {budgetForecast.totalEstimated}
                  </Text>
                  <View style={styles.dailyBadge}>
                    <Text style={styles.dailyBadgeText}>
                      ~{budgetForecast.dailyAverage} / day average
                    </Text>
                  </View>
                </View>

                {/* Category Bars */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Category Breakdown</Text>
                  {budgetForecast.categories.map((cat, idx) => (
                    <View key={idx} style={styles.categoryCostItem}>
                      <View style={styles.categoryCostHeader}>
                        <Text style={styles.categoryCostName}>
                          {cat.category}
                        </Text>
                        <Text style={styles.categoryCostAmount}>
                          {cat.estimated} ({cat.percentage}%)
                        </Text>
                      </View>
                      <View style={styles.catProgressBarTrack}>
                        <View
                          style={[
                            styles.catProgressBarFill,
                            { width: `${Math.min(cat.percentage, 100)}%` },
                          ]}
                        />
                      </View>
                      {cat.tip ? (
                        <Text style={styles.categoryCostTip}>{cat.tip}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>

                {/* Money Saving Tips */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconCircleTeal}>
                      <Lightbulb size={16} color="#0F4C5C" />
                    </View>
                    <Text style={styles.cardTitle}>
                      Local Money-Saving Hacks
                    </Text>
                  </View>
                  {budgetForecast.moneySavingTips.map((tip, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: fp(1.15),
    color: '#64748B',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFF5F2',
  },
  tabButtonText: {
    fontSize: fp(1.3),
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FF6B4A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  progressSub: {
    fontSize: fp(1.2),
    color: '#64748B',
    marginTop: 2,
  },
  refreshIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B4A',
    borderRadius: 4,
  },
  weatherContextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  weatherContextText: {
    fontSize: fp(1.15),
    color: '#0F4C5C',
    fontWeight: '500',
  },
  categoryBlock: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: fp(1.25),
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  packingItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  packingItemCardPacked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxPacked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: fp(1.45),
    fontWeight: '600',
    color: '#1E293B',
  },
  itemNamePacked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  itemTip: {
    fontSize: fp(1.15),
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircleTeal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCoral: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  cardBodyText: {
    fontSize: fp(1.35),
    lineHeight: 20,
    color: '#334155',
  },
  subSectionTitle: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF6B4A',
    marginTop: 7,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: fp(1.35),
    lineHeight: 19,
    color: '#334155',
  },
  etiquetteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },
  etiquetteText: {
    flex: 1,
    fontSize: fp(1.35),
    color: '#334155',
  },
  phraseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  phraseOriginal: {
    fontSize: fp(1.45),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  phraseTranslation: {
    fontSize: fp(1.2),
    color: '#64748B',
    marginTop: 2,
  },
  pronounceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pronounceText: {
    fontSize: fp(1.15),
    color: '#475569',
    fontStyle: 'italic',
  },
  emergencyCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFDFD',
  },
  emergencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emergencyBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyLabel: {
    fontSize: fp(1.1),
    color: '#64748B',
    fontWeight: '500',
  },
  emergencyNumber: {
    fontSize: fp(1.45),
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 2,
  },
  budgetHeroCard: {
    backgroundColor: '#0F4C5C',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  budgetHeroLabel: {
    fontSize: fp(1.15),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  budgetHeroTotal: {
    fontSize: fp(2.8),
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  dailyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dailyBadgeText: {
    color: '#FFFFFF',
    fontSize: fp(1.2),
    fontWeight: '600',
  },
  categoryCostItem: {
    marginBottom: 12,
  },
  categoryCostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryCostName: {
    fontSize: fp(1.35),
    fontWeight: '600',
    color: '#1E293B',
  },
  categoryCostAmount: {
    fontSize: fp(1.35),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  catProgressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 4,
  },
  catProgressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B4A',
    borderRadius: 3,
  },
  categoryCostTip: {
    fontSize: fp(1.15),
    color: '#64748B',
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: fp(1.3),
    color: '#64748B',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 38,
  },
  dontsTitle: {
    marginTop: 14,
  },
  phraseCol: {
    flex: 1,
  },
});
