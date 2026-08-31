import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RootStackParamList, MainTabParamList} from './types';

// Screens
import {SplashScreen} from '../screens/SplashScreen';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import {TripFormScreen} from '../screens/TripFormScreen';
import {SavedTripsScreen} from '../screens/SavedTripsScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {LoadingScreen} from '../screens/LoadingScreen';
import {TripSummaryScreen} from '../screens/TripSummaryScreen';
import {ItineraryDetailScreen} from '../screens/ItineraryDetailScreen';
import {ActivityDetailScreen} from '../screens/ActivityDetailScreen';

// Icons
import {Map, Bookmark, User} from 'lucide-react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFFFFF' },
        tabBarActiveTintColor: '#FF6B4A',
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tab.Screen 
        name="Plan" 
        component={TripFormScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Trips" 
        component={SavedTripsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="TripSummary" component={TripSummaryScreen} />
      <Stack.Screen name="ItineraryDetail" component={ItineraryDetailScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
    </Stack.Navigator>
  );
};
