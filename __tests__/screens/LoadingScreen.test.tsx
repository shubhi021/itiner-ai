import React from 'react';
import {render, act} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {Alert} from 'react-native';
import tripReducer from '../../src/store/tripSlice';
import itineraryReducer from '../../src/store/itinerarySlice';
import savedTripsReducer from '../../src/store/savedTripsSlice';
import {LoadingScreen} from '../../src/screens/LoadingScreen';

const createMockStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      trip: tripReducer,
      itinerary: itineraryReducer,
      savedTrips: savedTripsReducer,
    } as any,
    preloadedState,
  });
};

describe('LoadingScreen', () => {
  let mockNavigation: any;

  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigation = {
      replace: jest.fn(),
      goBack: jest.fn(),
      navigate: jest.fn(),
    };
    jest.spyOn(Alert, 'alert');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const renderComponent = (store = createMockStore()) => {
    return render(
      <Provider store={store}>
        <LoadingScreen navigation={mockNavigation} route={{} as any} />
      </Provider>,
    );
  };

  it('renders destination city name and milestone step information', () => {
    const store = createMockStore({
      trip: {
        destination: 'Kyoto, Japan',
        days: 4,
        budget: 'mid',
        interests: ['History'],
      },
      itinerary: {
        loading: true,
        error: null,
        currentItinerary: null,
      },
    });

    const {getByText} = renderComponent(store);

    expect(getByText('Mapping Kyoto landmarks & hidden spots')).toBeTruthy();
    expect(
      getByText('Analyzing cultural hotspots & neighborhood vibes'),
    ).toBeTruthy();
    expect(getByText('AI TRIP CONCIERGE')).toBeTruthy();
    expect(getByText('INTELLIGENT PLANNING')).toBeTruthy();
  });

  it('navigates to TripSummary when generation completes successfully', () => {
    const store = createMockStore({
      trip: {
        destination: 'Tokyo, Japan',
        days: 3,
        budget: 'mid',
        interests: [],
      },
      itinerary: {
        loading: false,
        error: null,
        currentItinerary: {
          destination: 'Tokyo, Japan',
          days: [],
        },
      },
    });

    renderComponent(store);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('TripSummary');
  });

  it('triggers Alert with error and navigates back when generation fails', () => {
    const store = createMockStore({
      trip: {
        destination: 'Tokyo, Japan',
        days: 3,
        budget: 'mid',
        interests: [],
      },
      itinerary: {
        loading: false,
        error: 'API quota exceeded. Please try again later.',
        currentItinerary: null,
      },
    });

    renderComponent(store);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Generation Failed',
      'API quota exceeded. Please try again later.',
      expect.any(Array),
    );

    // Trigger onPress on the OK button in Alert
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    alertButtons[0].onPress();
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('advances percentage display ticker over time', () => {
    const store = createMockStore({
      trip: {
        destination: 'Rome, Italy',
        days: 5,
        budget: 'high',
        interests: [],
      },
      itinerary: {
        loading: true,
        error: null,
        currentItinerary: null,
      },
    });

    const {getByText} = renderComponent(store);

    // Initial percent is 12%
    expect(getByText('12%')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    // Ticker advances
    expect(() => getByText('12%')).toThrow();
  });
});
