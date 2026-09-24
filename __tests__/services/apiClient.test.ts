import {apiClient} from '../../src/services/apiClient';
import {storageService} from '../../src/services/storageService';
import {TripRequest} from '../../src/types/trip';

describe('apiClient (BFF & BYOK Security Architecture)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    storageService.clearCustomApiKey();
    storageService.setAiMode('client');
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Key & Operating Mode Resolution', () => {
    it('defaults to client mode and returns env key when no custom key is provided', () => {
      expect(apiClient.getOperatingMode()).toBe('client');
      expect(apiClient.hasClientApiKey()).toBe(true);
    });

    it('prioritizes user-provided BYOK key stored in MMKV over .env', () => {
      storageService.setCustomApiKey('custom-gemini-key-999');
      expect(apiClient.getEffectiveGeminiKey()).toBe('custom-gemini-key-999');
      storageService.clearCustomApiKey();
      expect(apiClient.getEffectiveGeminiKey()).not.toBe(
        'custom-gemini-key-999',
      );
      expect(apiClient.getEffectiveGeminiKey()).toBeTruthy();
    });

    it('updates operating mode between bff, client, and demo', () => {
      storageService.setAiMode('bff');
      expect(apiClient.getOperatingMode()).toBe('bff');
      storageService.setAiMode('demo');
      expect(apiClient.getOperatingMode()).toBe('demo');
    });
  });

  describe('BFF Health Check', () => {
    it('returns healthy status when BFF proxy responds with 200', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'healthy',
          service: 'ItinerAI-Backend-For-Frontend-Proxy',
          uptimeSeconds: 120,
          security: {rateLimiterActive: true},
        }),
      } as any);

      const status = await apiClient.checkBffHealth();
      expect(status.healthy).toBe(true);
      expect(status.service).toBe('ItinerAI-Backend-For-Frontend-Proxy');
      expect(status.rateLimiterActive).toBe(true);
    });

    it('handles BFF connection error gracefully', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'));
      const status = await apiClient.checkBffHealth();
      expect(status.healthy).toBe(false);
    });
  });

  describe('BFF Proxy Requests', () => {
    const mockTripRequest: TripRequest = {
      destination: 'Kyoto, Japan',
      days: 3,
      budget: 'mid',
      interests: ['landmarks', 'food'],
    };

    it('successfully calls generateItineraryViaBff with client attestation token', async () => {
      const mockItinerary = {
        destination: 'Kyoto, Japan',
        days: [{day: 1, activities: []}],
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({data: mockItinerary}),
      } as any);

      const result = await apiClient.generateItineraryViaBff(mockTripRequest);
      expect(result.destination).toBe('Kyoto, Japan');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/generate-itinerary'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-App-Client-Token': expect.any(String),
          }),
        }),
      );
    });

    it('throws informative error when BFF returns HTTP error', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({message: 'Rate limit exceeded on BFF'}),
      } as any);

      await expect(
        apiClient.generateItineraryViaBff(mockTripRequest),
      ).rejects.toThrow('Rate limit exceeded on BFF');
    });

    it('fetches weather through BFF proxy endpoint', async () => {
      const mockWeather = {
        cityName: 'Kyoto',
        temp: 18,
        condition: 'Clear',
        description: 'clear sky',
        icon: '01d',
        humidity: 50,
        windSpeed: 2.1,
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({data: mockWeather}),
      } as any);

      const weather = await apiClient.fetchWeatherViaBff('Kyoto');
      expect(weather.cityName).toBe('Kyoto');
      expect(weather.temp).toBe(18);
    });
  });
});
