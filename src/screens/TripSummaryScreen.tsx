import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { fp } from '../utils/responsive';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Check, Plane, Calendar, Wallet, Search, ArrowRight } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'TripSummary'>;

export const TripSummaryScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Top Header Image */}
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.headerImage} 
          />
          <View style={styles.overlay}>
            <View style={styles.checkCircle}>
              <Check color="#FFFFFF" size={24} />
            </View>
            <Text style={styles.readyText}>Itinerary Ready!</Text>
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.cardContainer}>
          
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Tokyo Explorer</Text>
              <Text style={styles.subtitle}>5 Days • Medium Budget</Text>
            </View>
            <View style={styles.planeCircle}>
              <Plane color="#FF6B4A" size={20} style={{ transform: [{ rotate: '45deg' }] }} />
            </View>
          </View>

          {/* Info Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Calendar color="#9CA3AF" size={16} />
              </View>
              <View>
                <Text style={styles.infoLabel}>LENGTH</Text>
                <Text style={styles.infoValue}>5 Days</Text>
              </View>
            </View>
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Wallet color="#9CA3AF" size={16} />
              </View>
              <View>
                <Text style={styles.infoLabel}>EST. COST</Text>
                <Text style={styles.infoValue}>$1,200</Text>
              </View>
            </View>
          </View>

          {/* Map Overview */}
          <View style={styles.mapSection}>
            <Text style={styles.mapSectionTitle}>Trip Overview</Text>
            <View style={styles.mapContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop' }} 
                style={styles.mapImage}
              />
              {/* Fake pins to make it look like a map */}
              <View style={[styles.fakePin, { top: '30%', left: '40%' }]} />
              <View style={[styles.fakePinBlue, { top: '50%', left: '60%' }]} />
              <View style={[styles.fakePinOrange, { top: '40%', left: '70%' }]} />
              <View style={[styles.fakePin, { top: '60%', left: '30%' }]} />
              <View style={[styles.fakePinOrange, { top: '20%', left: '50%' }]} />
              <View style={[styles.fakePinBlue, { top: '70%', left: '55%' }]} />

              <TouchableOpacity style={styles.expandMapBtn}>
                <Search color="#0F4C5C" size={16} />
                <Text style={styles.expandMapText}>TAP TO EXPAND MAP</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('ItineraryDetail')}
            >
              <Text style={styles.primaryButtonText}>View full itinerary</Text>
              <ArrowRight color="#FFFFFF" size={18} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.discardButton} onPress={() => navigation.navigate('MainTabs', { screen: 'Plan' })}>
              <Text style={styles.discardText}>Discard and start over</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerImageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // slight darkening
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60, // shift content up a bit to account for card overlap
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  readyText: {
    fontSize: fp(3.2),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: -40, // overlap image
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: fp(2.6),
    fontWeight: '800',
    color: '#0F4C5C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fp(1.4),
    color: '#9CA3AF',
  },
  planeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  infoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: fp(1.0),
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  mapSection: {
    marginBottom: 40,
  },
  mapSectionTitle: {
    fontSize: fp(1.4),
    fontWeight: '700',
    color: '#0F4C5C',
    marginBottom: 12,
  },
  mapContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  fakePin: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fakePinBlue: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fakePinOrange: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  expandMapBtn: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  expandMapText: {
    fontSize: fp(1.1),
    fontWeight: '800',
    color: '#0F4C5C',
    marginLeft: 6,
  },
  bottomActions: {
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0F4C5C',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4C5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: fp(1.6),
    fontWeight: '700',
  },
  discardButton: {
    paddingVertical: 8,
  },
  discardText: {
    fontSize: fp(1.3),
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
