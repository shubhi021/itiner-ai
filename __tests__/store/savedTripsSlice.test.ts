import savedTripsReducer, {
  setActiveFilter,
  setSearchQuery,
  loadSavedTrips,
  saveTrip,
  deleteTrip,
  updateTripStatus,
  SavedTripsState,
} from '../../src/store/savedTripsSlice';
import {SavedTrip, storageService} from '../../src/services/storageService';

jest.mock('../../src/services/storageService', () => ({
  storageService: {
    getSavedTrips: jest.fn(),
    saveTrip: jest.fn(),
    deleteTrip: jest.fn(),
    updateTripStatus: jest.fn(),
  },
}));

describe('savedTripsSlice', () => {
  const initialState: SavedTripsState = {
    trips: [],
    loading: false,
    error: null,
    activeFilter: 'All',
    searchQuery: '',
  };

  const mockTrip: SavedTrip = {
    id: 'trip_abc',
    title: 'Paris Getaway',
    destination: 'Paris, France',
    dates: 'May 1 - May 5',
    duration: '4 days',
    status: 'UPCOMING',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657',
    itinerary: {destination: 'Paris, France', days: []},
    savedAt: 1714000000000,
    budget: 'mid',
  };

  describe('Synchronous Reducers', () => {
    it('sets active filter', () => {
      const state = savedTripsReducer(
        initialState,
        setActiveFilter('Upcoming'),
      );
      expect(state.activeFilter).toBe('Upcoming');
    });

    it('sets search query', () => {
      const state = savedTripsReducer(initialState, setSearchQuery('Paris'));
      expect(state.searchQuery).toBe('Paris');
    });
  });

  describe('Async Thunks Reducers', () => {
    it('handles loadSavedTrips.pending', () => {
      const state = savedTripsReducer(initialState, {
        type: loadSavedTrips.pending.type,
      });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles loadSavedTrips.fulfilled', () => {
      const state = savedTripsReducer(initialState, {
        type: loadSavedTrips.fulfilled.type,
        payload: [mockTrip],
      });
      expect(state.loading).toBe(false);
      expect(state.trips).toEqual([mockTrip]);
    });

    it('handles loadSavedTrips.rejected', () => {
      const state = savedTripsReducer(initialState, {
        type: loadSavedTrips.rejected.type,
        payload: 'Failed to load',
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to load');
    });

    it('handles saveTrip.fulfilled when inserting a new trip', () => {
      const state = savedTripsReducer(initialState, {
        type: saveTrip.fulfilled.type,
        payload: mockTrip,
      });
      expect(state.trips).toHaveLength(1);
      expect(state.trips[0].id).toBe('trip_abc');
    });

    it('handles deleteTrip.fulfilled', () => {
      const preloadedState: SavedTripsState = {
        ...initialState,
        trips: [mockTrip],
      };
      const state = savedTripsReducer(preloadedState, {
        type: deleteTrip.fulfilled.type,
        payload: 'trip_abc',
      });
      expect(state.trips).toHaveLength(0);
    });

    it('handles updateTripStatus.fulfilled', () => {
      const preloadedState: SavedTripsState = {
        ...initialState,
        trips: [mockTrip],
      };
      const state = savedTripsReducer(preloadedState, {
        type: updateTripStatus.fulfilled.type,
        payload: {id: 'trip_abc', status: 'COMPLETED'},
      });
      expect(state.trips[0].status).toBe('COMPLETED');
    });
  });

  describe('Thunk Execution with Mocked Storage', () => {
    it('dispatches loadSavedTrips successfully', async () => {
      (storageService.getSavedTrips as jest.Mock).mockResolvedValueOnce([
        mockTrip,
      ]);

      const dispatch = jest.fn();
      const thunk = loadSavedTrips();
      await thunk(dispatch, () => ({}), undefined);

      expect(storageService.getSavedTrips).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({type: loadSavedTrips.pending.type}),
      );
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: loadSavedTrips.fulfilled.type,
          payload: [mockTrip],
        }),
      );
    });
  });
});
