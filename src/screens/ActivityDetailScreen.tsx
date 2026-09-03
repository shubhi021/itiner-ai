import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { fp } from '../utils/responsive';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ChevronLeft, Share2, CheckCircle, ThumbsUp, ThumbsDown, X, MapPin } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivityDetail'>;

const { width } = Dimensions.get('window');

export const ActivityDetailScreen: React.FC<Props> = ({ navigation }) => {
  const [showAlternatives, setShowAlternatives] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.headerImage}
          />
          {/* Top Actions */}
          <SafeAreaView style={styles.topActionsSafeArea}>
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <ChevronLeft color="#FFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Share2 color="#FFF" size={20} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Floating walk time tag */}
          <View style={styles.floatingTag}>
            <MapPin color="#FF6B4A" size={12} />
            <Text style={styles.floatingTagText}>18 MIN WALK FROM NAKAMISE STREET</Text>
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.dayTimeText}>DAY 1 • 11:30 AM</Text>
          <Text style={styles.title}>Senso-ji Temple</Text>
          
          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagBase}>
              <Text style={styles.tagBaseText}>HISTORIC SITE</Text>
            </View>
            <View style={styles.tagSaved}>
              <CheckCircle color="#10B981" size={14} style={{ marginRight: 4 }} />
              <Text style={styles.tagSavedText}>SAVED TO ITINERARY</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Explore Tokyo's oldest temple, dedicated to the bodhisattva Kannon. Stroll through the historic Nakamise street, lined with traditional snacks and crafts, leading up to the majestic main hall and five-story pagoda.
          </Text>

          {/* Info Cards */}
          <View style={styles.infoCardsRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>ESTIMATED COST</Text>
              <Text style={styles.infoCardValue}>Free Entry</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>DURATION</Text>
              <Text style={styles.infoCardValue}>1.5 - 2 Hours</Text>
            </View>
          </View>

          {/* Feedback */}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>WAS THIS A GOOD SUGGESTION?</Text>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity style={styles.feedbackBtn}>
                <ThumbsUp color="#9CA3AF" size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedbackBtn}>
                <ThumbsDown color="#9CA3AF" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationTitle}>Location</Text>
              <TouchableOpacity>
                <Text style={styles.openInMapsText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapPlaceholder}>
               <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop' }} 
                  style={styles.mapImage} 
               />
               <View style={styles.mapPinContainer}>
                 <MapPin color="#FF6B4A" size={24} fill="#FF6B4A" />
               </View>
            </View>
            <Text style={styles.address}>2-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan</Text>
          </View>
          
          {/* Bottom spacing to ensure content is visible above alternatives sheet */}
          <View style={{ height: showAlternatives ? 280 : 40 }} />
        </View>
      </ScrollView>

      {/* Alternatives Bottom Sheet (simulated) */}
      {showAlternatives && (
        <View style={styles.alternativesSheet}>
          <View style={styles.altHeader}>
            <View>
              <Text style={styles.altTitle}>Similar alternatives</Text>
              <Text style={styles.altSubtitle}>Based on your love for history and landmarks</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAlternatives(false)}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.altCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1590250992673-c88fbd4ce5f9?q=80&w=150&auto=format&fit=crop' }} style={styles.altCardImage} />
            <View style={styles.altCardContent}>
              <Text style={styles.altCardTitle}>Asakusa-jinja Shrine</Text>
              <Text style={styles.altCardTime}>10 MIN CLOSER</Text>
              <Text style={styles.altCardDesc} numberOfLines={2}>Similar historic vibe, much quieter and less crowded.</Text>
            </View>
            <TouchableOpacity style={styles.useButton}>
              <Text style={styles.useButtonText}>USE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.altCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1506159904225-b825db79b882?q=80&w=150&auto=format&fit=crop' }} style={styles.altCardImage} />
            <View style={styles.altCardContent}>
              <Text style={styles.altCardTitle}>Sumida Park</Text>
              <Text style={styles.altCardTime}>GREAT VIEW</Text>
              <Text style={styles.altCardDesc} numberOfLines={2}>Perfect for a river walk after lunch near the temple.</Text>
            </View>
            <TouchableOpacity style={styles.useButtonLight}>
              <Text style={styles.useButtonTextLight}>USE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  topActionsSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingTag: {
    position: 'absolute',
    bottom: 30, // Above the card overlap
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  floatingTagText: {
    fontSize: fp(1.0),
    fontWeight: '700',
    color: '#FF6B4A',
    marginLeft: 4,
  },
  contentCard: {
    backgroundColor: '#FAFAF8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24, // Overlap image
    padding: 24,
  },
  dayTimeText: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#FF6B4A',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: fp(3.2),
    fontWeight: '800',
    color: '#0F4C5C',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBase: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagBaseText: {
    fontSize: fp(1.0),
    fontWeight: '700',
    color: '#4B5563',
  },
  tagSaved: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagSavedText: {
    fontSize: fp(1.0),
    fontWeight: '700',
    color: '#065F46',
  },
  description: {
    fontSize: fp(1.5),
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
  },
  infoCardLabel: {
    fontSize: fp(1.0),
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  infoCardValue: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  feedbackText: {
    fontSize: fp(1.1),
    fontWeight: '700',
    color: '#9CA3AF',
    width: '50%',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  openInMapsText: {
    fontSize: fp(1.2),
    fontWeight: '700',
    color: '#FF6B4A',
  },
  mapPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  mapPinContainer: {
    position: 'absolute',
  },
  address: {
    fontSize: fp(1.3),
    color: '#6B7280',
    lineHeight: 18,
  },
  alternativesSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40, // extra padding for bottom safe area
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(15, 76, 92, 0.1)',
    borderStyle: 'dashed',
  },
  altHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  altTitle: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: '#0F4C5C',
    marginBottom: 4,
  },
  altSubtitle: {
    fontSize: fp(1.2),
    color: '#9CA3AF',
  },
  altCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  altCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  altCardContent: {
    flex: 1,
  },
  altCardTitle: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#0F4C5C',
    marginBottom: 2,
  },
  altCardTime: {
    fontSize: fp(0.9),
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 4,
  },
  altCardDesc: {
    fontSize: fp(1.1),
    color: '#9CA3AF',
    lineHeight: 14,
  },
  useButton: {
    backgroundColor: '#0F4C5C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  useButtonText: {
    color: '#FFF',
    fontSize: fp(1.1),
    fontWeight: '700',
  },
  useButtonLight: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  useButtonTextLight: {
    color: '#6B7280',
    fontSize: fp(1.1),
    fontWeight: '700',
  },
});
