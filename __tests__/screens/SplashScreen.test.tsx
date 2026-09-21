import React from 'react';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SplashScreen} from '../../src/screens/SplashScreen';

describe('SplashScreen', () => {
  let mockNavigation: any;

  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigation = {
      replace: jest.fn(),
      navigate: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('renders branding title, tagline, and pillar text', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <SplashScreen navigation={mockNavigation} route={{} as any} />,
      );
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('ItinerAI');
    expect(json).toContain('Smart Travel Itineraries in Seconds');
    expect(json).toContain('Day-by-Day Plans');
    expect(json).toContain('Live Weather');
    expect(json).toContain('Instant Swap');
  });

  it('navigates to MainTabs when onboarding has been completed', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

    act(() => {
      renderer.create(
        <SplashScreen navigation={mockNavigation} route={{} as any} />,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(2200);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('MainTabs', {
      screen: 'Plan',
    });
  });

  it('navigates to Onboarding when onboarding has not been completed', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    act(() => {
      renderer.create(
        <SplashScreen navigation={mockNavigation} route={{} as any} />,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(2200);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('Onboarding');
  });

  it('handles AsyncStorage error gracefully by falling back to Onboarding', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('Disk Read Failure'),
    );

    act(() => {
      renderer.create(
        <SplashScreen navigation={mockNavigation} route={{} as any} />,
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(2200);
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('Onboarding');
  });

  it('unmounts cleanly and clears timer before navigation fires', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <SplashScreen navigation={mockNavigation} route={{} as any} />,
      );
    });

    act(() => {
      tree.unmount();
    });

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});
