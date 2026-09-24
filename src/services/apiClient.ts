import {BFF_BASE_URL, APP_CLIENT_SECRET, GEMINI_API_KEY} from '@env';
import {storageService, AiOperatingMode} from './storageService';
import {TripRequest, Itinerary} from '../types/trip';
import {WeatherData} from './weatherService';

export interface BffHealthStatus {
  healthy: boolean;
  service?: string;
  uptimeSeconds?: number;
  rateLimiterActive?: boolean;
}

/**
 * API Client Orchestrator
 *
 * Implements a dual-mode communication layer:
 * 1. Backend-For-Frontend (BFF) Mode: Production-grade security route isolating API keys on the server.
 * 2. Client SDK Mode: Direct on-device inference with support for Bring-Your-Own-Key (BYOK).
 */
export const apiClient = {
  /**
   * Resolves the active BFF base URL (Storage override or .env default)
   */
  getBffBaseUrl(): string {
    const configuredUrl = storageService.getBffUrl();
    if (configuredUrl && configuredUrl.trim()) {
      return configuredUrl.trim().replace(/\/$/, '');
    }
    return (BFF_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
  },

  /**
   * Resolves the active AI execution mode
   */
  getOperatingMode(): AiOperatingMode {
    return storageService.getAiMode();
  },

  /**
   * Resolves the active Gemini API key (custom BYOK from encrypted MMKV or default .env)
   */
  getEffectiveGeminiKey(): string {
    const customKey = storageService.getCustomApiKey();
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
    return GEMINI_API_KEY || '';
  },

  /**
   * Checks whether the app has a valid Gemini key (either custom or env)
   */
  hasClientApiKey(): boolean {
    return Boolean(this.getEffectiveGeminiKey());
  },

  /**
   * Checks health and connectivity of the configured BFF proxy
   */
  async checkBffHealth(): Promise<BffHealthStatus> {
    try {
      const baseUrl = this.getBffBaseUrl();
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-App-Client-Token':
            APP_CLIENT_SECRET || 'itinerai-secure-mobile-token-2026',
        },
      });

      if (!response.ok) {
        return {healthy: false};
      }

      const json = await response.json();
      return {
        healthy: json.status === 'healthy',
        service: json.service,
        uptimeSeconds: json.uptimeSeconds,
        rateLimiterActive: json.security?.rateLimiterActive,
      };
    } catch {
      return {healthy: false};
    }
  },

  /**
   * Generates itinerary through the Backend-For-Frontend proxy
   */
  async generateItineraryViaBff(request: TripRequest): Promise<Itinerary> {
    const baseUrl = this.getBffBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/generate-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-App-Client-Token':
          APP_CLIENT_SECRET || 'itinerai-secure-mobile-token-2026',
      },
      body: JSON.stringify({
        destination: request.destination,
        days: request.days,
        budget: request.budget,
        interests: request.interests,
        advanced: request.advanced,
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(
        errorJson?.message || `BFF returned HTTP ${response.status}`,
      );
    }

    const payload = await response.json();
    if (!payload?.data) {
      throw new Error('Invalid response structure returned by BFF');
    }
    return payload.data as Itinerary;
  },

  /**
   * Fetches weather through the BFF edge proxy (with server-side TTL caching)
   */
  async fetchWeatherViaBff(cityName: string): Promise<WeatherData> {
    const baseUrl = this.getBffBaseUrl();
    const url = `${baseUrl}/api/v1/weather?city=${encodeURIComponent(
      cityName,
    )}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-App-Client-Token':
          APP_CLIENT_SECRET || 'itinerai-secure-mobile-token-2026',
      },
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(
        errorJson?.message ||
          `BFF Weather API returned HTTP ${response.status}`,
      );
    }

    const payload = await response.json();
    if (!payload?.data) {
      throw new Error('Invalid weather structure from BFF');
    }
    return payload.data as WeatherData;
  },
};
