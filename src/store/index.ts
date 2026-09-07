import {configureStore} from '@reduxjs/toolkit';
import tripReducer from './tripSlice';
import itineraryReducer from './itinerarySlice';

export const store = configureStore({
  reducer: {
    trip: tripReducer,
    itinerary: itineraryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
