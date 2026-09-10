import {OPENWEATHERMAP_API_KEY} from '@env';

export interface WeatherData {
  temp: number; // in Celsius (rounded)
  condition: string; // e.g., "Clear", "Rain", "Clouds", "Snow", "Thunderstorm"
  description: string; // e.g., "light rain"
  humidity: number; // percentage
  windSpeed: number; // m/s
  icon: string; // OpenWeatherMap icon code e.g. "01d"
  cityName: string;
}

/**
 * Sanitizes destination string (e.g. "Paris, Île-de-France, France" -> "Paris")
 * to improve OpenWeatherMap city query matching.
 */
export const sanitizeCityName = (destination: string): string => {
  if (!destination) {
    return '';
  }
  // Extract the primary city name before commas
  const parts = destination.split(',');
  return parts[0].trim();
};

/**
 * Fetches current weather from OpenWeatherMap API using coordinates (priority)
 * or sanitized destination city name.
 */
export const getWeather = async (
  destination: string,
  coordinates?: {latitude: number; longitude: number},
): Promise<WeatherData | null> => {
  try {
    if (!OPENWEATHERMAP_API_KEY) {
      console.warn('OPENWEATHERMAP_API_KEY is not defined in .env');
      return null;
    }

    let url: string;
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`;
    } else {
      const cleanCity = sanitizeCityName(destination);
      if (!cleanCity) {
        return null;
      }
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        cleanCity,
      )}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      // If coordinates query failed or city not found, try city name fallback if we haven't already
      if (coordinates && destination) {
        const cleanCity = sanitizeCityName(destination);
        if (cleanCity) {
          const fallbackUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            cleanCity,
          )}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`;
          const fallbackResponse = await fetch(fallbackUrl);
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            return parseWeatherData(data, destination);
          }
        }
      }
      console.warn(
        `OpenWeatherMap returned status ${response.status}: ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    return parseWeatherData(data, destination);
  } catch (error) {
    console.warn('Failed to fetch weather data:', error);
    return null;
  }
};

const parseWeatherData = (data: any, fallbackCity: string): WeatherData => {
  const weatherItem =
    data.weather && data.weather.length > 0 ? data.weather[0] : null;
  return {
    temp: Math.round(data.main?.temp ?? 20),
    condition: weatherItem?.main || 'Clear',
    description: weatherItem?.description || 'clear sky',
    humidity: data.main?.humidity ?? 50,
    windSpeed: Math.round(data.wind?.speed ?? 0),
    icon: weatherItem?.icon || '01d',
    cityName: data.name || sanitizeCityName(fallbackCity) || 'Destination',
  };
};

/**
 * Provides a dynamic smart travel tip based on temperature and weather condition.
 */
export const getWeatherTip = (condition: string, temp: number): string => {
  const cond = condition.toLowerCase();
  if (cond.includes('rain') || cond.includes('drizzle')) {
    return 'Showers expected — tap Swap on outdoor stops for indoor options!';
  }
  if (cond.includes('thunderstorm')) {
    return 'Storms in the area — great time for museums & indoor dining.';
  }
  if (cond.includes('snow')) {
    return 'Snowy weather — bundle up and discover cozy local cafes.';
  }
  if (cond.includes('clear')) {
    if (temp > 28) {
      return `Sunny & warm (${temp}°C) — stay hydrated and seek shade in afternoon.`;
    }
    return `Pleasant & clear (${temp}°C) — perfect for outdoor walking & sightseeing.`;
  }
  if (cond.includes('cloud')) {
    return `Mild overcast (${temp}°C) — great walking weather without harsh sun.`;
  }
  return `${condition} (${temp}°C) — check your schedule for ideal stops.`;
};
