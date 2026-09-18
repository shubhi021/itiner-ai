import itineraryReducer, {
  setItinerary,
  setWeather,
  setIsOfflineMode,
  togglePackingItem,
  addActivityToDay,
  removeActivityFromDay,
  togglePackingItemByName,
  clearItinerary,
  fetchItinerary,
  hydrateCachedItinerary,
  ItineraryState,
} from '../../src/store/itinerarySlice';
import {Itinerary, Activity, PackingItem} from '../../src/types/trip';
import {WeatherData} from '../../src/services/weatherService';

describe('itinerarySlice', () => {
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

  const mockActivity: Activity = {
    time: '10:00 AM',
    name: 'Louvre Museum',
    description: 'World-famous art museum.',
    location: 'Paris, France',
    category: 'landmark',
    coordinates: {latitude: 48.8606, longitude: 2.3376},
    estimatedCost: '€17',
  };

  const mockItinerary: Itinerary = {
    destination: 'Paris, France',
    days: [
      {
        day: 1,
        activities: [mockActivity],
      },
    ],
  };

  const mockWeather: WeatherData = {
    cityName: 'Paris',
    temp: 18,
    condition: 'Rain',
    description: 'light rain',
    icon: '10d',
    humidity: 78,
    windSpeed: 4.5,
  };

  describe('Synchronous Reducers', () => {
    it('sets the current itinerary', () => {
      const state = itineraryReducer(initialState, setItinerary(mockItinerary));
      expect(state.currentItinerary).toEqual(mockItinerary);
    });

    it('sets weather condition', () => {
      const state = itineraryReducer(initialState, setWeather(mockWeather));
      expect(state.weather).toEqual(mockWeather);
    });

    it('toggles offline mode flag', () => {
      const state = itineraryReducer(initialState, setIsOfflineMode(true));
      expect(state.isOfflineMode).toBe(true);
    });

    it('adds an activity to a specific day in the itinerary', () => {
      const preloadedState: ItineraryState = {
        ...initialState,
        currentItinerary: JSON.parse(JSON.stringify(mockItinerary)),
      };
      const newActivity: Activity = {
        time: '02:00 PM',
        name: 'Eiffel Tower',
        description: 'Iconic iron tower.',
        location: 'Champ de Mars',
        category: 'landmark',
      };

      const state = itineraryReducer(
        preloadedState,
        addActivityToDay({dayNumber: 1, activity: newActivity}),
      );

      expect(state.currentItinerary?.days[0].activities).toHaveLength(2);
      expect(state.currentItinerary?.days[0].activities[1].name).toBe(
        'Eiffel Tower',
      );
    });

    it('removes an activity from a specific day by name match', () => {
      const preloadedState: ItineraryState = {
        ...initialState,
        currentItinerary: JSON.parse(JSON.stringify(mockItinerary)),
      };

      const state = itineraryReducer(
        preloadedState,
        removeActivityFromDay({dayNumber: 1, activityName: 'Louvre'}),
      );

      expect(state.currentItinerary?.days[0].activities).toHaveLength(0);
    });

    it('toggles packing items by ID', () => {
      const mockItems: PackingItem[] = [
        {id: 'p1', name: 'Passport', category: 'Documents', packed: false},
      ];
      const preloadedState: ItineraryState = {
        ...initialState,
        packingList: mockItems,
      };

      const state = itineraryReducer(
        preloadedState,
        togglePackingItem({id: 'p1', destination: 'Paris'}),
      );
      expect(state.packingList?.[0].packed).toBe(true);
    });

    it('toggles packing item by name search', () => {
      const mockItems: PackingItem[] = [
        {
          id: 'p1',
          name: 'Universal Adapter',
          category: 'Tech & Adapters',
          packed: false,
        },
      ];
      const preloadedState: ItineraryState = {
        ...initialState,
        packingList: mockItems,
      };

      const state = itineraryReducer(
        preloadedState,
        togglePackingItemByName({itemName: 'adapter', isPacked: true}),
      );
      expect(state.packingList?.[0].packed).toBe(true);
    });

    it('clears active itinerary and all associated intelligence', () => {
      const preloadedState: ItineraryState = {
        ...initialState,
        currentItinerary: mockItinerary,
        weather: mockWeather,
      };
      const state = itineraryReducer(preloadedState, clearItinerary());
      expect(state.currentItinerary).toBeNull();
      expect(state.weather).toBeNull();
    });
  });

  describe('Async Thunks Reducers', () => {
    it('sets loading on fetchItinerary.pending', () => {
      const state = itineraryReducer(initialState, {
        type: fetchItinerary.pending.type,
      });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('stores itinerary on fetchItinerary.fulfilled', () => {
      const state = itineraryReducer(initialState, {
        type: fetchItinerary.fulfilled.type,
        payload: mockItinerary,
      });
      expect(state.loading).toBe(false);
      expect(state.currentItinerary).toEqual(mockItinerary);
    });

    it('stores error on fetchItinerary.rejected', () => {
      const state = itineraryReducer(initialState, {
        type: fetchItinerary.rejected.type,
        payload: 'Network error generating trip',
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error generating trip');
    });

    it('hydrates state on hydrateCachedItinerary.fulfilled', () => {
      const state = itineraryReducer(initialState, {
        type: hydrateCachedItinerary.fulfilled.type,
        payload: {itinerary: mockItinerary, weather: mockWeather},
      });
      expect(state.currentItinerary).toEqual(mockItinerary);
      expect(state.weather).toEqual(mockWeather);
    });

    it('handles fetchWeatherForTrip pending, fulfilled, rejected', () => {
      let state = itineraryReducer(initialState, {
        type: 'itinerary/fetchWeatherForTrip/pending',
      });
      expect(state.weatherLoading).toBe(true);

      state = itineraryReducer(state, {
        type: 'itinerary/fetchWeatherForTrip/fulfilled',
        payload: mockWeather,
      });
      expect(state.weatherLoading).toBe(false);
      expect(state.weather).toEqual(mockWeather);

      state = itineraryReducer(state, {
        type: 'itinerary/fetchWeatherForTrip/rejected',
      });
      expect(state.weatherLoading).toBe(false);
    });

    it('handles pivotActivity pending, fulfilled, rejected', () => {
      const preloadedState: ItineraryState = {
        ...initialState,
        currentItinerary: JSON.parse(JSON.stringify(mockItinerary)),
      };

      let state = itineraryReducer(preloadedState, {
        type: 'itinerary/pivotActivity/pending',
        meta: {arg: {dayIndex: 0, activityIndex: 0}},
      });
      expect(state.pivotingActivity).toEqual({dayIndex: 0, activityIndex: 0});

      const replacementActivity: Activity = {
        name: 'Musee d Orsay',
        time: '10:00 AM',
        description: 'Famous Impressionist museum.',
        location: 'Paris, France',
        category: 'landmark',
      };

      state = itineraryReducer(state, {
        type: 'itinerary/pivotActivity/fulfilled',
        payload: {
          dayIndex: 0,
          activityIndex: 0,
          activity: replacementActivity,
        },
      });
      expect(state.pivotingActivity).toBeNull();
      expect(state.currentItinerary?.days[0].activities[0].name).toBe(
        'Musee d Orsay',
      );

      state = itineraryReducer(state, {
        type: 'itinerary/pivotActivity/rejected',
      });
      expect(state.pivotingActivity).toBeNull();
    });

    it('handles optimizeDay pending, fulfilled, rejected', () => {
      const preloadedState: ItineraryState = {
        ...initialState,
        currentItinerary: JSON.parse(JSON.stringify(mockItinerary)),
      };

      let state = itineraryReducer(preloadedState, {
        type: 'itinerary/optimizeDay/pending',
      });
      expect(state.optimizingDay).toBe(true);

      const optimizedActivities: Activity[] = [
        {
          name: 'Morning Bakery',
          time: '08:30 AM',
          description: 'Croissants',
          location: 'Paris',
          category: 'food',
        },
      ];

      state = itineraryReducer(state, {
        type: 'itinerary/optimizeDay/fulfilled',
        payload: {
          dayIndex: 0,
          activities: optimizedActivities,
        },
      });
      expect(state.optimizingDay).toBe(false);
      expect(state.currentItinerary?.days[0].activities).toEqual(
        optimizedActivities,
      );

      state = itineraryReducer(state, {
        type: 'itinerary/optimizeDay/rejected',
        payload: 'Re-optimization failed',
      });
      expect(state.optimizingDay).toBe(false);
      expect(state.error).toBe('Re-optimization failed');
    });

    it('handles fetchPackingList pending, fulfilled, rejected', () => {
      let state = itineraryReducer(initialState, {
        type: 'itinerary/fetchPackingList/pending',
      });
      expect(state.packingLoading).toBe(true);

      const mockList: PackingItem[] = [
        {id: '1', name: 'Passport', category: 'Documents', packed: true},
      ];

      state = itineraryReducer(state, {
        type: 'itinerary/fetchPackingList/fulfilled',
        payload: mockList,
      });
      expect(state.packingLoading).toBe(false);
      expect(state.packingList).toEqual(mockList);

      state = itineraryReducer(state, {
        type: 'itinerary/fetchPackingList/rejected',
      });
      expect(state.packingLoading).toBe(false);
    });

    it('handles fetchDestinationInsights pending, fulfilled, rejected', () => {
      let state = itineraryReducer(initialState, {
        type: 'itinerary/fetchDestinationInsights/pending',
      });
      expect(state.insightsLoading).toBe(true);

      const mockInsights = {
        tippingCulture: 'Tipping is optional',
        transitTips: ['Use the Metro'],
        culturalEtiquette: {dos: ['Say Bonjour'], donts: ['Speak loudly']},
        emergencyNumbers: {police: '17', ambulance: '15', general: '112'},
        essentialPhrases: [{phrase: 'Merci', translation: 'Thank you'}],
      };

      state = itineraryReducer(state, {
        type: 'itinerary/fetchDestinationInsights/fulfilled',
        payload: mockInsights,
      });
      expect(state.insightsLoading).toBe(false);
      expect(state.insights).toEqual(mockInsights);

      state = itineraryReducer(state, {
        type: 'itinerary/fetchDestinationInsights/rejected',
      });
      expect(state.insightsLoading).toBe(false);
    });

    it('handles fetchBudgetForecast pending, fulfilled, rejected', () => {
      let state = itineraryReducer(initialState, {
        type: 'itinerary/fetchBudgetForecast/pending',
      });
      expect(state.forecastLoading).toBe(true);

      const mockForecast = {
        totalEstimated: '€750',
        currency: 'EUR',
        dailyAverage: '€150',
        categories: [],
        moneySavingTips: ['Museum pass'],
      };

      state = itineraryReducer(state, {
        type: 'itinerary/fetchBudgetForecast/fulfilled',
        payload: mockForecast,
      });
      expect(state.forecastLoading).toBe(false);
      expect(state.budgetForecast).toEqual(mockForecast);

      state = itineraryReducer(state, {
        type: 'itinerary/fetchBudgetForecast/rejected',
      });
      expect(state.forecastLoading).toBe(false);
    });
  });
});
