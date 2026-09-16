import {
  sanitizeCityName,
  getWeatherTip,
  getWeather,
} from '../../src/services/weatherService';

jest.mock('@env', () => ({
  OPENWEATHERMAP_API_KEY: 'test-openweather-key',
}));

describe('weatherService', () => {
  describe('sanitizeCityName', () => {
    it('extracts primary city name from comma-separated location', () => {
      expect(sanitizeCityName('Paris, Île-de-France, France')).toBe('Paris');
      expect(sanitizeCityName('Tokyo, Japan')).toBe('Tokyo');
      expect(sanitizeCityName('New York, NY, USA')).toBe('New York');
    });

    it('handles single city name', () => {
      expect(sanitizeCityName('Lisbon')).toBe('Lisbon');
    });

    it('returns empty string when input is falsy', () => {
      expect(sanitizeCityName('')).toBe('');
      expect(sanitizeCityName(null as any)).toBe('');
    });
  });

  describe('getWeatherTip', () => {
    it('returns rain advice when condition contains rain or drizzle', () => {
      const tip = getWeatherTip('Light Rain', 15);
      expect(tip).toContain('Showers expected');

      const drizzleTip = getWeatherTip('Drizzle', 18);
      expect(drizzleTip).toContain('Showers expected');
    });

    it('returns thunderstorm advice for storms', () => {
      const tip = getWeatherTip('Thunderstorm', 22);
      expect(tip).toContain('Storms in the area');
    });

    it('returns snow advice for snowy weather', () => {
      const tip = getWeatherTip('Snow', -2);
      expect(tip).toContain('Snowy weather');
    });

    it('returns hot sun advice when clear and temp > 28', () => {
      const tip = getWeatherTip('Clear', 32);
      expect(tip).toContain('Sunny & warm (32°C)');
      expect(tip).toContain('stay hydrated');
    });

    it('returns pleasant outdoor advice when clear and temp <= 28', () => {
      const tip = getWeatherTip('Clear', 22);
      expect(tip).toContain('Pleasant & clear (22°C)');
      expect(tip).toContain('outdoor walking');
    });

    it('returns overcast advice for cloudy days', () => {
      const tip = getWeatherTip('Scattered Clouds', 19);
      expect(tip).toContain('Mild overcast (19°C)');
    });

    it('returns fallback advice for unrecognized conditions', () => {
      const tip = getWeatherTip('Fog', 12);
      expect(tip).toContain('Fog (12°C)');
    });
  });

  describe('getWeather API integration', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('fetches and parses OpenWeatherMap data successfully', async () => {
      const mockApiResponse = {
        main: {temp: 24.3, humidity: 55},
        weather: [{main: 'Clear', description: 'clear sky', icon: '01d'}],
        wind: {speed: 4.1},
        name: 'Kyoto',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await getWeather('Kyoto, Japan', {
        latitude: 35.0116,
        longitude: 135.7681,
      });
      expect(result).not.toBeNull();
      expect(result?.temp).toBe(24);
      expect(result?.condition).toBe('Clear');
      expect(result?.cityName).toBe('Kyoto');
      expect(result?.humidity).toBe(55);
    });

    it('handles HTTP error responses gracefully by returning null', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await getWeather('NonExistentCity12345');
      expect(result).toBeNull();
    });

    it('handles network exceptions without crashing', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Network connection timeout'));

      const result = await getWeather('Rome, Italy');
      expect(result).toBeNull();
    });
  });
});
