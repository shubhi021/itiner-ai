import {NavigatorScreenParams} from '@react-navigation/native';
import {Activity} from '../types/trip';

export type MainTabParamList = {
  Plan: undefined;
  Trips: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Loading: undefined;
  TripSummary: {tripId?: string} | undefined;
  ItineraryDetail: {tripId?: string; isOffline?: boolean} | undefined;
  ActivityDetail:
    | {
        activity: Activity;
        dayNumber: number;
        destination: string;
      }
    | undefined;
  TripCopilot: {
    tripId?: string;
    destination: string;
    daysCount?: number;
    budget?: string;
  };
  TripInsights: {
    tripId?: string;
    destination: string;
    daysCount?: number;
    budget?: string;
  };
};
