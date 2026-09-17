import {
  fetchCitySuggestions,
  clearCitySuggestionsCache,
  PlaceSuggestion,
} from '../../src/services/placesService';

describe('placesService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearCitySuggestionsCache();
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns empty array when input is less than 2 characters', async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    expect(await fetchCitySuggestions('')).toEqual([]);
    expect(await fetchCitySuggestions('a')).toEqual([]);
    expect(await fetchCitySuggestions('   ')).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches and maps place suggestions from OpenStreetMap Nominatim correctly', async () => {
    const mockNominatimData = [
      {
        place_id: 12345,
        display_name:
          'Lisbon, Grande Lisboa, Área Metropolitana de Lisboa, Portugal',
      },
      {
        place_id: 67890,
        display_name: 'Lisbon, Lisbon County, Maine, USA',
      },
    ];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockNominatimData,
    });

    const results = await fetchCitySuggestions('Lisbon');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://nominatim.openstreetmap.org/search?q=Lisbon',
      ),
      expect.objectContaining({
        headers: {
          'User-Agent': 'ItinerAI/1.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }),
    );

    expect(results).toEqual<PlaceSuggestion[]>([
      {
        placeId: '12345',
        description:
          'Lisbon, Grande Lisboa, Área Metropolitana de Lisboa, Portugal',
      },
      {
        placeId: '67890',
        description: 'Lisbon, Lisbon County, Maine, USA',
      },
    ]);
  });

  it('handles API error responses gracefully by returning empty array', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const results = await fetchCitySuggestions('Tokyo');
    expect(results).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Nominatim API error:', 500);

    consoleSpy.mockRestore();
  });

  it('handles network / fetch failure gracefully by returning empty array', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network offline'));

    const results = await fetchCitySuggestions('Rome');
    expect(results).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('returns cached results without making extra fetch requests', async () => {
    const mockData = [
      {
        place_id: 999,
        display_name: 'Paris, France',
      },
    ];

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    global.fetch = mockFetch;

    // First call -> network request
    const firstCall = await fetchCitySuggestions('Paris');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(firstCall[0].description).toBe('Paris, France');

    // Second call with same city (case-insensitive) -> cache hit
    const secondCall = await fetchCitySuggestions('  paris  ');
    expect(mockFetch).toHaveBeenCalledTimes(1); // Not called again!
    expect(secondCall).toEqual(firstCall);

    // After clearing cache -> fetches again
    clearCitySuggestionsCache();
    await fetchCitySuggestions('Paris');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
