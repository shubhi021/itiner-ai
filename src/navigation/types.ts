import { NavigatorScreenParams } from '@react-navigation/native';

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
  TripSummary: undefined;
  ItineraryDetail: undefined;
  ActivityDetail: undefined;
};
