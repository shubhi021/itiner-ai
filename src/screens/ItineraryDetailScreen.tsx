import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground, Image } from 'react-native';
import { fp } from '../utils/responsive';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ChevronLeft, Share2, Edit3, MapPin, Utensils, Landmark } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ItineraryDetail'>;

const MOCK_ITINERARY = {
  title: 'Lisbon City Break',
  subtitle: 'Aug 12 - Aug 17, 2024 • Portugal',
  heroImage: 'https://images.unsplash.com/photo-1585286289943-22877a16fb8e?q=80&w=600&auto=format&fit=crop', // Lisbon
  mapImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop', // Map placeholder
  stats: [
    { label: 'DAYS', value: '5 Days' },
    { label: 'BUDGET', value: '€750' },
    { label: 'ACTIVITIES', value: '12 Stops' },
  ],
  days: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
  activities: [
    {
      id: '1',
      type: 'food',
      name: 'Pasteis de Belém',
      time: '09:30 AM',
      description: 'Historic bakery famous for original custard tarts. Essential Lisbon experience.',
      cost: 'Est. €10-15',
    },
    {
      id: '2',
      type: 'landmark',
      name: 'Jerónimos Monastery',
      time: '11:00 AM',
      description: 'UNESCO World Heritage site showcasing Manueline architecture.',
      cost: 'Est. €12',
    }
  ]
};

export const ItineraryDetailScreen: React.FC<Props> = ({ navigation }) => {
  const [activeDay, setActiveDay] = useState('Day 1');

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Utensils size={20} color="#FF6B4A" />;
      case 'landmark':
        return <Landmark size={20} color="#3B82F6" />;
      default:
        return <MapPin size={20} color="#9CA3AF" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'food':
        return '#FFF1F2'; // Light orange/red
      case 'landmark':
        return '#EFF6FF'; // Light blue
      default:
        return '#F3F4F6';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Draft Banner */}
        <SafeAreaView style={styles.draftBannerWrapper}>
          <View style={styles.draftBanner}>
            <Text style={styles.draftText}>This trip was auto-saved as a draft</Text>
            <View style={styles.draftActions}>
              <TouchableOpacity><Text style={styles.keepText}>KEEP</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.discardText}>DISCARD</Text></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Hero Section */}
        <ImageBackground source={{ uri: MOCK_ITINERARY.heroImage }} style={styles.heroImage}>
          <SafeAreaView style={styles.heroSafeArea}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <ChevronLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.iconButton}>
                  <Share2 size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Edit3 size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{MOCK_ITINERARY.title}</Text>
              <Text style={styles.heroSubtitle}>{MOCK_ITINERARY.subtitle}</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {MOCK_ITINERARY.stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Map Preview */}
          <View style={styles.mapContainer}>
             <Image source={{ uri: MOCK_ITINERARY.mapImage }} style={styles.mapImage} />
             {/* Map overlay content would go here, simulating pins */}
             <TouchableOpacity style={styles.mapButton}>
               <Text style={styles.mapButtonText}>View full map</Text>
             </TouchableOpacity>
          </View>

          {/* Days Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            {MOCK_ITINERARY.days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.tabButton, activeDay === day && styles.tabButtonActive]}
                onPress={() => setActiveDay(day)}
              >
                <Text style={[styles.tabText, activeDay === day && styles.tabTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Activities List */}
          <View style={styles.activitiesContainer}>
            {MOCK_ITINERARY.activities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={[styles.activityIconContainer, { backgroundColor: getIconBgColor(activity.type) }]}>
                    {renderActivityIcon(activity.type)}
                  </View>
                  <View style={styles.activityTitleRow}>
                    <Text style={styles.activityName}>{activity.name}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityCost}>{activity.cost}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Edit itinerary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom actions
  },
  draftBannerWrapper: {
    backgroundColor: '#0F4C5C',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  draftBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  draftText: {
    color: '#FFFFFF',
    fontSize: fp(1.4),
    fontWeight: '500',
  },
  draftActions: {
    flexDirection: 'row',
    gap: 12,
  },
  keepText: {
    color: '#FF6B4A',
    fontSize: fp(1.4),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  discardText: {
    color: '#FFFFFF',
    fontSize: fp(1.4),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroImage: {
    width: '100%',
    height: 350,
  },
  heroSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)', // Overlay to make text readable
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50, // Account for draft banner
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroTitle: {
    fontSize: fp(3.3),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: fp(1.6),
    color: '#E5E7EB',
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: fp(1.1),
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  mapContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  mapButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapButtonText: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    marginRight: 24,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#0F4C5C',
  },
  tabText: {
    fontSize: fp(1.8),
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#0F4C5C',
  },
  activitiesContainer: {
    gap: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTitleRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityName: {
    flex: 1,
    fontSize: fp(1.8),
    fontWeight: '600',
    color: '#0F4C5C',
    marginRight: 8,
  },
  activityTime: {
    fontSize: fp(1.4),
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activityDescription: {
    fontSize: fp(1.6),
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
    paddingLeft: 52, // Align with text content
  },
  activityCost: {
    fontSize: fp(1.4),
    fontWeight: '600',
    color: '#9CA3AF',
    paddingLeft: 52,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAF8',
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30, // SafeArea spacing
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  outlineButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F4C5C',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  outlineButtonText: {
    fontSize: fp(1.9),
    fontWeight: '600',
    color: '#0F4C5C',
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: fp(1.9),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
