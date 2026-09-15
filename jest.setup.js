/* eslint-disable no-undef */
import 'react-native-gesture-handler/jestSetup';

// In-memory AsyncStorage mock (prefixed with 'mock' for Jest scope rule)
const mockStorageMap = new Map();
const mockAsyncStorage = {
  setItem: jest.fn((key, value) => {
    mockStorageMap.set(key, String(value));
    return Promise.resolve(null);
  }),
  getItem: jest.fn(key => {
    return Promise.resolve(
      mockStorageMap.has(key) ? mockStorageMap.get(key) : null,
    );
  }),
  removeItem: jest.fn(key => {
    mockStorageMap.delete(key);
    return Promise.resolve(null);
  }),
  clear: jest.fn(() => {
    mockStorageMap.clear();
    return Promise.resolve(null);
  }),
  getAllKeys: jest.fn(() => {
    return Promise.resolve(Array.from(mockStorageMap.keys()));
  }),
  multiGet: jest.fn(keys => {
    return Promise.resolve(
      keys.map(k => [k, mockStorageMap.has(k) ? mockStorageMap.get(k) : null]),
    );
  }),
  multiSet: jest.fn(keyValuePairs => {
    keyValuePairs.forEach(([k, v]) => mockStorageMap.set(k, String(v)));
    return Promise.resolve(null);
  }),
  multiRemove: jest.fn(keys => {
    keys.forEach(k => mockStorageMap.delete(k));
    return Promise.resolve(null);
  }),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence warning from Reanimated
global.__reanimatedWorkletInit = jest.fn();

// Mock Safe Area Context with React Contexts
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const {View} = require('react-native');
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  const frame = {x: 0, y: 0, width: 375, height: 812};
  const SafeAreaInsetsContext = React.createContext(inset);
  const SafeAreaFrameContext = React.createContext(frame);
  return {
    SafeAreaProvider: ({children}) => (
      <SafeAreaInsetsContext.Provider value={inset}>
        <SafeAreaFrameContext.Provider value={frame}>
          {children}
        </SafeAreaFrameContext.Provider>
      </SafeAreaInsetsContext.Provider>
    ),
    SafeAreaConsumer: ({children}) => children(inset),
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    SafeAreaView: ({children, style}) => <View style={style}>{children}</View>,
    initialWindowMetrics: {insets: inset, frame},
  };
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MockMapView = props => (
    <View testID="mock-map-view" {...props}>
      {props.children}
    </View>
  );
  const MockMarker = props => (
    <View testID="mock-map-marker" {...props}>
      {props.children}
    </View>
  );
  const MockPolyline = props => <View testID="mock-map-polyline" {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    PROVIDER_DEFAULT: 'default',
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock Lucide React Native Icons with Proxy
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const {View} = require('react-native');
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        return props => <View testID={`icon-${String(prop)}`} {...props} />;
      },
    },
  );
});

// Mock @react-native-community/blur
jest.mock('@react-native-community/blur', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    BlurView: props => (
      <View testID="blur-view" {...props}>
        {props.children}
      </View>
    ),
  };
});

// Mock react-native-screens with all native stack view components
jest.mock('react-native-screens', () => {
  const {View} = require('react-native');
  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => true),
    ScreenContainer: View,
    Screen: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderBackButtonImage: View,
    ScreenStackHeaderRightView: View,
    ScreenStackHeaderLeftView: View,
    ScreenStackHeaderCenterView: View,
    ScreenStackHeaderSearchBarView: View,
    SearchBar: View,
    FullWindowOverlay: View,
  };
});

// Mock virtual @env module
jest.mock(
  '@env',
  () => ({
    GEMINI_API_KEY: 'test-gemini-key',
    OPENWEATHER_API_KEY: 'test-openweather-key',
  }),
  {virtual: true},
);
