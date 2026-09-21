import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import renderer, {act} from 'react-test-renderer';
import {store} from '../../src/store';
import {RootNavigator} from '../../src/navigation/RootNavigator';

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders root navigation stack without crashing', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <SafeAreaProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </Provider>,
      );
    });

    expect(tree).toBeDefined();
  });
});
