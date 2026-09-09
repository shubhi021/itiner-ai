import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Itinerary, TripRequest} from '../types/trip';
import {
  generateItinerary as generateItineraryService,
  suggestAlternativeActivity,
} from '../services/llmService';
import {WeatherData, getWeather} from '../services/weatherService';

export interface ItineraryState {
  currentItinerary: Itinerary | null;
  loading: boolean;
  error: string | null;
  weather: WeatherData | null;
  weatherLoading: boolean;
  pivotingActivity: {dayIndex: number; activityIndex: number} | null;
}

const initialState: ItineraryState = {
  currentItinerary: null,
  loading: false,
  error: null,
  weather: null,
  weatherLoading: false,
  pivotingActivity: null,
};

export const fetchItinerary = createAsyncThunk(
  'itinerary/fetchItinerary',
  async (request: TripRequest, {rejectWithValue}) => {
    try {
      const result = await generateItineraryService(request);
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
      coordinates?: {latitude: number; longitude: number};
    },
    {rejectWithValue},
  ) => {
    try {
      const weather = await getWeather(params.destination, params.coordinates);
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
  async (args: PivotActivityArgs, {getState, rejectWithValue}) => {
    try {
      const state = getState() as {
        itinerary: ItineraryState;
        trip: {budget: 'low' | 'mid' | 'high'};
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

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    setItinerary: (state, action: PayloadAction<Itinerary>) => {
      state.currentItinerary = action.payload;
    },
    clearItinerary: state => {
      state.currentItinerary = null;
      state.error = null;
      state.weather = null;
      state.pivotingActivity = null;
    },
  },
  extraReducers: builder => {
    builder
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
        const {dayIndex, activityIndex, activity, itineraryToInit} =
          action.payload;

        if (itineraryToInit && !state.currentItinerary) {
          state.currentItinerary = JSON.parse(JSON.stringify(itineraryToInit));
        }

        if (state.currentItinerary && state.currentItinerary.days[dayIndex]) {
          state.currentItinerary.days[dayIndex].activities[activityIndex] =
            activity;
        }
      })
      .addCase(pivotActivity.rejected, state => {
        state.pivotingActivity = null;
      });
  },
});

export const {setItinerary, clearItinerary} = itinerarySlice.actions;

export default itinerarySlice.reducer;
