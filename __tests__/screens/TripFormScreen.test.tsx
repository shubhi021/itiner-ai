import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import tripReducer from '../../src/store/tripSlice';
import itineraryReducer from '../../src/store/itinerarySlice';
import savedTripsReducer from '../../src/store/savedTripsSlice';
import {TripFormScreen} from '../../src/screens/TripFormScreen';
import * as placesService from '../../src/services/placesService';
import * as llmService from '../../src/services/llmService';
import * as weatherService from '../../src/services/weatherService';

jest.mock('../../src/services/placesService');
jest.mock('../../src/services/llmService');
jest.mock('../../src/services/weatherService');

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

describe('TripFormScreen', () => {
  let mockNavigation: any;
  const mockedPlacesService = placesService as jest.Mocked<
    typeof placesService
  >;

  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
    };
    mockedPlacesService.fetchCitySuggestions.mockResolvedValue([
      {placeId: '1', description: 'Tokyo, Japan'},
      {placeId: '2', description: 'Kyoto, Japan'},
    ]);
    (llmService.generateItinerary as jest.Mock).mockResolvedValue({
      destination: 'Barcelona, Spain',
      days: [],
    });
    (weatherService.getWeather as jest.Mock).mockResolvedValue({
      temp: 20,
      condition: 'Clear',
      humidity: 50,
      windSpeed: 10,
      description: 'clear sky',
      icon: '01d',
      cityName: 'Barcelona',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderComponent = (store = createMockStore()) => {
    return {
      ...render(
        <Provider store={store}>
          <TripFormScreen navigation={mockNavigation} />
        </Provider>,
      ),
      store,
    };
  };

  it('renders form inputs, headers, and disabled submit button when destination is empty', () => {
    const {getByText, getAllByText, getByTestId} = renderComponent();

    expect(getByText('Explore the World')).toBeTruthy();
    expect(getByTestId('destination-input')).toBeTruthy();
    expect(getByText('Duration')).toBeTruthy();
    expect(getAllByText('Budget').length).toBeGreaterThan(0);
    expect(getByText('Interests')).toBeTruthy();

    const submitBtn = getByTestId('submit-button');
    expect(submitBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it('shows autocomplete suggestions after debounced typing and allows selection', async () => {
    const {getByTestId, getByText, findByTestId, store} = renderComponent();

    const input = getByTestId('destination-input');
    fireEvent.changeText(input, 'Tok');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    const suggestion = await findByTestId('search-suggestion-0');
    expect(suggestion).toBeTruthy();
    expect(getByText('Tokyo, Japan')).toBeTruthy();

    fireEvent.press(suggestion);

    expect(store.getState().trip.destination).toBe('Tokyo, Japan');
  });

  it('allows clearing the selected destination pill', () => {
    const store = createMockStore({
      trip: {
        destination: 'Paris, France',
        days: 3,
        budget: 'mid',
        interests: ['Food'],
      },
    });

    const {getByTestId, getByText} = renderComponent(store);

    expect(getByText('Paris, France')).toBeTruthy();
    const clearBtn = getByTestId('clear-destination-btn');
    fireEvent.press(clearBtn);

    expect(store.getState().trip.destination).toBe('');
  });

  it('updates duration days when pressing stepper +/- buttons', () => {
    const store = createMockStore({
      trip: {
        destination: 'Rome, Italy',
        days: 5,
        budget: 'mid',
        interests: [],
      },
    });

    const {getByText} = renderComponent(store);

    const minusBtn = getByText('-');
    const plusBtn = getByText('+');

    fireEvent.press(plusBtn);
    expect(store.getState().trip.days).toBe(6);

    fireEvent.press(minusBtn);
    expect(store.getState().trip.days).toBe(5);
  });

  it('updates budget tier when pressing budget cards', () => {
    const {getByTestId, store} = renderComponent();

    const luxuryCard = getByTestId('budget-card-high');
    fireEvent.press(luxuryCard);
    expect(store.getState().trip.budget).toBe('high');

    const budgetCard = getByTestId('budget-card-low');
    fireEvent.press(budgetCard);
    expect(store.getState().trip.budget).toBe('low');
  });

  it('toggles interest chips in redux store', () => {
    const {getByTestId, store} = renderComponent();

    const foodChip = getByTestId('interest-chip-Food');
    fireEvent.press(foodChip);
    expect(store.getState().trip.interests).toContain('Food');

    fireEvent.press(foodChip);
    expect(store.getState().trip.interests).not.toContain('Food');
  });

  it('enables submit button and navigates to Loading when form is valid', () => {
    const store = createMockStore({
      trip: {
        destination: 'Barcelona, Spain',
        days: 4,
        budget: 'mid',
        interests: ['Art', 'Food'],
      },
    });

    const {getByTestId} = renderComponent(store);

    const submitBtn = getByTestId('submit-button');
    expect(submitBtn.props.accessibilityState?.disabled).toBe(false);

    fireEvent.press(submitBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Loading');
  });
});
