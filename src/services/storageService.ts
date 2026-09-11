import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Itinerary,
  ChatMessage,
  PackingItem,
  DestinationInsights,
  BudgetForecast,
} from '../types/trip';
import {WeatherData} from './weatherService';

export interface SavedTrip {
  id: string;
  title: string;
  destination: string;
  dates: string;
  duration: string;
  status: 'UPCOMING' | 'COMPLETED' | 'DRAFT';
  imageUrl: string;
  itinerary: Itinerary;
  weather?: WeatherData | null;
  savedAt: number;
  budget: 'low' | 'mid' | 'high';
}

const SAVED_TRIPS_KEY = '@itinerai_saved_trips';
const ACTIVE_ITINERARY_KEY = '@itinerai_active_itinerary';
const WEATHER_CACHE_PREFIX = '@itinerai_weather_cache_';
const CHAT_CACHE_PREFIX = '@itinerai_chat_';
const PACKING_CACHE_PREFIX = '@itinerai_packing_';
const INSIGHTS_CACHE_PREFIX = '@itinerai_insights_';
const BUDGET_CACHE_PREFIX = '@itinerai_budget_';
const DEFAULT_WEATHER_TTL_MS = 60 * 60 * 1000; // 1 hour cache

/**
 * Storage Service
 * Provides offline caching, trip persistence, and TTL-governed weather caching.
 */
export const storageService = {
  /**
   * Retrieves all saved trips from AsyncStorage
   */
  async getSavedTrips(): Promise<SavedTrip[]> {
    try {
      const json = await AsyncStorage.getItem(SAVED_TRIPS_KEY);
      if (!json) {
        return [];
      }
      const trips: SavedTrip[] = JSON.parse(json);
      return Array.isArray(trips) ? trips : [];
    } catch (error) {
      console.warn('Failed to load saved trips from storage:', error);
      return [];
    }
  },

  /**
   * Saves or updates a trip in AsyncStorage
   */
  async saveTrip(trip: SavedTrip): Promise<void> {
    try {
      const currentTrips = await this.getSavedTrips();
      const existingIndex = currentTrips.findIndex(t => t.id === trip.id);

      let updatedTrips: SavedTrip[];
      if (existingIndex >= 0) {
        updatedTrips = [...currentTrips];
        updatedTrips[existingIndex] = trip;
      } else {
        updatedTrips = [trip, ...currentTrips];
      }

      await AsyncStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
    } catch (error) {
      console.warn('Failed to save trip to storage:', error);
      throw error;
    }
  },

  /**
   * Deletes a trip by ID from AsyncStorage
   */
  async deleteTrip(id: string): Promise<void> {
    try {
      const currentTrips = await this.getSavedTrips();
      const updatedTrips = currentTrips.filter(t => t.id !== id);
      await AsyncStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
    } catch (error) {
      console.warn('Failed to delete trip from storage:', error);
      throw error;
    }
  },

  /**
   * Updates the status of an existing trip (UPCOMING, COMPLETED, DRAFT)
   */
  async updateTripStatus(
    id: string,
    status: 'UPCOMING' | 'COMPLETED' | 'DRAFT',
  ): Promise<void> {
    try {
      const currentTrips = await this.getSavedTrips();
      const updatedTrips = currentTrips.map(t =>
        t.id === id ? {...t, status} : t,
      );
      await AsyncStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
    } catch (error) {
      console.warn('Failed to update trip status in storage:', error);
      throw error;
    }
  },

  /**
   * Checks if a trip for a given destination is already bookmarked
   */
  async isTripSaved(destination: string): Promise<boolean> {
    try {
      const currentTrips = await this.getSavedTrips();
      const destLower = destination.trim().toLowerCase();
      return currentTrips.some(
        t => t.destination.trim().toLowerCase() === destLower,
      );
    } catch {
      return false;
    }
  },

  /**
   * Caches the currently active itinerary and its metadata for offline restoration
   */
  async cacheActiveItinerary(data: {
    itinerary: Itinerary;
    weather?: WeatherData | null;
    budget?: 'low' | 'mid' | 'high';
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_ITINERARY_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache active itinerary:', error);
    }
  },

  /**
   * Retrieves the cached active itinerary for offline restoration
   */
  async getCachedActiveItinerary(): Promise<{
    itinerary: Itinerary;
    weather?: WeatherData | null;
    budget?: 'low' | 'mid' | 'high';
  } | null> {
    try {
      const json = await AsyncStorage.getItem(ACTIVE_ITINERARY_KEY);
      if (!json) {
        return null;
      }
      return JSON.parse(json);
    } catch (error) {
      console.warn('Failed to get cached active itinerary:', error);
      return null;
    }
  },

  /**
   * Caches weather data with a timestamp for a given city/region
   */
  async cacheWeather(cityKey: string, weather: WeatherData): Promise<void> {
    try {
      const key = `${WEATHER_CACHE_PREFIX}${cityKey.toLowerCase().trim()}`;
      const payload = {
        timestamp: Date.now(),
        weather,
      };
      await AsyncStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to cache weather data:', error);
    }
  },

  /**
   * Retrieves cached weather data if it has not exceeded the TTL
   */
  async getCachedWeather(
    cityKey: string,
    maxAgeMs: number = DEFAULT_WEATHER_TTL_MS,
  ): Promise<WeatherData | null> {
    try {
      const key = `${WEATHER_CACHE_PREFIX}${cityKey.toLowerCase().trim()}`;
      const json = await AsyncStorage.getItem(key);
      if (!json) {
        return null;
      }

      const {timestamp, weather} = JSON.parse(json);
      if (Date.now() - timestamp > maxAgeMs) {
        return null; // Expired cache
      }
      return weather;
    } catch (error) {
      console.warn('Failed to retrieve cached weather data:', error);
      return null;
    }
  },

  /**
   * Retrieves cached conversational chat history for a trip
   */
  async getCachedChat(tripKey: string): Promise<ChatMessage[]> {
    try {
      const key = `${CHAT_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
      const json = await AsyncStorage.getItem(key);
      if (!json) {
        return [];
      }
      const messages: ChatMessage[] = JSON.parse(json);
      return Array.isArray(messages) ? messages : [];
    } catch (error) {
      console.warn('Failed to get cached chat:', error);
      return [];
    }
  },

  /**
   * Saves conversational chat history for a trip
   */
  async saveCachedChat(
    tripKey: string,
    messages: ChatMessage[],
  ): Promise<void> {
    try {
      const key = `${CHAT_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to save cached chat:', error);
    }
  },

  /**
   * Retrieves cached smart packing list for a trip
   */
  async getCachedPackingList(tripKey: string): Promise<PackingItem[] | null> {
    try {
      const key = `${PACKING_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
      const json = await AsyncStorage.getItem(key);
      if (!json) {
        return null;
      }
      const items: PackingItem[] = JSON.parse(json);
      return Array.isArray(items) ? items : null;
    } catch (error) {
      console.warn('Failed to get cached packing list:', error);
      return null;
    }
  },

  /**
   * Saves smart packing list for a trip
   */
  async saveCachedPackingList(
    tripKey: string,
    items: PackingItem[],
  ): Promise<void> {
    try {
      const key = `${PACKING_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save cached packing list:', error);
    }
  },

  /**
   * Retrieves cached destination cultural insights & travel guide
   */
  async getCachedTripInsights(
    destination: string,
  ): Promise<DestinationInsights | null> {
    try {
      const key = `${INSIGHTS_CACHE_PREFIX}${destination.toLowerCase().trim()}`;
      const json = await AsyncStorage.getItem(key);
      if (!json) {
        return null;
      }
      return JSON.parse(json);
    } catch (error) {
      console.warn('Failed to get cached trip insights:', error);
      return null;
    }
  },

  /**
   * Saves destination cultural insights & travel guide
   */
  async saveCachedTripInsights(
    destination: string,
    data: DestinationInsights,
  ): Promise<void> {
    try {
      const key = `${INSIGHTS_CACHE_PREFIX}${destination.toLowerCase().trim()}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cached trip insights:', error);
    }
  },

  /**
   * Retrieves cached budget forecast for a trip
   */
  async getCachedBudgetForecast(
    tripKey: string,
  ): Promise<BudgetForecast | null> {
    try {
      const key = `${BUDGET_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
      const json = await AsyncStorage.getItem(key);
      if (!json) {
        return null;
      }
      return JSON.parse(json);
    } catch (error) {
      console.warn('Failed to get cached budget forecast:', error);
      return null;
    }
  },

  /**
   * Saves budget forecast for a trip
   */
  async saveCachedBudgetForecast(
    tripKey: string,
    data: BudgetForecast,
  ): Promise<void> {
    try {
      const key = `${BUDGET_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cached budget forecast:', error);
    }
  },
};
