import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Switch } from 'react-native';
import { fp } from '../utils/responsive';
import { Settings, Compass, Wallet, Heart, Bell, Moon, FileOutput, ChevronRight } from 'lucide-react-native';

export const ProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Header */}
        <View style={styles.headerCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Sarah Jenkins</Text>
            <Text style={styles.userSince}>Member since Nov 2024</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings color="#9CA3AF" size={20} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>TRIPS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>COUNTRIES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>34</Text>
            <Text style={styles.statLabel}>DAYS</Text>
          </View>
        </View>

        {/* Travel Style */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>TRAVEL STYLE</Text>
          </View>
          <View style={styles.styleCard}>
            <View style={styles.iconCircleRed}>
              <Compass color="#FF6B4A" size={16} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.styleCardTitle}>Adventurous</Text>
            </View>
            <View style={styles.levelDots}>
              <View style={styles.dotRed} />
              <View style={styles.dotRed} />
              <View style={styles.dotRed} />
              <View style={styles.dotGray} />
            </View>
          </View>
        </View>

        {/* Travel Preferences */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>TRAVEL PREFERENCES</Text>
          </View>
          
          <TouchableOpacity style={styles.preferenceRow}>
            <View style={styles.iconCircleBlue}>
              <Wallet color="#3B82F6" size={16} />
            </View>
            <Text style={styles.preferenceLabel}>Default Budget</Text>
            <Text style={styles.preferenceValue}>Medium</Text>
            <ChevronRight color="#D1D5DB" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.preferenceRow, { borderBottomWidth: 0 }]}>
            <View style={styles.iconCircleOrange}>
              <Heart color="#F97316" size={16} />
            </View>
            <Text style={styles.preferenceLabel}>Top Interests</Text>
            <Text style={styles.preferenceValue}>Food, History</Text>
            <ChevronRight color="#D1D5DB" size={20} />
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          </View>
          
          <View style={styles.preferenceRow}>
            <View style={styles.iconCircleGreen}>
              <Bell color="#10B981" size={16} />
            </View>
            <Text style={styles.preferenceLabel}>Notifications</Text>
            <Switch
              trackColor={{ false: '#D1D5DB', true: '#FF6B4A' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#D1D5DB"
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <View style={styles.iconCirclePurple}>
              <Moon color="#8B5CF6" size={16} />
            </View>
            <Text style={styles.preferenceLabel}>Dark Mode</Text>
            <Switch
              trackColor={{ false: '#E5E7EB', true: '#FF6B4A' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E5E7EB"
              onValueChange={setDarkModeEnabled}
              value={darkModeEnabled}
            />
          </View>

          <TouchableOpacity style={[styles.preferenceRow, { borderBottomWidth: 0 }]}>
            <View style={styles.iconCircleDark}>
              <FileOutput color="#4B5563" size={16} />
            </View>
            <Text style={styles.preferenceLabel}>Export all trips</Text>
            <ChevronRight color="#D1D5DB" size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>ITINERAI V1.4.2</Text>

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
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fp(2.4),
    fontWeight: '800',
    color: '#0F4C5C',
    marginBottom: 4,
  },
  userSince: {
    fontSize: fp(1.3),
    color: '#9CA3AF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: fp(2.4),
    fontWeight: '800',
    color: '#0F4C5C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fp(1.0),
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: fp(1.1),
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleCardTitle: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#0F4C5C',
  },
  levelDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B4A',
  },
  dotGray: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleOrange: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCirclePurple: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferenceLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: fp(1.5),
    fontWeight: '600',
    color: '#374151',
  },
  preferenceValue: {
    fontSize: fp(1.4),
    color: '#9CA3AF',
    marginRight: 8,
  },
  signOutButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: fp(1.5),
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: fp(1.0),
    fontWeight: '700',
    color: '#D1D5DB',
    letterSpacing: 1,
    marginTop: 24,
  },
});
