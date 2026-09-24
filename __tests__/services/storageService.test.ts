import {storageService, SavedTrip} from '../../src/services/storageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WeatherData} from '../../src/services/weatherService';
import {
  Itinerary,
  PackingItem,
  DestinationInsights,
  BudgetForecast,
} from '../../src/types/trip';

describe('storageService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const mockItinerary: Itinerary = {
    destination: 'Tokyo, Japan',
    days: [
      {
        day: 1,
        activities: [
          {
            time: '09:00 AM',
            name: 'Senso-ji Temple',
            description: 'Historic Buddhist temple in Asakusa.',
            location: 'Asakusa, Tokyo',
            category: 'landmark',
            coordinates: {latitude: 35.7148, longitude: 139.7967},
          },
        ],
      },
    ],
  };

  const mockTrip: SavedTrip = {
    id: 'trip_123',
    title: 'Tokyo Explorer',
    destination: 'Tokyo, Japan',
    dates: 'Apr 10 - Apr 15',
    duration: '5 days',
    status: 'UPCOMING',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084',
    itinerary: mockItinerary,
    savedAt: 1712000000000,
    budget: 'mid',
  };

  describe('Saved Trips CRUD', () => {
    it('returns empty array when no saved trips exist', async () => {
      const trips = await storageService.getSavedTrips();
      expect(trips).toEqual([]);
    });

    it('saves a new trip and retrieves it', async () => {
      await storageService.saveTrip(mockTrip);
      const trips = await storageService.getSavedTrips();
      expect(trips).toHaveLength(1);
      expect(trips[0].id).toBe('trip_123');
      expect(trips[0].destination).toBe('Tokyo, Japan');
    });

    it('updates an existing trip when ID matches', async () => {
      await storageService.saveTrip(mockTrip);
      const updatedTrip: SavedTrip = {
        ...mockTrip,
        title: 'Updated Tokyo Trip',
        status: 'COMPLETED',
      };
      await storageService.saveTrip(updatedTrip);

      const trips = await storageService.getSavedTrips();
      expect(trips).toHaveLength(1);
      expect(trips[0].title).toBe('Updated Tokyo Trip');
      expect(trips[0].status).toBe('COMPLETED');
    });

    it('deletes a trip by ID', async () => {
      await storageService.saveTrip(mockTrip);
      let trips = await storageService.getSavedTrips();
      expect(trips).toHaveLength(1);

      await storageService.deleteTrip('trip_123');
      trips = await storageService.getSavedTrips();
      expect(trips).toHaveLength(0);
    });

    it('updates trip status directly', async () => {
      await storageService.saveTrip(mockTrip);
      await storageService.updateTripStatus('trip_123', 'COMPLETED');

      const trips = await storageService.getSavedTrips();
      expect(trips[0].status).toBe('COMPLETED');
    });

    it('verifies if a trip is already saved (case-insensitive)', async () => {
      await storageService.saveTrip(mockTrip);
      const isSaved = await storageService.isTripSaved('tokyo, japan');
      expect(isSaved).toBe(true);

      const notSaved = await storageService.isTripSaved('Paris, France');
      expect(notSaved).toBe(false);
    });
  });

  describe('Active Itinerary Persistence', () => {
    it('caches and hydrates the active itinerary', async () => {
      await storageService.cacheActiveItinerary({
        itinerary: mockItinerary,
        budget: 'high',
      });

      const cached = await storageService.getCachedActiveItinerary();
      expect(cached).not.toBeNull();
      expect(cached?.itinerary.destination).toBe('Tokyo, Japan');
      expect(cached?.budget).toBe('high');
    });

    it('returns null when no active itinerary is cached', async () => {
      const cached = await storageService.getCachedActiveItinerary();
      expect(cached).toBeNull();
    });
  });

  describe('Weather Caching with TTL Expiration', () => {
    const mockWeather: WeatherData = {
      cityName: 'Tokyo',
      temp: 21,
      condition: 'Clear',
      description: 'clear sky',
      icon: '01d',
      humidity: 45,
      windSpeed: 3.2,
    };

    it('caches and retrieves weather within TTL', async () => {
      await storageService.cacheWeather('Tokyo', mockWeather);
      const cached = await storageService.getCachedWeather('Tokyo', 60000); // 1 minute TTL
      expect(cached).toEqual(mockWeather);
    });

    it('returns null when weather cache exceeds TTL', async () => {
      // Manually store an expired weather payload
      const expiredPayload = {
        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
        weather: mockWeather,
      };
      await AsyncStorage.setItem(
        '@itinerai_weather_cache_tokyo',
        JSON.stringify(expiredPayload),
      );

      const cached = await storageService.getCachedWeather('Tokyo', 3600000); // 1 hour TTL
      expect(cached).toBeNull();
    });
  });

  describe('Packing List, Insights & Budget Cache', () => {
    it('persists and retrieves packing lists', async () => {
      const mockItems: PackingItem[] = [
        {id: 'p1', name: 'Passport', category: 'Documents', packed: true},
        {
          id: 'p2',
          name: 'Universal Adapter',
          category: 'Tech & Adapters',
          packed: false,
        },
      ];
      await storageService.saveCachedPackingList('Tokyo', mockItems);
      const retrieved = await storageService.getCachedPackingList('Tokyo');
      expect(retrieved).toEqual(mockItems);
    });

    it('persists and retrieves cultural destination insights', async () => {
      const mockInsights: DestinationInsights = {
        tippingCulture: 'No tipping customary.',
        transitTips: ['Use Suica card.'],
        culturalEtiquette: {
          dos: ['Bow slightly'],
          donts: ['Eat while walking'],
        },
        emergencyNumbers: {police: '110', ambulance: '119', general: '110'},
        essentialPhrases: [{phrase: 'Arigato', translation: 'Thank you'}],
      };
      await storageService.saveCachedTripInsights('Tokyo', mockInsights);
      const retrieved = await storageService.getCachedTripInsights('Tokyo');
      expect(retrieved).toEqual(mockInsights);
    });

    it('persists and retrieves budget forecast', async () => {
      const mockBudget: BudgetForecast = {
        totalEstimated: '$1,500',
        currency: 'USD',
        dailyAverage: '$300',
        categories: [
          {
            category: 'Accommodation',
            estimated: '$800',
            percentage: 53,
            tip: 'Book early',
          },
        ],
        moneySavingTips: ['Buy convenience store meals'],
      };
      await storageService.saveCachedBudgetForecast('Tokyo', mockBudget);
      const retrieved = await storageService.getCachedBudgetForecast('Tokyo');
      expect(retrieved).toEqual(mockBudget);
    });
  });

  describe('MMKV Synchronous Performance & JSI Access', () => {
    it('synchronously reads saved trips without promise overhead', async () => {
      await storageService.saveTrip(mockTrip);
      const syncTrips = storageService.getSavedTripsSync();
      expect(syncTrips).toHaveLength(1);
      expect(syncTrips[0].id).toBe('trip_123');
    });

    it('synchronously checks if trip is saved', async () => {
      await storageService.saveTrip(mockTrip);
      expect(storageService.isTripSavedSync('Tokyo, Japan')).toBe(true);
      expect(storageService.isTripSavedSync('Rome, Italy')).toBe(false);
    });

    it('synchronously retrieves active itinerary', async () => {
      await storageService.cacheActiveItinerary({
        itinerary: mockItinerary,
        budget: 'mid',
      });
      const syncActive = storageService.getCachedActiveItinerarySync();
      expect(syncActive?.itinerary.destination).toBe('Tokyo, Japan');
    });
  });

  describe('Security & BYOK Architecture Storage', () => {
    it('stores and retrieves custom user Gemini API Key', () => {
      expect(storageService.getCustomApiKey()).toBeNull();
      storageService.setCustomApiKey('custom-gemini-ai-key-12345');
      expect(storageService.getCustomApiKey()).toBe(
        'custom-gemini-ai-key-12345',
      );
      storageService.clearCustomApiKey();
      expect(storageService.getCustomApiKey()).toBeNull();
    });

    it('stores and retrieves BFF URL and AI Operating Mode', () => {
      expect(storageService.getAiMode()).toBe('client');
      storageService.setBffUrl('https://itinerai-bff.example.workers.dev');
      expect(storageService.getBffUrl()).toBe(
        'https://itinerai-bff.example.workers.dev',
      );
      storageService.setAiMode('bff');
      expect(storageService.getAiMode()).toBe('bff');
      storageService.setAiMode('demo');
      expect(storageService.getAiMode()).toBe('demo');
    });
  });

  describe('Storage Benchmark & Cache Management', () => {
    it('executes storage benchmark comparison between MMKV and AsyncStorage', async () => {
      const result = await storageService.benchmarkStorage(5);
      expect(result.iterations).toBe(5);
      expect(result.mmkvWriteMs).toBeGreaterThanOrEqual(1);
      expect(result.asyncStorageWriteMs).toBeGreaterThanOrEqual(1);
    });

    it('clears temporary weather and chat caches while keeping saved trips', async () => {
      await storageService.saveTrip(mockTrip);
      await storageService.cacheWeather('Tokyo', {
        cityName: 'Tokyo',
        temp: 20,
        condition: 'Clear',
        description: 'sunny',
        icon: '01d',
        humidity: 50,
        windSpeed: 2.0,
      });
      await storageService.saveCachedChat('Tokyo', [
        {
          id: 'c1',
          role: 'user',
          text: 'Where to eat ramen?',
          timestamp: 12345,
        },
      ]);

      await storageService.clearTemporaryCaches();

      const remainingTrips = await storageService.getSavedTrips();
      expect(remainingTrips).toHaveLength(1);

      const clearedWeather = await storageService.getCachedWeather('Tokyo');
      expect(clearedWeather).toBeNull();

      const clearedChat = await storageService.getCachedChat('Tokyo');
      expect(clearedChat).toEqual([]);
    });
  });
});
