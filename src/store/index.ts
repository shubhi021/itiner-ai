import {configureStore} from '@reduxjs/toolkit';
import tripReducer from './tripSlice';
import itineraryReducer from './itinerarySlice';
import savedTripsReducer from './savedTripsSlice';

export const store = configureStore({
  reducer: {
    trip: tripReducer,
    itinerary: itineraryReducer,
    savedTrips: savedTripsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
