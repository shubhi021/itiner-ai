export type Activity = {
  time: string;
  name: string;
  description: string;
  location: string;
  estimatedCost?: string;
  category?: 'food' | 'landmark' | 'nature' | 'nightlife' | 'shopping' | 'other';
};

export type ItineraryDay = {
  day: number;
  activities: Activity[];
};

export type Itinerary = {
  destination: string;
  days: ItineraryDay[];
};

export type TripRequest = {
  destination: string;
  days: number;
  budget: 'low' | 'mid' | 'high';
  interests: string[];
  advanced?: {
    pace?: 'relaxed' | 'balanced' | 'packed';
    travelGroup?: 'solo' | 'couple' | 'family' | 'friends';
    dietary?: string[];
    stayArea?: string;
    customNote?: string;
  };
};
