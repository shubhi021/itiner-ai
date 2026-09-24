import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {Alert} from 'react-native';
import tripReducer from '../../src/store/tripSlice';
import itineraryReducer from '../../src/store/itinerarySlice';
import savedTripsReducer from '../../src/store/savedTripsSlice';
import {SavedTripsScreen} from '../../src/screens/SavedTripsScreen';
import {SavedTrip, storageService} from '../../src/services/storageService';

const mockTrips: SavedTrip[] = [
  {
    id: 'trip-1',
    title: 'Tokyo Journey',
    destination: 'Tokyo, Japan',
    dates: '5 Days Plan',
    duration: '5 days',
    status: 'UPCOMING',
    imageUrl: 'https://example.com/tokyo.jpg',
    savedAt: 1000,
    budget: 'mid',
    itinerary: {
      destination: 'Tokyo, Japan',
      days: [
        {
          day: 1,
          activities: [
            {
              name: 'Meiji Shrine',
              time: '09:00 AM',
              description: 'Shinto shrine',
              location: 'Shibuya',
              category: 'landmark',
            },
          ],
        },
      ],
    },
    weather: {
      temp: 18,
      condition: 'Sunny',
      description: 'Clear sky',
      humidity: 45,
      windSpeed: 8,
      icon: '01d',
      cityName: 'Tokyo',
    },
  },
  {
    id: 'trip-2',
    title: 'Parisian Getaway',
    destination: 'Paris, France',
    dates: '3 Days Plan',
    duration: '3 days',
    status: 'COMPLETED',
    imageUrl: 'https://example.com/paris.jpg',
    savedAt: 2000,
    budget: 'high',
    itinerary: {
      destination: 'Paris, France',
      days: [],
    },
  },
];

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

describe('SavedTripsScreen', () => {
  let mockNavigation: any;

  beforeEach(() => {
    mockNavigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
    };
    jest.spyOn(Alert, 'alert');
    jest.spyOn(storageService, 'getSavedTrips').mockResolvedValue(mockTrips);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = (store = createMockStore()) => {
    return {
      ...render(
        <Provider store={store}>
          <SavedTripsScreen navigation={mockNavigation} route={{} as any} />
        </Provider>,
      ),
      store,
    };
  };

  it('renders empty state when there are no saved trips', async () => {
    jest.spyOn(storageService, 'getSavedTrips').mockResolvedValue([]);
    const store = createMockStore({
      savedTrips: {
        trips: [],
        loading: false,
        activeFilter: 'All',
        searchQuery: '',
      },
    });

    const {getByText} = renderComponent(store);

    expect(getByText('Your Trips')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('No saved trips yet')).toBeTruthy();
      expect(getByText('Plan a New Trip')).toBeTruthy();
    });
  });

  it('renders trip cards with title, status, and duration', async () => {
    const store = createMockStore({
      savedTrips: {
        trips: mockTrips,
        loading: false,
        activeFilter: 'All',
        searchQuery: '',
      },
    });

    const {getByText, getByTestId} = renderComponent(store);

    await waitFor(() => {
      expect(getByText('Tokyo Journey')).toBeTruthy();
      expect(getByText('Parisian Getaway')).toBeTruthy();
      expect(getByTestId('saved-trip-card-trip-1')).toBeTruthy();
      expect(getByTestId('saved-trip-card-trip-2')).toBeTruthy();
    });
  });

  it('filters trips when tapping Upcoming and Past filter chips', async () => {
    const store = createMockStore({
      savedTrips: {
        trips: mockTrips,
        loading: false,
        activeFilter: 'All',
        searchQuery: '',
      },
    });

    const {getByText, queryByText} = renderComponent(store);

    await waitFor(() => {
      expect(getByText('Tokyo Journey')).toBeTruthy();
    });

    // Tap Upcoming
    fireEvent.press(getByText('Upcoming'));
    expect(getByText('Tokyo Journey')).toBeTruthy();
    expect(queryByText('Parisian Getaway')).toBeNull();

    // Tap Past
    fireEvent.press(getByText('Past'));
    expect(queryByText('Tokyo Journey')).toBeNull();
    expect(getByText('Parisian Getaway')).toBeTruthy();

    // Tap All
    fireEvent.press(getByText('All'));
    expect(getByText('Tokyo Journey')).toBeTruthy();
    expect(getByText('Parisian Getaway')).toBeTruthy();
  });

  it('filters trips by search input query', async () => {
    const store = createMockStore({
      savedTrips: {
        trips: mockTrips,
        loading: false,
        activeFilter: 'All',
        searchQuery: '',
      },
    });

    const {getByPlaceholderText, getByText, queryByText, getByTestId} =
      renderComponent(store);

    await waitFor(() => {
      expect(getByText('Tokyo Journey')).toBeTruthy();
    });

    // Open search bar by tapping search icon button
    const searchIcons = getByTestId('icon-Search');
    fireEvent.press(searchIcons);

    const searchInput = getByPlaceholderText(
      'Search destination or trip name...',
    );
    fireEvent.changeText(searchInput, 'tokyo');

    expect(getByText('Tokyo Journey')).toBeTruthy();
    expect(queryByText('Parisian Getaway')).toBeNull();
  });

  it('navigates to ItineraryDetail with trip data when card is selected', async () => {
    const store = createMockStore({
      savedTrips: {
        trips: mockTrips,
        loading: false,
        activeFilter: 'All',
        searchQuery: '',
      },
    });

    const {getByTestId, getByText} = renderComponent(store);

    await waitFor(() => {
      expect(getByText('Tokyo Journey')).toBeTruthy();
    });

    const card = getByTestId('saved-trip-card-trip-1');
    fireEvent.press(card);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ItineraryDetail', {
      tripId: 'trip-1',
      isOffline: true,
    });
    expect(store.getState().itinerary.currentItinerary?.destination).toBe(
      'Tokyo, Japan',
    );
  });

  it('opens action menu Alert when tapping more options button', async () => {
    const store = createMockStore({
      savedTrips: {
        trips: mockTrips,
        loading: false,
        activeFilter: 'All',
        searchQuery: '',
      },
    });

    const {getByTestId, getByText} = renderComponent(store);

    await waitFor(() => {
      expect(getByText('Tokyo Journey')).toBeTruthy();
    });

    const moreBtn = getByTestId('more-btn-trip-1');
    fireEvent.press(moreBtn);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Tokyo Journey',
      'Tokyo, Japan • 5 days',
      expect.any(Array),
      expect.any(Object),
    );
  });
});
