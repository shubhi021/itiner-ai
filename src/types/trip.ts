export type Activity = {
  time: string;
  name: string;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  estimatedCost?: string;
  category: 'food' | 'landmark' | 'nature' | 'nightlife' | 'shopping' | 'other';
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

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: number;
}

export interface PackingItem {
  id: string;
  name: string;
  category:
    | 'Clothing'
    | 'Tech & Adapters'
    | 'Toiletries'
    | 'Documents'
    | 'Weather Gear'
    | 'Other';
  packed: boolean;
  tip?: string;
}

export interface DestinationInsights {
  tippingCulture: string;
  transitTips: string[];
  culturalEtiquette: {
    dos: string[];
    donts: string[];
  };
  emergencyNumbers: {
    police: string;
    ambulance: string;
    general: string;
  };
  essentialPhrases: {
    phrase: string;
    translation: string;
    pronunciation?: string;
  }[];
}

export interface BudgetCategory {
  category: string;
  estimated: string;
  percentage: number;
  tip: string;
}

export interface BudgetForecast {
  totalEstimated: string;
  currency: string;
  dailyAverage: string;
  categories: BudgetCategory[];
  moneySavingTips: string[];
}

export type DayOptimizationPreset =
  | 'relaxed'
  | 'foodie'
  | 'efficient_transit'
  | 'rain_protocol'
  | 'custom';
