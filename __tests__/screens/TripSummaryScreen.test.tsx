import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {Alert, Share} from 'react-native';
import tripReducer from '../../src/store/tripSlice';
import itineraryReducer from '../../src/store/itinerarySlice';
import savedTripsReducer from '../../src/store/savedTripsSlice';
import {TripSummaryScreen} from '../../src/screens/TripSummaryScreen';

const mockItinerary = {
  destination: 'Lisbon, Portugal',
  days: [
    {
      day: 1,
      theme: 'Historic Alfama & Castles',
      activities: [
        {
          name: 'São Jorge Castle',
          time: '10:00 AM',
          description: 'Moorish castle overlooking Lisbon.',
          location: 'Rua de Santa Cruz do Castelo',
          category: 'landmark',
          coordinates: {latitude: 38.7139, longitude: -9.1335},
        },
      ],
    },
  ],
};

const mockWeather = {
  temp: 21,
  condition: 'Clear',
  description: 'clear sky',
  humidity: 50,
  windSpeed: 12,
  icon: '01d',
  cityName: 'Lisbon',
};

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

describe('TripSummaryScreen', () => {
  let mockNavigation: any;

  beforeEach(() => {
    mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };
    jest.spyOn(Alert, 'alert');
    jest.spyOn(Share, 'share').mockResolvedValue({action: Share.sharedAction});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = (store = createMockStore()) => {
    return {
      ...render(
        <Provider store={store}>
          <TripSummaryScreen navigation={mockNavigation} route={{} as any} />
        </Provider>,
      ),
      store,
    };
  };

  it('renders destination hero header, weather badge, and roadmap', () => {
    const store = createMockStore({
      trip: {
        destination: 'Lisbon, Portugal',
        days: 3,
        budget: 'mid',
        interests: ['History'],
      },
      itinerary: {
        currentItinerary: mockItinerary,
        weather: mockWeather,
      },
      savedTrips: {
        trips: [],
      },
    });

    const {getByText} = renderComponent(store);

    expect(getByText('Lisbon Journey')).toBeTruthy();
    expect(getByText('ITINERARY GENERATED')).toBeTruthy();
    expect(getByText('21°C • Clear')).toBeTruthy();
    expect(getByText('Daily Roadmap')).toBeTruthy();
    expect(getByText('São Jorge Castle')).toBeTruthy();
    expect(getByText('View Full Schedule & Maps')).toBeTruthy();
  });

  it('toggles bookmark to save trip offline when not yet saved', async () => {
    const store = createMockStore({
      trip: {
        destination: 'Lisbon, Portugal',
        days: 1,
        budget: 'mid',
        interests: [],
      },
      itinerary: {
        currentItinerary: mockItinerary,
        weather: mockWeather,
      },
      savedTrips: {
        trips: [],
      },
    });

    const {getByTestId} = renderComponent(store);

    const bookmarkIcon = getByTestId('icon-Bookmark');
    fireEvent.press(bookmarkIcon);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Trip Saved!',
      'This itinerary is now stored offline on your device.',
    );
    await waitFor(() => {
      expect(store.getState().savedTrips.trips).toHaveLength(1);
      expect(store.getState().savedTrips.trips[0].destination).toBe(
        'Lisbon, Portugal',
      );
    });
  });

  it('toggles bookmark to remove trip from offline saved trips when already saved', async () => {
    const store = createMockStore({
      trip: {
        destination: 'Lisbon, Portugal',
        days: 1,
        budget: 'mid',
        interests: [],
      },
      itinerary: {
        currentItinerary: mockItinerary,
        weather: mockWeather,
      },
      savedTrips: {
        trips: [
          {
            id: 'trip-lisbon',
            title: 'Lisbon Journey',
            destination: 'Lisbon, Portugal',
            dates: '1 Days Plan',
            duration: '1 days',
            status: 'UPCOMING',
            imageUrl: 'https://example.com/lisbon.jpg',
            itinerary: mockItinerary,
            savedAt: 1234,
            budget: 'mid',
          },
        ],
      },
    });

    const {getByTestId} = renderComponent(store);

    const bookmarkIcon = getByTestId('icon-Bookmark');
    fireEvent.press(bookmarkIcon);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Trip Removed',
      'Removed from your offline saved trips collection.',
    );
    await waitFor(() => {
      expect(store.getState().savedTrips.trips).toHaveLength(0);
    });
  });

  it('navigates to ItineraryDetail when tapping View Full Schedule button', () => {
    const store = createMockStore({
      trip: {
        destination: 'Lisbon, Portugal',
        days: 1,
        budget: 'mid',
        interests: [],
      },
      itinerary: {
        currentItinerary: mockItinerary,
        weather: mockWeather,
      },
      savedTrips: {
        trips: [],
      },
    });

    const {getByText} = renderComponent(store);

    const viewScheduleBtn = getByText('View Full Schedule & Maps');
    fireEvent.press(viewScheduleBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ItineraryDetail');
  });

  it('navigates back to Plan tab when tapping modify preferences', () => {
    const store = createMockStore({
      trip: {
        destination: 'Lisbon, Portugal',
        days: 1,
        budget: 'mid',
        interests: [],
      },
      itinerary: {
        currentItinerary: mockItinerary,
        weather: mockWeather,
      },
      savedTrips: {
        trips: [],
      },
    });

    const {getByText} = renderComponent(store);

    const modifyBtn = getByText('Modify preferences or destination');
    fireEvent.press(modifyBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'Plan',
    });
  });

  it('triggers native share when tapping share button', async () => {
    const store = createMockStore({
      trip: {
        destination: 'Lisbon, Portugal',
        days: 1,
        budget: 'mid',
        interests: [],
      },
      itinerary: {
        currentItinerary: mockItinerary,
        weather: mockWeather,
      },
      savedTrips: {
        trips: [],
      },
    });

    const {getByTestId} = renderComponent(store);

    const shareIcon = getByTestId('icon-Share2');
    fireEvent.press(shareIcon);

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({
        title: 'Lisbon Journey',
        message: expect.stringContaining('Lisbon Journey'),
      });
    });
  });
});
