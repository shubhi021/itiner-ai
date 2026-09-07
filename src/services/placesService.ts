export interface PlaceSuggestion {
  description: string;
  placeId: string;
}

export const fetchCitySuggestions = async (
  input: string,
): Promise<PlaceSuggestion[]> => {
  if (!input || input.length < 2) return [];

  try {
    // Using OpenStreetMap's Nominatim API - Completely Free!
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      input,
    )}&format=json&limit=5`;
    
    // Nominatim requires a valid User-Agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ItinerAI/1.0',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    if (!response.ok) {
      console.warn('Nominatim API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data.map((p: any) => ({
        description: p.display_name,
        placeId: p.place_id ? p.place_id.toString() : Math.random().toString(),
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching city suggestions from OpenStreetMap:', error);
    return [];
  }
};
