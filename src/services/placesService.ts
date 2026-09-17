export interface PlaceSuggestion {
  description: string;
  placeId: string;
}

// In-memory cache to prevent hitting OpenStreetMap rate limits (1 req/sec)
const citySuggestionsCache = new Map<
  string,
  {data: PlaceSuggestion[]; timestamp: number}
>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export const clearCitySuggestionsCache = (): void => {
  citySuggestionsCache.clear();
};

export const fetchCitySuggestions = async (
  input: string,
): Promise<PlaceSuggestion[]> => {
  if (!input || input.trim().length < 2) {
    return [];
  }

  const normalizedKey = input.trim().toLowerCase();

  const cached = citySuggestionsCache.get(normalizedKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // Using OpenStreetMap's Nominatim API - Completely Free!
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      input.trim(),
    )}&format=json&limit=5`;

    // Nominatim requires a valid User-Agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ItinerAI/1.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.warn('Nominatim API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      const results: PlaceSuggestion[] = data.map((p: any) => ({
        description: p.display_name,
        placeId: p.place_id ? p.place_id.toString() : Math.random().toString(),
      }));

      citySuggestionsCache.set(normalizedKey, {
        data: results,
        timestamp: Date.now(),
      });

      return results;
    }

    return [];
  } catch (error) {
    console.error('Error fetching city suggestions from OpenStreetMap:', error);
    return [];
  }
};
