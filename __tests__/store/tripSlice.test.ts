import tripReducer, {
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
  selectIsFormValid,
} from '../../src/store/tripSlice';
import {TripRequest} from '../../src/types/trip';

describe('tripSlice', () => {
  const initialTripState: TripRequest = {
    destination: '',
    days: 5,
    budget: 'mid',
    interests: [],
    advanced: {},
  };

  it('should return initial state by default', () => {
    expect(tripReducer(undefined, {type: 'unknown'})).toEqual(initialTripState);
  });

  describe('setDestination', () => {
    it('sets the destination correctly', () => {
      const state = tripReducer(
        initialTripState,
        setDestination('Kyoto, Japan'),
      );
      expect(state.destination).toBe('Kyoto, Japan');
    });
  });

  describe('setDays', () => {
    it('sets the days duration correctly', () => {
      const state = tripReducer(initialTripState, setDays(7));
      expect(state.days).toBe(7);
    });
  });

  describe('setBudget', () => {
    it('sets budget to low, mid, or high', () => {
      let state = tripReducer(initialTripState, setBudget('low'));
      expect(state.budget).toBe('low');

      state = tripReducer(state, setBudget('high'));
      expect(state.budget).toBe('high');
    });
  });

  describe('toggleInterest', () => {
    it('adds interest if not present', () => {
      const state = tripReducer(initialTripState, toggleInterest('Food'));
      expect(state.interests).toEqual(['Food']);
    });

    it('removes interest if already present', () => {
      const startState = {...initialTripState, interests: ['Food', 'Art']};
      const state = tripReducer(startState, toggleInterest('Food'));
      expect(state.interests).toEqual(['Art']);
    });
  });

  describe('setPace', () => {
    it('sets pace in advanced settings when advanced is defined', () => {
      const state = tripReducer(initialTripState, setPace('relaxed'));
      expect(state.advanced?.pace).toBe('relaxed');
    });

    it('initializes advanced and sets pace if advanced was undefined', () => {
      const startState = {...initialTripState, advanced: undefined};
      const state = tripReducer(startState, setPace('packed'));
      expect(state.advanced?.pace).toBe('packed');
    });
  });

  describe('setTravelGroup', () => {
    it('sets travel group in advanced settings', () => {
      const state = tripReducer(initialTripState, setTravelGroup('family'));
      expect(state.advanced?.travelGroup).toBe('family');
    });

    it('initializes advanced and sets travel group if advanced was undefined', () => {
      const startState = {...initialTripState, advanced: undefined};
      const state = tripReducer(startState, setTravelGroup('solo'));
      expect(state.advanced?.travelGroup).toBe('solo');
    });
  });

  describe('toggleDietary', () => {
    it('adds dietary preference when not present', () => {
      const state = tripReducer(initialTripState, toggleDietary('Vegetarian'));
      expect(state.advanced?.dietary).toEqual(['Vegetarian']);
    });

    it('removes dietary preference when already present', () => {
      const startState: TripRequest = {
        ...initialTripState,
        advanced: {dietary: ['Vegetarian', 'Gluten-Free']},
      };
      const state = tripReducer(startState, toggleDietary('Vegetarian'));
      expect(state.advanced?.dietary).toEqual(['Gluten-Free']);
    });

    it('handles undefined advanced and dietary objects safely', () => {
      const startState = {...initialTripState, advanced: undefined};
      const state = tripReducer(startState, toggleDietary('Halal'));
      expect(state.advanced?.dietary).toEqual(['Halal']);
    });
  });

  describe('setStayArea', () => {
    it('sets staying area in advanced options', () => {
      const state = tripReducer(initialTripState, setStayArea('Shinjuku'));
      expect(state.advanced?.stayArea).toBe('Shinjuku');
    });

    it('initializes advanced if undefined when setting stay area', () => {
      const startState = {...initialTripState, advanced: undefined};
      const state = tripReducer(startState, setStayArea('Downtown'));
      expect(state.advanced?.stayArea).toBe('Downtown');
    });
  });

  describe('setCustomNote', () => {
    it('sets custom note in advanced options', () => {
      const state = tripReducer(
        initialTripState,
        setCustomNote('Traveling with a toddler'),
      );
      expect(state.advanced?.customNote).toBe('Traveling with a toddler');
    });

    it('initializes advanced if undefined when setting custom note', () => {
      const startState = {...initialTripState, advanced: undefined};
      const state = tripReducer(
        startState,
        setCustomNote('Prefers morning activities'),
      );
      expect(state.advanced?.customNote).toBe('Prefers morning activities');
    });
  });

  describe('resetForm', () => {
    it('resets state back to initial state', () => {
      const modifiedState: TripRequest = {
        destination: 'Barcelona',
        days: 10,
        budget: 'high',
        interests: ['Food', 'Nightlife'],
        advanced: {pace: 'packed', stayArea: 'Eixample'},
      };
      const state = tripReducer(modifiedState, resetForm());
      expect(state).toEqual(initialTripState);
    });
  });

  describe('selectIsFormValid selector', () => {
    it('returns true when destination, days, and budget are all present', () => {
      const state = {
        trip: {
          destination: 'Tokyo',
          days: 5,
          budget: 'mid' as const,
          interests: [],
        },
      };
      expect(selectIsFormValid(state)).toBe(true);
    });

    it('returns false if destination is empty', () => {
      const state = {
        trip: {
          destination: '',
          days: 5,
          budget: 'mid' as const,
          interests: [],
        },
      };
      expect(selectIsFormValid(state)).toBe(false);
    });

    it('returns false if days is 0', () => {
      const state = {
        trip: {
          destination: 'Tokyo',
          days: 0,
          budget: 'mid' as const,
          interests: [],
        },
      };
      expect(selectIsFormValid(state)).toBe(false);
    });

    it('returns false if budget is missing', () => {
      const state = {
        trip: {
          destination: 'Tokyo',
          days: 5,
          budget: '' as any,
          interests: [],
        },
      };
      expect(selectIsFormValid(state)).toBe(false);
    });
  });
});
