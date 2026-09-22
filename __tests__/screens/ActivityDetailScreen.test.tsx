import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Share, Linking, Platform} from 'react-native';
import {ActivityDetailScreen} from '../../src/screens/ActivityDetailScreen';

describe('ActivityDetailScreen', () => {
  let mockNavigation: any;

  beforeEach(() => {
    mockNavigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };
    jest.spyOn(Share, 'share').mockResolvedValue({action: Share.sharedAction});
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders graceful fallback activity when route params are omitted', () => {
    const {getByText} = render(
      <ActivityDetailScreen navigation={mockNavigation} route={{} as any} />,
    );

    expect(getByText('Historic City Exploration')).toBeTruthy();
    expect(getByText('DAY 1 • 10:00 AM')).toBeTruthy();
    expect(getByText('ESTIMATED COST')).toBeTruthy();
    expect(getByText('SCHEDULED TIME')).toBeTruthy();
    expect(getByText('Location & Address')).toBeTruthy();
    expect(getByText('City Center')).toBeTruthy();
  });

  it('renders custom activity information provided in route params', () => {
    const customRoute = {
      params: {
        activity: {
          name: 'Belém Tower Visit',
          time: '02:00 PM',
          description: 'Historical fortification located in Lisbon.',
          location: 'Avenida Brasília, Lisbon',
          estimatedCost: '€9.00',
          category: 'landmark' as const,
          coordinates: {latitude: 38.6916, longitude: -9.216},
        },
        dayNumber: 2,
        destination: 'Lisbon, Portugal',
      },
    };

    const {getByText, getAllByText} = render(
      <ActivityDetailScreen
        navigation={mockNavigation}
        route={customRoute as any}
      />,
    );

    expect(getByText('Belém Tower Visit')).toBeTruthy();
    expect(getByText('DAY 2 • 02:00 PM')).toBeTruthy();
    expect(
      getByText('Historical fortification located in Lisbon.'),
    ).toBeTruthy();
    expect(getByText('Avenida Brasília, Lisbon')).toBeTruthy();
    expect(getByText('€9.00')).toBeTruthy();
    expect(getAllByText('LANDMARK').length).toBeGreaterThan(0);
  });

  it('navigates back when pressing back icon button', () => {
    const {getByTestId} = render(
      <ActivityDetailScreen navigation={mockNavigation} route={{} as any} />,
    );

    const backIcon = getByTestId('icon-ChevronLeft');
    fireEvent.press(backIcon);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('triggers native share dialog with formatted activity message', async () => {
    const customRoute = {
      params: {
        activity: {
          name: 'Senso-ji Temple',
          time: '10:00 AM',
          description: 'Ancient Buddhist temple in Asakusa.',
          location: 'Asakusa, Tokyo',
          estimatedCost: 'Free',
          category: 'landmark' as const,
        },
        dayNumber: 1,
        destination: 'Tokyo, Japan',
      },
    };

    const {getByText} = render(
      <ActivityDetailScreen
        navigation={mockNavigation}
        route={customRoute as any}
      />,
    );

    const shareBtn = getByText('Share Stop');
    fireEvent.press(shareBtn);

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({
        title: 'Senso-ji Temple',
        message: expect.stringContaining('Senso-ji Temple'),
      });
    });
  });

  it('opens directions URL when pressing Get Directions button', async () => {
    Platform.OS = 'ios';
    const customRoute = {
      params: {
        activity: {
          name: 'Eiffel Tower',
          time: '04:00 PM',
          description: 'Iconic wrought-iron lattice tower.',
          location: 'Champ de Mars, Paris',
          estimatedCost: '€26.00',
          category: 'landmark' as const,
          coordinates: {latitude: 48.8584, longitude: 2.2945},
        },
        dayNumber: 3,
        destination: 'Paris, France',
      },
    };

    const {getByText} = render(
      <ActivityDetailScreen
        navigation={mockNavigation}
        route={customRoute as any}
      />,
    );

    const directionsBtn = getByText('Get Directions');
    fireEvent.press(directionsBtn);

    await waitFor(() => {
      expect(Linking.canOpenURL).toHaveBeenCalled();
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('maps.apple.com'),
      );
    });
  });
});
