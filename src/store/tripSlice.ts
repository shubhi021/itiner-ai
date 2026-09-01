import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TripRequest } from '../types/trip';

const initialState: TripRequest = {
  destination: '',
  days: 5,
  budget: 'mid',
  interests: [],
  advanced: {},
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setDestination: (state, action: PayloadAction<string>) => {
      state.destination = action.payload;
    },
    setDays: (state, action: PayloadAction<number>) => {
      state.days = action.payload;
    },
    setBudget: (state, action: PayloadAction<'low' | 'mid' | 'high'>) => {
      state.budget = action.payload;
    },
    toggleInterest: (state, action: PayloadAction<string>) => {
      const interest = action.payload;
      if (state.interests.includes(interest)) {
        state.interests = state.interests.filter((i) => i !== interest);
      } else {
        state.interests.push(interest);
      }
    },
    setPace: (state, action: PayloadAction<'relaxed' | 'balanced' | 'packed'>) => {
      if (!state.advanced) state.advanced = {};
      state.advanced.pace = action.payload;
    },
    setTravelGroup: (state, action: PayloadAction<'solo' | 'couple' | 'family' | 'friends'>) => {
      if (!state.advanced) state.advanced = {};
      state.advanced.travelGroup = action.payload;
    },
    toggleDietary: (state, action: PayloadAction<string>) => {
      if (!state.advanced) state.advanced = {};
      if (!state.advanced.dietary) state.advanced.dietary = [];
      
      const dietaryItem = action.payload;
      if (state.advanced.dietary.includes(dietaryItem)) {
        state.advanced.dietary = state.advanced.dietary.filter((i) => i !== dietaryItem);
      } else {
        state.advanced.dietary.push(dietaryItem);
      }
    },
    setStayArea: (state, action: PayloadAction<string>) => {
      if (!state.advanced) state.advanced = {};
      state.advanced.stayArea = action.payload;
    },
    setCustomNote: (state, action: PayloadAction<string>) => {
      if (!state.advanced) state.advanced = {};
      state.advanced.customNote = action.payload;
    },
    resetForm: () => initialState,
  },
});

export const {
  setDestination,
  setDays,
  setBudget,
  toggleInterest,
  setPace,
  setTravelGroup,
  toggleDietary,
  setStayArea,
  setCustomNote,
  resetForm,
} = tripSlice.actions;

// Derived value/selector for form validity
export const selectIsFormValid = (state: { trip: TripRequest }) => {
  const { destination, days, budget } = state.trip;
  return Boolean(destination && days && budget);
};

export default tripSlice.reducer;
