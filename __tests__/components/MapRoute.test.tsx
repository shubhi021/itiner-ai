import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {MapRoute} from '../../src/components/MapRoute';
import {Activity} from '../../src/types/trip';

describe('MapRoute component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders fallback container when no activities have valid coordinates', () => {
    const activitiesWithoutCoords: Activity[] = [
      {
        name: 'Local Cafe',
        time: '09:00 AM',
        description: 'Morning coffee',
        location: 'Downtown',
        category: 'food',
      },
    ];

    render(<MapRoute activities={activitiesWithoutCoords} />);

    expect(screen.getByTestId('map-fallback')).toBeTruthy();
    expect(screen.queryByTestId('map-view')).toBeNull();
  });

  it('renders MapView, polyline, and markers when valid coordinates are present', () => {
    const activitiesWithCoords: Activity[] = [
      {
        name: 'Belém Tower',
        time: '10:00 AM',
        description: 'Historical tower',
        location: 'Belém',
        category: 'landmark',
        coordinates: {latitude: 38.6916, longitude: -9.216},
      },
      {
        name: 'Jerónimos Monastery',
        time: '11:30 AM',
        description: 'UNESCO World Heritage',
        location: 'Belém',
        category: 'landmark',
        coordinates: {latitude: 38.6979, longitude: -9.2066},
      },
      {
        name: 'No Coord Activity',
        time: '01:00 PM',
        description: 'Lunch without GPS',
        location: 'Local',
        category: 'food',
      },
    ];

    render(<MapRoute activities={activitiesWithCoords} />);

    expect(screen.queryByTestId('map-fallback')).toBeNull();
    expect(screen.getByTestId('map-view')).toBeTruthy();
    expect(screen.getByTestId('mock-map-polyline')).toBeTruthy();

    const markers = screen.getAllByTestId('mock-map-marker');
    expect(markers).toHaveLength(2); // Only 2 with valid coordinates
  });
});
