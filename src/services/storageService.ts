import {MMKV} from 'react-native-mmkv';
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

export type AiOperatingMode = 'bff' | 'client' | 'demo';

export interface StorageBenchmarkResult {
  iterations: number;
  mmkvWriteMs: number;
  mmkvReadMs: number;
  asyncStorageWriteMs: number;
  asyncStorageReadMs: number;
  writeSpeedup: number;
  readSpeedup: number;
}

// Storage Keys
const SAVED_TRIPS_KEY = '@itinerai_saved_trips';
const ACTIVE_ITINERARY_KEY = '@itinerai_active_itinerary';
const WEATHER_CACHE_PREFIX = '@itinerai_weather_cache_';
const CHAT_CACHE_PREFIX = '@itinerai_chat_';
const PACKING_CACHE_PREFIX = '@itinerai_packing_';
const INSIGHTS_CACHE_PREFIX = '@itinerai_insights_';
const BUDGET_CACHE_PREFIX = '@itinerai_budget_';
const USER_PROFILE_KEY = '@itinerai_user_profile';
const ONBOARDING_KEY = '@has_completed_onboarding';
const CUSTOM_GEMINI_KEY = '@itinerai_custom_gemini_key';
const BFF_URL_KEY = '@itinerai_bff_url';
const AI_MODE_KEY = '@itinerai_ai_mode';
const MMKV_MIGRATION_FLAG = '@itinerai_mmkv_migrated_v1';

const DEFAULT_WEATHER_TTL_MS = 60 * 60 * 1000; // 1 hour cache

/**
 * MMKV Engine Initialization
 * Uses C++ JSI (JavaScript Interface) for synchronous, zero-bridge key/value I/O.
 */
export const mmkvInstance = new MMKV({
  id: 'itinerai-storage',
});

/**
 * High-Performance Storage Service
 *
 * Implements a JSI-powered MMKV storage layer with zero-bridge latency,
 * automated backward-compatible migration from legacy AsyncStorage,
 * and support for both synchronous and asynchronous operations.
 */
export const storageService = {
  /** Direct access to underlying MMKV instance */
  mmkv: mmkvInstance,

  // ==========================================
  // Migration & Core I/O
  // ==========================================

  /**
   * Automatically migrates legacy keys from AsyncStorage into MMKV on first launch.
   */
  async migrateFromAsyncStorage(): Promise<{migratedKeysCount: number}> {
    try {
      const alreadyMigrated = mmkvInstance.getBoolean(MMKV_MIGRATION_FLAG);
      if (alreadyMigrated) {
        return {migratedKeysCount: 0};
      }

      const allKeys = await AsyncStorage.getAllKeys();
      if (!allKeys || allKeys.length === 0) {
        mmkvInstance.set(MMKV_MIGRATION_FLAG, true);
        return {migratedKeysCount: 0};
      }

      let count = 0;
      for (const key of allKeys) {
        if (!mmkvInstance.contains(key)) {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) {
            mmkvInstance.set(key, value);
            count++;
          }
        }
      }

      mmkvInstance.set(MMKV_MIGRATION_FLAG, true);
      return {migratedKeysCount: count};
    } catch (error) {
      console.warn('Storage migration failed:', error);
      return {migratedKeysCount: 0};
    }
  },

  /**
   * Internal helper: Reads string from MMKV first, with fallback to AsyncStorage.
   */
  async _getString(key: string): Promise<string | null> {
    if (mmkvInstance.contains(key)) {
      return mmkvInstance.getString(key) ?? null;
    }
    try {
      const legacyValue = await AsyncStorage.getItem(key);
      if (legacyValue !== null) {
        // Transparent lazy migration
        mmkvInstance.set(key, legacyValue);
        return legacyValue;
      }
    } catch {
      // AsyncStorage failed or uninitialized
    }
    return null;
  },

  /**
   * Internal helper: Writes string to MMKV synchronously, mirroring to AsyncStorage for test compatibility.
   */
  async _setString(key: string, value: string): Promise<void> {
    mmkvInstance.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Non-critical mirror failure
    }
  },

  /**
   * Internal helper: Removes key from both stores.
   */
  async _remove(key: string): Promise<void> {
    mmkvInstance.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },

  // ==========================================
  // Saved Trips CRUD
  // ==========================================

  /**
   * Synchronous retrieval of saved trips (Zero bridge delay, instantaneous).
   */
  getSavedTripsSync(): SavedTrip[] {
    const raw = mmkvInstance.getString(SAVED_TRIPS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Retrieves all saved trips (Asynchronous for backwards compatibility).
   */
  async getSavedTrips(): Promise<SavedTrip[]> {
    const raw = await this._getString(SAVED_TRIPS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const trips = JSON.parse(raw);
      return Array.isArray(trips) ? trips : [];
    } catch {
      return [];
    }
  },

  /**
   * Saves or updates a trip.
   */
  async saveTrip(trip: SavedTrip): Promise<void> {
    const currentTrips = await this.getSavedTrips();
    const existingIndex = currentTrips.findIndex(t => t.id === trip.id);

    let updatedTrips: SavedTrip[];
    if (existingIndex >= 0) {
      updatedTrips = [...currentTrips];
      updatedTrips[existingIndex] = trip;
    } else {
      updatedTrips = [trip, ...currentTrips];
    }

    await this._setString(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
  },

  /**
   * Deletes a trip by ID.
   */
  async deleteTrip(id: string): Promise<void> {
    const currentTrips = await this.getSavedTrips();
    const updatedTrips = currentTrips.filter(t => t.id !== id);
    await this._setString(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
  },

  /**
   * Updates trip status.
   */
  async updateTripStatus(
    id: string,
    status: 'UPCOMING' | 'COMPLETED' | 'DRAFT',
  ): Promise<void> {
    const currentTrips = await this.getSavedTrips();
    const updatedTrips = currentTrips.map(t =>
      t.id === id ? {...t, status} : t,
    );
    await this._setString(SAVED_TRIPS_KEY, JSON.stringify(updatedTrips));
  },

  /**
   * Checks if a trip for a given destination is already bookmarked.
   */
  async isTripSaved(destination: string): Promise<boolean> {
    const currentTrips = await this.getSavedTrips();
    const destLower = destination.trim().toLowerCase();
    return currentTrips.some(
      t => t.destination.trim().toLowerCase() === destLower,
    );
  },

  /**
   * Synchronous check if trip is saved.
   */
  isTripSavedSync(destination: string): boolean {
    const currentTrips = this.getSavedTripsSync();
    const destLower = destination.trim().toLowerCase();
    return currentTrips.some(
      t => t.destination.trim().toLowerCase() === destLower,
    );
  },

  // ==========================================
  // Active Itinerary Persistence
  // ==========================================

  /**
   * Caches active itinerary.
   */
  async cacheActiveItinerary(data: {
    itinerary: Itinerary;
    weather?: WeatherData | null;
    budget?: 'low' | 'mid' | 'high';
  }): Promise<void> {
    await this._setString(ACTIVE_ITINERARY_KEY, JSON.stringify(data));
  },

  /**
   * Synchronous active itinerary retrieval.
   */
  getCachedActiveItinerarySync(): {
    itinerary: Itinerary;
    weather?: WeatherData | null;
    budget?: 'low' | 'mid' | 'high';
  } | null {
    const raw = mmkvInstance.getString(ACTIVE_ITINERARY_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Asynchronous active itinerary retrieval.
   */
  async getCachedActiveItinerary(): Promise<{
    itinerary: Itinerary;
    weather?: WeatherData | null;
    budget?: 'low' | 'mid' | 'high';
  } | null> {
    const raw = await this._getString(ACTIVE_ITINERARY_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // ==========================================
  // Weather Caching with TTL
  // ==========================================

  async cacheWeather(cityKey: string, weather: WeatherData): Promise<void> {
    const key = `${WEATHER_CACHE_PREFIX}${cityKey.toLowerCase().trim()}`;
    const payload = {
      timestamp: Date.now(),
      weather,
    };
    await this._setString(key, JSON.stringify(payload));
  },

  async getCachedWeather(
    cityKey: string,
    maxAgeMs: number = DEFAULT_WEATHER_TTL_MS,
  ): Promise<WeatherData | null> {
    const key = `${WEATHER_CACHE_PREFIX}${cityKey.toLowerCase().trim()}`;
    const raw = await this._getString(key);
    if (!raw) {
      return null;
    }

    try {
      const {timestamp, weather} = JSON.parse(raw);
      if (Date.now() - timestamp > maxAgeMs) {
        return null;
      }
      return weather;
    } catch {
      return null;
    }
  },

  // ==========================================
  // Chat History Caching
  // ==========================================

  async getCachedChat(tripKey: string): Promise<ChatMessage[]> {
    const key = `${CHAT_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
    const raw = await this._getString(key);
    if (!raw) {
      return [];
    }
    try {
      const messages = JSON.parse(raw);
      return Array.isArray(messages) ? messages : [];
    } catch {
      return [];
    }
  },

  async saveCachedChat(
    tripKey: string,
    messages: ChatMessage[],
  ): Promise<void> {
    const key = `${CHAT_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
    await this._setString(key, JSON.stringify(messages));
  },

  // ==========================================
  // Packing List, Insights & Budget Forecast
  // ==========================================

  async getCachedPackingList(tripKey: string): Promise<PackingItem[] | null> {
    const key = `${PACKING_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
    const raw = await this._getString(key);
    if (!raw) {
      return null;
    }
    try {
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : null;
    } catch {
      return null;
    }
  },

  async saveCachedPackingList(
    tripKey: string,
    items: PackingItem[],
  ): Promise<void> {
    const key = `${PACKING_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
    await this._setString(key, JSON.stringify(items));
  },

  async getCachedTripInsights(
    destination: string,
  ): Promise<DestinationInsights | null> {
    const key = `${INSIGHTS_CACHE_PREFIX}${destination.toLowerCase().trim()}`;
    const raw = await this._getString(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async saveCachedTripInsights(
    destination: string,
    data: DestinationInsights,
  ): Promise<void> {
    const key = `${INSIGHTS_CACHE_PREFIX}${destination.toLowerCase().trim()}`;
    await this._setString(key, JSON.stringify(data));
  },

  async getCachedBudgetForecast(
    tripKey: string,
  ): Promise<BudgetForecast | null> {
    const key = `${BUDGET_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
    const raw = await this._getString(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async saveCachedBudgetForecast(
    tripKey: string,
    data: BudgetForecast,
  ): Promise<void> {
    const key = `${BUDGET_CACHE_PREFIX}${tripKey.toLowerCase().trim()}`;
    await this._setString(key, JSON.stringify(data));
  },

  // ==========================================
  // User Profile & Preferences
  // ==========================================

  async getUserProfile<T>(): Promise<T | null> {
    const raw = await this._getString(USER_PROFILE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async saveUserProfile<T>(profile: T): Promise<void> {
    await this._setString(USER_PROFILE_KEY, JSON.stringify(profile));
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    const val = mmkvInstance.getString(ONBOARDING_KEY);
    if (val === 'true') {
      return true;
    }
    const legacy = await this._getString(ONBOARDING_KEY);
    return legacy === 'true';
  },

  async setCompletedOnboarding(completed: boolean): Promise<void> {
    await this._setString(ONBOARDING_KEY, completed ? 'true' : 'false');
  },

  // ==========================================
  // Security & BYOK Architecture Storage
  // ==========================================

  /**
   * Retrieves user-supplied Gemini API Key (Bring Your Own Key)
   */
  getCustomApiKey(): string | null {
    return mmkvInstance.getString(CUSTOM_GEMINI_KEY) ?? null;
  },

  /**
   * Stores user-supplied Gemini API Key securely in MMKV
   */
  setCustomApiKey(key: string): void {
    mmkvInstance.set(CUSTOM_GEMINI_KEY, key.trim());
  },

  /**
   * Clears custom API Key
   */
  clearCustomApiKey(): void {
    mmkvInstance.delete(CUSTOM_GEMINI_KEY);
  },

  /**
   * Retrieves configured BFF (Backend-For-Frontend) endpoint URL
   */
  getBffUrl(): string | null {
    return mmkvInstance.getString(BFF_URL_KEY) ?? null;
  },

  /**
   * Configures BFF endpoint URL
   */
  setBffUrl(url: string): void {
    mmkvInstance.set(BFF_URL_KEY, url.trim());
  },

  /**
   * Gets current AI operating mode ('bff' | 'client' | 'demo')
   */
  getAiMode(): AiOperatingMode {
    const mode = mmkvInstance.getString(AI_MODE_KEY);
    if (mode === 'bff' || mode === 'client' || mode === 'demo') {
      return mode;
    }
    return 'client';
  },

  /**
   * Sets AI operating mode
   */
  setAiMode(mode: AiOperatingMode): void {
    mmkvInstance.set(AI_MODE_KEY, mode);
  },

  // ==========================================
  // Cache Management
  // ==========================================

  /**
   * Purges temporary weather and chat caches while preserving saved trips.
   */
  async clearTemporaryCaches(): Promise<void> {
    const keys = mmkvInstance.getAllKeys();
    for (const k of keys) {
      if (
        k.startsWith(WEATHER_CACHE_PREFIX) ||
        k.startsWith(CHAT_CACHE_PREFIX)
      ) {
        mmkvInstance.delete(k);
      }
    }
    try {
      const asyncKeys = await AsyncStorage.getAllKeys();
      const tempKeys = asyncKeys.filter(
        k =>
          k.startsWith(WEATHER_CACHE_PREFIX) || k.startsWith(CHAT_CACHE_PREFIX),
      );
      if (tempKeys.length > 0) {
        await Promise.all(tempKeys.map(k => AsyncStorage.removeItem(k)));
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Clears all storage (Useful for tests and full resets).
   */
  async clearAll(): Promise<void> {
    mmkvInstance.clearAll();
    try {
      await AsyncStorage.clear();
    } catch {
      // Ignore
    }
  },

  // ==========================================
  // Micro-Benchmark Suite (MMKV vs. AsyncStorage)
  // ==========================================

  /**
   * Benchmarks read/write throughput between MMKV (JSI) and AsyncStorage (Bridge).
   * Generates verifiable metrics for technical portfolio presentations.
   */
  async benchmarkStorage(
    iterations: number = 50,
  ): Promise<StorageBenchmarkResult> {
    const payload = JSON.stringify({
      id: 'benchmark_trip_id',
      title: 'Benchmark Performance Evaluation',
      data: new Array(50).fill({
        time: '10:00 AM',
        name: 'Benchmark Location',
        category: 'landmark',
        coordinates: {lat: 35.6895, lng: 139.6917},
      }),
    });

    // 1. MMKV Writes
    const startMmkvWrite = Date.now();
    for (let i = 0; i < iterations; i++) {
      mmkvInstance.set(`@bench_mmkv_${i}`, payload);
    }
    const mmkvWriteMs = Math.max(1, Date.now() - startMmkvWrite);

    // 2. MMKV Reads
    const startMmkvRead = Date.now();
    for (let i = 0; i < iterations; i++) {
      mmkvInstance.getString(`@bench_mmkv_${i}`);
    }
    const mmkvReadMs = Math.max(1, Date.now() - startMmkvRead);

    // 3. AsyncStorage Writes
    const startAsyncWrite = Date.now();
    for (let i = 0; i < iterations; i++) {
      await AsyncStorage.setItem(`@bench_async_${i}`, payload);
    }
    const asyncStorageWriteMs = Math.max(1, Date.now() - startAsyncWrite);

    // 4. AsyncStorage Reads
    const startAsyncRead = Date.now();
    for (let i = 0; i < iterations; i++) {
      await AsyncStorage.getItem(`@bench_async_${i}`);
    }
    const asyncStorageReadMs = Math.max(1, Date.now() - startAsyncRead);

    // Clean up benchmark test keys
    for (let i = 0; i < iterations; i++) {
      mmkvInstance.delete(`@bench_mmkv_${i}`);
      try {
        await AsyncStorage.removeItem(`@bench_async_${i}`);
      } catch {
        // Ignore
      }
    }

    return {
      iterations,
      mmkvWriteMs,
      mmkvReadMs,
      asyncStorageWriteMs,
      asyncStorageReadMs,
      writeSpeedup: Number((asyncStorageWriteMs / mmkvWriteMs).toFixed(1)),
      readSpeedup: Number((asyncStorageReadMs / mmkvReadMs).toFixed(1)),
    };
  },
};
