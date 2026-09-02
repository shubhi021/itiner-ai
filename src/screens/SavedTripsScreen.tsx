import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image } from 'react-native';
import { fp } from '../utils/responsive';
import { Search, MoreVertical } from 'lucide-react-native';

const MOCK_TRIPS = [
  {
    id: '1',
    title: 'Lisbon City Break',
    dates: 'Aug 12 - Aug 17, 2024',
    duration: '5 days',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1585286289943-22877a16fb8e?q=80&w=200&auto=format&fit=crop', // Lisbon
  },
  {
    id: '2',
    title: 'Tokyo & Osaka Ad...',
    dates: 'Oct 20 - Oct 27, 2024',
    duration: '7 days',
    status: 'DRAFT',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=200&auto=format&fit=crop', // Tokyo
  },
  {
    id: '3',
    title: 'Paris Quick Getaw...',
    dates: 'Jun 04 - Jun 08, 2024',
    duration: '4 days',
    status: 'COMPLETED',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=200&auto=format&fit=crop', // Paris grayscale-like
  },
];

export const SavedTripsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Upcoming', 'Past'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return '#0F4C5C'; // Dark blue text for upcoming? Design shows light gray pill with dark text
      case 'DRAFT':
        return '#FF6B4A'; // Orange
      case 'COMPLETED':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return '#F3F4F6';
      case 'DRAFT':
        return '#FFF1F2'; // Light red/orange
      case 'COMPLETED':
        return '#F3F4F6';
      default:
        return '#F3F4F6';
    }
  };

  const renderTripCard = ({ item }: { item: typeof MOCK_TRIPS[0] }) => (
    <View style={styles.cardContainer}>
      <Image source={{ uri: item.image }} style={[styles.cardImage, item.status === 'COMPLETED' && { opacity: 0.5 }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardDates}>{item.dates}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <MoreVertical size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your trips</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={MOCK_TRIPS}
          keyExtractor={(item) => item.id}
          renderItem={renderTripCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: fp(3.0),
    fontWeight: '700',
    color: '#0F4C5C', // Dark teal
    letterSpacing: -0.5,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#0F4C5C',
  },
  filterText: {
    fontSize: fp(1.6),
    fontWeight: '500',
    color: '#9CA3AF',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 20,
    gap: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    // Add border for draft to match design if needed, but simple shadow looks good
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: fp(1.3),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: fp(1.4),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: fp(1.9),
    fontWeight: '600',
    color: '#0F4C5C',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDates: {
    fontSize: fp(1.4),
    color: '#9CA3AF',
    fontWeight: '400',
  },
  moreButton: {
    padding: 8,
  },
});
