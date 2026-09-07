import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Itinerary, TripRequest} from '../types/trip';
import {generateItinerary as generateItineraryService} from '../services/llmService';

interface ItineraryState {
  currentItinerary: Itinerary | null;
  loading: boolean;
  error: string | null;
}

const initialState: ItineraryState = {
  currentItinerary: null,
  loading: false,
  error: null,
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

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    clearItinerary: state => {
      state.currentItinerary = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
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
      });
  },
});

export const {clearItinerary} = itinerarySlice.actions;

export default itinerarySlice.reducer;
