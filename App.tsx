import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { RootNavigator } from './src/navigation/RootNavigator';
import { store, AppDispatch } from './src/store';
import { loadSavedTrips } from './src/store/savedTripsSlice';
import { hydrateCachedItinerary } from './src/store/itinerarySlice';

/**
 * AppInitializer runs on startup to hydrate cached active itineraries
 * and load offline saved trips from AsyncStorage into Redux memory.
 */
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadSavedTrips());
    dispatch(hydrateCachedItinerary());
  }, [dispatch])

  return <>{children}</>
}

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <AppInitializer>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AppInitializer>
    </Provider>
  );
}

export default App;
