import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Itinerary,
  TripRequest,
  Activity,
  PackingItem,
  DestinationInsights,
  BudgetForecast,
  DayOptimizationPreset,
} from '../types/trip';
import {
  generateItinerary as generateItineraryService,
  suggestAlternativeActivity,
  optimizeDayItinerary,
  generateSmartPackingList,
  generateDestinationInsights,
  generateBudgetForecast,
} from '../services/llmService';
import { WeatherData, getWeather } from '../services/weatherService';
import { storageService } from '../services/storageService';

export interface ItineraryState {
  currentItinerary: Itinerary | null;
  loading: boolean;
  error: string | null;
  weather: WeatherData | null;
  weatherLoading: boolean;
  pivotingActivity: { dayIndex: number; activityIndex: number } | null;
  isOfflineMode: boolean;
  optimizingDay: boolean;
  packingList: PackingItem[] | null;
  packingLoading: boolean;
  insights: DestinationInsights | null;
  insightsLoading: boolean;
  budgetForecast: BudgetForecast | null;
  forecastLoading: boolean;
}

const initialState: ItineraryState = {
  currentItinerary: null,
  loading: false,
  error: null,
  weather: null,
  weatherLoading: false,
  pivotingActivity: null,
  isOfflineMode: false,
  optimizingDay: false,
  packingList: null,
  packingLoading: false,
  insights: null,
  insightsLoading: false,
  budgetForecast: null,
  forecastLoading: false,
};

export const hydrateCachedItinerary = createAsyncThunk(
  'itinerary/hydrateCachedItinerary',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await storageService.getCachedActiveItinerary();
      return cached;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to load cached itinerary',
      );
    }
  },
);

export const fetchItinerary = createAsyncThunk(
  'itinerary/fetchItinerary',
  async (request: TripRequest, { rejectWithValue }) => {
    try {
      const result = await generateItineraryService(request);
      // Auto-cache generated itinerary for offline access
      await storageService.cacheActiveItinerary({
        itinerary: result,
        budget: request.budget,
      });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate itinerary');
    }
  },
);

export const fetchWeatherForTrip = createAsyncThunk(
  'itinerary/fetchWeatherForTrip',
  async (
    params: {
      destination: string;
      coordinates?: { latitude: number; longitude: number };
    },
    { rejectWithValue },
  ) => {
    try {
      // 1. Check local offline cache first (TTL 1 hour)
      const cachedWeather = await storageService.getCachedWeather(
        params.destination,
      );
      if (cachedWeather) {
        return cachedWeather;
      }

      // 2. Fetch fresh weather over network
      const weather = await getWeather(params.destination, params.coordinates);
      if (weather) {
        // Cache freshly fetched weather
        await storageService.cacheWeather(params.destination, weather);
      }
      return weather;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch weather');
    }
  },
);

export interface PivotActivityArgs {
  dayIndex: number;
  activityIndex: number;
  reason?: string;
  fallbackItinerary?: Itinerary;
}

export const pivotActivity = createAsyncThunk(
  'itinerary/pivotActivity',
  async (args: PivotActivityArgs, { getState, rejectWithValue }) => {
    try {
      const state = getState() as {
        itinerary: ItineraryState;
        trip: { budget: 'low' | 'mid' | 'high' };
      };
      const currentItinerary =
        state.itinerary.currentItinerary || args.fallbackItinerary;
      const weather = state.itinerary.weather;
      const budget = state.trip?.budget || 'mid';

      if (!currentItinerary || !currentItinerary.days[args.dayIndex]) {
        throw new Error('Itinerary or day schedule not found');
      }

      const day = currentItinerary.days[args.dayIndex];
      const activityToReplace = day.activities[args.activityIndex];
      if (!activityToReplace) {
        throw new Error('Activity to replace not found');
      }

      const newActivity = await suggestAlternativeActivity({
        destination: currentItinerary.destination,
        day: day.day,
        activityToReplace,
        currentDayActivities: day.activities,
        weatherCondition: weather?.condition,
        reason: args.reason,
        budget,
      });

      return {
        dayIndex: args.dayIndex,
        activityIndex: args.activityIndex,
        activity: newActivity,
        itineraryToInit: !state.itinerary.currentItinerary
          ? currentItinerary
          : undefined,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to pivot activity');
    }
  },
);

export interface OptimizeDayArgs {
  dayIndex: number;
  preset?: DayOptimizationPreset;
  customInstruction?: string;
  fallbackItinerary?: Itinerary;
}

export const optimizeDay = createAsyncThunk(
  'itinerary/optimizeDay',
  async (args: OptimizeDayArgs, { getState, rejectWithValue }) => {
    try {
      const state = getState() as {
        itinerary: ItineraryState;
        trip: { budget: 'low' | 'mid' | 'high' };
      };
      const currentItinerary =
        state.itinerary.currentItinerary || args.fallbackItinerary;
      const weather = state.itinerary.weather;
      const budget = state.trip?.budget || 'mid';

      if (!currentItinerary || !currentItinerary.days[args.dayIndex]) {
        throw new Error('Itinerary or day schedule not found');
      }

      const day = currentItinerary.days[args.dayIndex];
      const newActivities = await optimizeDayItinerary({
        destination: currentItinerary.destination,
        dayNumber: day.day,
        existingActivities: day.activities,
        preset: args.preset,
        customInstruction: args.customInstruction,
        weatherCondition: weather?.condition,
        budget,
      });

      return {
        dayIndex: args.dayIndex,
        activities: newActivities,
        itineraryToInit: !state.itinerary.currentItinerary
          ? currentItinerary
          : undefined,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to optimize day schedule',
      );
    }
  },
);

export const fetchPackingList = createAsyncThunk(
  'itinerary/fetchPackingList',
  async (
    params: {
      destination: string;
      daysCount: number;
      weatherSummary?: string;
      activities?: Activity[];
      forceRefresh?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      if (!params.forceRefresh) {
        const cached = await storageService.getCachedPackingList(
          params.destination,
        );
        if (cached && cached.length > 0) {
          return cached;
        }
      }

      const items = await generateSmartPackingList({
        destination: params.destination,
        daysCount: params.daysCount,
        weatherSummary: params.weatherSummary,
        activities: params.activities,
      });

      await storageService.saveCachedPackingList(params.destination, items);
      return items;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to generate packing list',
      );
    }
  },
);

export const fetchDestinationInsights = createAsyncThunk(
  'itinerary/fetchDestinationInsights',
  async (
    params: { destination: string; forceRefresh?: boolean },
    { rejectWithValue },
  ) => {
    try {
      if (!params.forceRefresh) {
        const cached = await storageService.getCachedTripInsights(
          params.destination,
        );
        if (cached) {
          return cached;
        }
      }

      const insights = await generateDestinationInsights(params.destination);
      await storageService.saveCachedTripInsights(params.destination, insights);
      return insights;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to load destination guide',
      );
    }
  },
);

export const fetchBudgetForecast = createAsyncThunk(
  'itinerary/fetchBudgetForecast',
  async (
    params: {
      destination: string;
      daysCount: number;
      budgetTier: 'low' | 'mid' | 'high';
      forceRefresh?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      if (!params.forceRefresh) {
        const cached = await storageService.getCachedBudgetForecast(
          params.destination,
        );
        if (cached) {
          return cached;
        }
      }

      const forecast = await generateBudgetForecast(
        params.destination,
        params.daysCount,
        params.budgetTier,
      );
      await storageService.saveCachedBudgetForecast(
        params.destination,
        forecast,
      );
      return forecast;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load budget forecast');
    }
  },
);

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    setItinerary: (state, action: PayloadAction<Itinerary>) => {
      state.currentItinerary = action.payload;
      storageService.cacheActiveItinerary({
        itinerary: action.payload,
        weather: state.weather,
      });
    },
    setWeather: (state, action: PayloadAction<WeatherData | null>) => {
      state.weather = action.payload;
    },
    setIsOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOfflineMode = action.payload;
    },
    togglePackingItem: (
      state,
      action: PayloadAction<{ id: string; destination: string }>,
    ) => {
      if (state.packingList) {
        const item = state.packingList.find(i => i.id === action.payload.id);
        if (item) {
          item.packed = !item.packed;
          storageService.saveCachedPackingList(
            action.payload.destination,
            state.packingList,
          );
        }
      }
    },
    setPackingList: (state, action: PayloadAction<PackingItem[]>) => {
      state.packingList = action.payload;
    },
    clearItinerary: state => {
      state.currentItinerary = null;
      state.error = null;
      state.weather = null;
      state.pivotingActivity = null;
      state.packingList = null;
      state.insights = null;
      state.budgetForecast = null;
    },
  },
  extraReducers: builder => {
    builder
      // Hydrate Cached Itinerary
      .addCase(hydrateCachedItinerary.fulfilled, (state, action) => {
        if (action.payload?.itinerary && !state.currentItinerary) {
          state.currentItinerary = action.payload.itinerary;
          if (action.payload.weather) {
            state.weather = action.payload.weather;
          }
        }
      })
      // Fetch Itinerary
      .addCase(fetchItinerary.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItinerary.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItinerary = action.payload;
      })
      .addCase(fetchItinerary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Weather
      .addCase(fetchWeatherForTrip.pending, state => {
        state.weatherLoading = true;
      })
      .addCase(fetchWeatherForTrip.fulfilled, (state, action) => {
        state.weatherLoading = false;
        state.weather = action.payload;
      })
      .addCase(fetchWeatherForTrip.rejected, state => {
        state.weatherLoading = false;
      })
      // Pivot Activity
      .addCase(pivotActivity.pending, (state, action) => {
        state.pivotingActivity = {
          dayIndex: action.meta.arg.dayIndex,
          activityIndex: action.meta.arg.activityIndex,
        };
      })
      .addCase(pivotActivity.fulfilled, (state, action) => {
        state.pivotingActivity = null;
        const { dayIndex, activityIndex, activity, itineraryToInit } =
          action.payload;

        if (itineraryToInit && !state.currentItinerary) {
          state.currentItinerary = JSON.parse(JSON.stringify(itineraryToInit));
        }

        if (state.currentItinerary && state.currentItinerary.days[dayIndex]) {
          state.currentItinerary.days[dayIndex].activities[activityIndex] =
            activity;

          // Re-cache updated itinerary with swapped activity
          storageService.cacheActiveItinerary({
            itinerary: state.currentItinerary,
            weather: state.weather,
          });
        }
      })
      .addCase(pivotActivity.rejected, state => {
        state.pivotingActivity = null;
      })
      // Optimize Day
      .addCase(optimizeDay.pending, state => {
        state.optimizingDay = true;
        state.error = null;
      })
      .addCase(optimizeDay.fulfilled, (state, action) => {
        state.optimizingDay = false;
        const { dayIndex, activities, itineraryToInit } = action.payload;

        if (itineraryToInit && !state.currentItinerary) {
          state.currentItinerary = JSON.parse(JSON.stringify(itineraryToInit));
        }

        if (state.currentItinerary && state.currentItinerary.days[dayIndex]) {
          state.currentItinerary.days[dayIndex].activities = activities;

          storageService.cacheActiveItinerary({
            itinerary: state.currentItinerary,
            weather: state.weather,
          });
        }
      })
      .addCase(optimizeDay.rejected, (state, action) => {
        state.optimizingDay = false;
        state.error = action.payload as string;
      })
      // Packing List
      .addCase(fetchPackingList.pending, state => {
        state.packingLoading = true;
      })
      .addCase(fetchPackingList.fulfilled, (state, action) => {
        state.packingLoading = false;
        state.packingList = action.payload;
      })
      .addCase(fetchPackingList.rejected, state => {
        state.packingLoading = false;
      })
      // Destination Insights
      .addCase(fetchDestinationInsights.pending, state => {
        state.insightsLoading = true;
      })
      .addCase(fetchDestinationInsights.fulfilled, (state, action) => {
        state.insightsLoading = false;
        state.insights = action.payload;
      })
      .addCase(fetchDestinationInsights.rejected, state => {
        state.insightsLoading = false;
      })
      // Budget Forecast
      .addCase(fetchBudgetForecast.pending, state => {
        state.forecastLoading = true;
      })
      .addCase(fetchBudgetForecast.fulfilled, (state, action) => {
        state.forecastLoading = false;
        state.budgetForecast = action.payload;
      })
      .addCase(fetchBudgetForecast.rejected, state => {
        state.forecastLoading = false;
      });
  },
});

export const {
  setItinerary,
  setWeather,
  setIsOfflineMode,
  togglePackingItem,
  setPackingList,
  clearItinerary,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;
