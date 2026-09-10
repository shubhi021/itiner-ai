import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SavedTrip, storageService } from '../services/storageService';

export interface SavedTripsState {
  trips: SavedTrip[];
  loading: boolean;
  error: string | null;
  activeFilter: 'All' | 'Upcoming' | 'Past';
  searchQuery: string;
}

const initialState: SavedTripsState = {
  trips: [],
  loading: false,
  error: null,
  activeFilter: 'All',
  searchQuery: '',
};


export const loadSavedTrips = createAsyncThunk(
  'savedTrips/loadSavedTrips',
  async (_, { rejectWithValue }) => {
    try {
      const trips = await storageService.getSavedTrips();
      return trips;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to load saved trips from the storage'
      )
    }
  }
)

export const saveTrip = createAsyncThunk(
  'savedTrips/saveTrip',
  async (trip: SavedTrip, { rejectWithValue }) => {
    try {
      await storageService.saveTrip(trip);
      return trip;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save trip');
    }
  },
);

export const deleteTrip = createAsyncThunk('deleteTrip',
  async (id: string, { rejectWithValue }) => {
    try {
      await storageService.deleteTrip(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete trip')
    }
  }
)

export const updateTripStatus = createAsyncThunk(
  'savedTrips/updateTripStatus',
  async (
    params: { id: string; status: 'UPCOMING' | 'COMPLETED' | 'DRAFT' },
    { rejectWithValue },
  ) => {
    try {
      await storageService.updateTripStatus(params.id, params.status);
      return params;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update trip status');
    }
  },
);

const savedTripsSlice = createSlice({
  name: 'savedTrips',
  initialState,
  reducers: {
    setActiveFilter: (
      state,
      action: PayloadAction<'All' | 'Upcoming' | 'Past'>,
    ) => {
      state.activeFilter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Load trips
      .addCase(
        loadSavedTrips.pending, (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(loadSavedTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(loadSavedTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save trip
      .addCase(saveTrip.fulfilled, (state, action) => {
        const saved = action.payload;
        const index = state.trips.findIndex(t => t.id === saved.id);
        if (index > 0) {
          state.trips[index] = saved;
        }
        else {
          state.trips.unshift(saved)
        }
      })
      // Delete trip
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.trips = state.trips.filter(t => t.id !== action.payload);
      })

      // Update trip status
      .addCase(updateTripStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const trip = state.trips.find(t => t.id === id)
        if (trip) {
          trip.status = status;
        }
      })
  },
});

export const { setActiveFilter, setSearchQuery } = savedTripsSlice.actions;

export default savedTripsSlice.reducer;
